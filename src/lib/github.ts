/** Dépôt GitHub du jeu, configuré via GITHUB_OWNER / GITHUB_REPO. */
export function getRepoInfo(): { owner: string; repo: string } | null {
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  return owner && repo ? { owner, repo } : null;
}

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Nom du dépôt GitHub du jeu, utilisé comme titre de l'application.
 * Retourne `null` si la configuration est absente.
 */
export async function getRepoName(): Promise<string | null> {
  const info = getRepoInfo();
  if (!info) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return info.repo;
    const data = (await res.json()) as { name?: string };
    return data.name ?? info.repo;
  } catch {
    // En cas d'échec réseau, on retombe sur le nom configuré.
    return info.repo;
  }
}

export type GitCommit = {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string | null;
  authorLogin: string | null;
  avatarUrl: string | null;
  date: string | null;
  url: string;
};

/** Derniers commits du dépôt (du plus récent au plus ancien). */
export async function getRecentCommits(limit = 15): Promise<GitCommit[] | null> {
  const info = getRepoInfo();
  if (!info) return null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${info.owner}/${info.repo}/commits?per_page=${limit}`,
      { headers: githubHeaders(), next: { revalidate: 60 } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author: { name?: string; date?: string } | null };
      author: { login?: string; avatar_url?: string } | null;
    }>;

    return data.map((c) => ({
      sha: c.sha,
      shortSha: c.sha.slice(0, 7),
      message: c.commit.message,
      authorName: c.commit.author?.name ?? null,
      authorLogin: c.author?.login ?? null,
      avatarUrl: c.author?.avatar_url ?? null,
      date: c.commit.author?.date ?? null,
      url: c.html_url,
    }));
  } catch {
    return null;
  }
}
