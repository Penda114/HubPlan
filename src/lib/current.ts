import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRepoName } from "./github";
import { prisma } from "./db";
import { Prisma, type Project, type Role, type User } from "@prisma/client";

export const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
  { name: "Programming", color: "#3b82f6" },
  { name: "Design", color: "#a855f7" },
  { name: "Art", color: "#ec4899" },
  { name: "Audio", color: "#f59e0b" },
  { name: "Production", color: "#10b981" },
  { name: "QA", color: "#ef4444" },
  { name: "Marketing", color: "#eab308" },
];

export type CurrentUser = User;

const DEFAULT_PROJECT_NAME = "Mon jeu";

/** Slug de clé à partir d'un nom de projet (ex. « Mon jeu » -> « MONJEU »). */
function baseProjectKey(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
  return slug || "PROJET";
}

/**
 * `Project.key` est unique globalement : on ne peut donc pas réutiliser une clé
 * constante (l'ancien `"GAME"` faisait planter le 2e utilisateur). On suffixe
 * jusqu'à trouver une clé libre.
 */
async function uniqueProjectKey(base: string): Promise<string> {
  const isTaken = (key: string) =>
    prisma.project.findUnique({ where: { key }, select: { id: true } });
  if (!(await isTaken(base))) return base;
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const candidate = `${base.slice(0, 11)}-${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new Error("Impossible de générer une clé de projet unique");
}

/** Récupère (ou crée) l'utilisateur correspondant à la session GitHub. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth();
  const githubId = session?.user?.githubId;
  if (!githubId) redirect("/api/auth/signin");

  return prisma.user.upsert({
    where: { githubId },
    update: {
      name: session!.user.name ?? undefined,
      email: session!.user.email ?? undefined,
      image: session!.user.image ?? undefined,
      login: session!.user.login ?? undefined,
    },
    create: {
      githubId,
      name: session!.user.name ?? null,
      email: session!.user.email ?? null,
      image: session!.user.image ?? null,
      login: session!.user.login ?? null,
    },
  });
}

/** Projet actif : le premier dont l'utilisateur est membre, sinon on en crée un. */
export async function getActiveProject(
  userId: string,
): Promise<{ project: Project; role: Role }> {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { project: { createdAt: "asc" } },
    include: { project: true },
  });
  if (membership) {
    return { project: membership.project, role: membership.role };
  }

  const base = baseProjectKey(DEFAULT_PROJECT_NAME);
  for (let attempt = 0; ; attempt++) {
    try {
      const project = await prisma.project.create({
        data: {
          name: DEFAULT_PROJECT_NAME,
          key: await uniqueProjectKey(base),
          memberships: { create: { userId, role: "OWNER" } },
          categories: { create: DEFAULT_CATEGORIES },
          boards: {
            create: { name: "Sprint 1", isDefault: true, description: "Itération courante" },
          },
        },
      });
      return { project, role: "OWNER" as const };
    } catch (error) {
      // Course entre deux créations : on retente avec une autre clé.
      const isKeyCollision =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isKeyCollision || attempt >= 3) throw error;
    }
  }
}

/** Aligne le nom du projet sur le nom du dépôt GitHub du jeu (titre dynamique). */
async function syncProjectName(project: Project): Promise<Project> {
  const repoName = await getRepoName();
  if (!repoName || project.name === repoName) return project;
  return prisma.project.update({ where: { id: project.id }, data: { name: repoName } });
}

/** Contexte courant complet pour les pages et actions. */
export async function getContext() {
  const user = await getCurrentUser();
  const { project, role } = await getActiveProject(user.id);
  return { user, project: await syncProjectName(project), role };
}

export function canEdit(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}

export function canManage(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}
