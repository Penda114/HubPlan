import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRepoName } from "./github";
import { prisma } from "./db";
import type { Project, Role, User } from "@prisma/client";

export const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
  { name: "Programmation", color: "#3b82f6" },
  { name: "Conception", color: "#a855f7" },
  { name: "Art", color: "#ec4899" },
  { name: "Audio", color: "#f59e0b" },
  { name: "Production", color: "#10b981" },
  { name: "Qualité", color: "#ef4444" },
  { name: "Marketing", color: "#eab308" },
];

export type CurrentUser = User;

const DEFAULT_PROJECT_NAME = "Mon jeu";
const DEFAULT_PROJECT_KEY = "JEU";

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

/**
 * L'application ne gère qu'un seul projet : tous les utilisateurs y travaillent.
 * Le premier à se connecter le crée ; les suivants y sont rattachés comme membres.
 */
export async function getActiveProject(
  userId: string,
): Promise<{ project: Project; role: Role }> {
  const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });

  if (!project) {
    const created = await prisma.project.create({
      data: {
        name: DEFAULT_PROJECT_NAME,
        key: DEFAULT_PROJECT_KEY,
        memberships: { create: { userId, role: "OWNER" } },
        categories: { create: DEFAULT_CATEGORIES },
        boards: {
          create: { name: "Sprint 1", isDefault: true, description: "Itération courante" },
        },
      },
    });
    return { project: created, role: "OWNER" };
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId: project.id } },
  });
  if (membership) return { project, role: membership.role };

  const joined = await prisma.membership.create({
    data: { userId, projectId: project.id, role: "MEMBER" },
  });
  return { project, role: joined.role };
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
