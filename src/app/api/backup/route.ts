import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import { auth } from "@/auth";
import { exportAll } from "@/lib/export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Autorise soit un cron Vercel (CRON_SECRET), soit un utilisateur connecté. */
async function isAuthorized(req: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  const session = await auth();
  return Boolean(session?.user);
}

async function runBackup() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN, GITHUB_OWNER et GITHUB_REPO doivent être configurés." },
      { status: 500 },
    );
  }

  const data = await exportAll();
  const content = JSON.stringify(data, null, 2);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `backups/hubplan-${stamp}.json`;

  const octokit = new Octokit({ auth: token });
  const res = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `chore: sauvegarde HubPlan ${new Date().toISOString()}`,
    content: Buffer.from(content, "utf-8").toString("base64"),
  });

  return NextResponse.json({ ok: true, path, url: res.data.commit.html_url ?? null });
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return runBackup();
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return runBackup();
}
