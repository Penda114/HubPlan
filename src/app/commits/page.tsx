import Header from "@/components/header";
import { getContext } from "@/lib/current";
import { prisma } from "@/lib/db";
import { getRecentCommits, getRepoInfo, type GitCommit } from "@/lib/github";

export const dynamic = "force-dynamic";

/** « il y a 5 min », « il y a 2 h », « il y a 3 j »… */
function timeAgo(iso: string | null): string {
  if (!iso) return "date inconnue";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 31) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function firstLine(message: string): string {
  return message.split("\n")[0];
}

export default async function CommitsPage() {
  const { user, project, role } = await getContext();
  const [commits, users, repo] = await Promise.all([
    getRecentCommits(15),
    prisma.user.findMany({ select: { login: true, name: true } }),
    Promise.resolve(getRepoInfo()),
  ]);

  const appUsers = new Map(
    users
      .filter((u) => u.login)
      .map((u) => [u.login!.toLowerCase(), u.name ?? u.login!]),
  );
  const authorLabel = (c: GitCommit) =>
    (c.authorLogin ? appUsers.get(c.authorLogin.toLowerCase()) : null) ??
    c.authorName ??
    c.authorLogin ??
    "Inconnu";

  const latest = commits?.[0] ?? null;

  return (
    <main className="mx-auto w-[95%] py-6">
      <Header project={project} user={user} role={role} current="/commits" />

      <h2 className="text-sm font-semibold text-neutral-300 mb-1">Suivi des commits</h2>
      <p className="text-xs text-neutral-500 mb-5">
        {repo
          ? `Derniers commits du dépôt ${repo.owner}/${repo.repo}.`
          : "Dépôt non configuré : renseigne GITHUB_OWNER et GITHUB_REPO."}
      </p>

      {!commits ? (
        <p className="text-neutral-500 text-sm">
          Impossible de récupérer les commits. Vérifie la configuration du dépôt et, s&apos;il est
          privé, le jeton GITHUB_TOKEN.
        </p>
      ) : commits.length === 0 ? (
        <p className="text-neutral-500 text-sm">Aucun commit pour l&apos;instant.</p>
      ) : (
        <>
          {latest && (
            <section className="bg-neutral-900 rounded p-4 mb-6">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-3">
                Dernier commit
              </p>
              <div className="flex items-start gap-3">
                {latest.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={latest.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full bg-neutral-800 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{authorLabel(latest)}</span>
                    {latest.authorLogin && (
                      <span className="text-neutral-500"> · @{latest.authorLogin}</span>
                    )}
                  </p>
                  <p className="text-sm mt-1 break-words">{firstLine(latest.message)}</p>
                  <p className="text-xs text-neutral-500 mt-1.5 flex items-center gap-2 flex-wrap">
                    <span>{timeAgo(latest.date)}</span>
                    <span className="text-neutral-700">·</span>
                    <span className="font-mono text-neutral-400">{latest.shortSha}</span>
                    <span className="text-neutral-700">·</span>
                    <a href={latest.url} className="hover:text-neutral-300 underline">
                      voir sur GitHub
                    </a>
                  </p>
                </div>
              </div>
            </section>
          )}

          <ul className="space-y-2">
            {commits.slice(1).map((c) => (
              <li
                key={c.sha}
                className="flex items-start gap-3 bg-neutral-900/60 rounded px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words">{firstLine(c.message)}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{authorLabel(c)}</span>
                    <span className="text-neutral-700">·</span>
                    <span>{timeAgo(c.date)}</span>
                    <span className="text-neutral-700">·</span>
                    <span className="font-mono text-neutral-400">{c.shortSha}</span>
                  </p>
                </div>
                <a
                  href={c.url}
                  className="text-xs text-neutral-500 hover:text-neutral-300 shrink-0"
                >
                  GitHub
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
