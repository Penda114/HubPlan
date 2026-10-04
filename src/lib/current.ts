import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "./db";
import type { Project, Role, User } from "@prisma/client";

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

  const project = await prisma.project.create({
    data: {
      name: "Mon jeu",
      key: "GAME",
      memberships: { create: { userId, role: "OWNER" } },
      categories: { create: DEFAULT_CATEGORIES },
      boards: {
        create: { name: "Sprint 1", isDefault: true, description: "Itération courante" },
      },
    },
  });
  return { project, role: "OWNER" };
}

/** Contexte courant complet pour les pages et actions. */
export async function getContext() {
  const user = await getCurrentUser();
  const { project, role } = await getActiveProject(user.id);
  return { user, project, role };
}

export function canEdit(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}

export function canManage(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}
