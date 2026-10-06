/**
 * Nom du dépôt GitHub du jeu, utilisé comme titre de l'application.
 * Configuré via GITHUB_OWNER / GITHUB_REPO (.env), avec cache d'une heure.
 * Retourne `null` si la configuration est absente.
 */
export async function getRepoName(): Promise<string | null> {
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  if (!owner || !repo) return null;

  const token = process.env.GITHUB_TOKEN?.trim();
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return repo;
    const data = (await res.json()) as { name?: string };
    return data.name ?? repo;
  } catch {
    // En cas d'échec réseau, on retombe sur le nom configuré.
    return repo;
  }
}
