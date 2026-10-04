"use server";

import { auth } from "@/auth";
import { Octokit } from "octokit";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;

const COLUMNS = ["Backlog", "En cours", "Review", "Terminé"] as const;
export type Column = (typeof COLUMNS)[number];

export type Issue = {
  id: number;
  number: number;
  title: string;
  url: string;
  column: Column;
};

const COLUMN_PREFIX = "col:";

function columnOfIssue(labels: { name: string }[]): Column {
  for (const l of labels) {
    const name = l.name.trim();
    if (!name.toLowerCase().startsWith(COLUMN_PREFIX)) continue;
    const c = name.slice(COLUMN_PREFIX.length).trim().toLowerCase();
    const found = COLUMNS.find((col) => col.toLowerCase() === c);
    if (found) return found;
  }
  return "Backlog";
}

export async function getIssues(): Promise<Issue[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Pas de token");
  const octokit = new Octokit({ auth: session.accessToken });
  const res = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner: OWNER,
    repo: REPO,
    state: "open",
    per_page: 100,
  });
  return res.data
    .filter((i) => !("pull_request" in i && i.pull_request))
    .map((i) => ({
      id: Number(i.id),
      number: i.number,
      title: i.title,
      url: i.html_url,
      column: columnOfIssue(i.labels as { name: string }[]),
    }));
}

export async function moveIssue(number: number, column: Column): Promise<void> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Pas de token");
  const octokit = new Octokit({ auth: session.accessToken });

  // Conserver les labels qui ne concernent pas les colonnes, ne remplacer que la colonne.
  const { data: issue } = await octokit.request("GET /repos/{owner}/{repo}/issues/{issue_number}", {
    owner: OWNER,
    repo: REPO,
    issue_number: number,
  });
  const kept = (issue.labels as (string | { name?: string })[])
    .map((l) => (typeof l === "string" ? l : l.name))
    .filter(
      (name): name is string =>
        !!name && !name.trim().toLowerCase().startsWith(COLUMN_PREFIX),
    );

  await octokit.request("PUT /repos/{owner}/{repo}/issues/{issue_number}/labels", {
    owner: OWNER,
    repo: REPO,
    issue_number: number,
    labels: [...kept, `${COLUMN_PREFIX}${column}`],
  });
}
