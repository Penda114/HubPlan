import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Octokit } from "octokit";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export default async function Docs() {
  const session = await auth();
  // Idem : sans accessToken, la lecture du README échouerait systématiquement.
  if (!session?.user || !session.accessToken) redirect("/api/auth/signin");

  let html = "";
  try {
    const octokit = new Octokit({ auth: session.accessToken });
    const res = await octokit.request("GET /repos/{owner}/{repo}/readme", {
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      headers: { Accept: "application/vnd.github.raw+json" },
    });
    html = await marked.parse(String(res.data));
  } catch {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Erreur</p>
        <a href="/docs" className="border border-neutral-700 rounded px-4 py-2 hover:bg-neutral-800">
          Refresh
        </a>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href="/" className="text-sm text-neutral-500 hover:text-neutral-300 block mb-6">
        ← Retour au board
      </a>
      <article
        className="prose-neutral prose-invert [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-blue-400 [&_a]:underline [&_code]:bg-neutral-800 [&_code]:rounded [&_code]:px-1 [&_pre]:bg-neutral-800 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
