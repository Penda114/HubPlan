"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { canEdit, canManage, getContext, getCurrentUser } from "@/lib/current";
import type { Importance, ItemType, Stage } from "@/lib/types";

const STAGE_VALUES: Stage[] = ["PLANNED", "IN_PROGRESS", "TESTING", "COMPLETED"];
const IMPORTANCE_VALUES: Importance[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const TYPE_VALUES: ItemType[] = ["TASK", "USER_STORY", "BUG", "FEATURE"];

function str(v: string | null | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

async function assertItemInProject(projectId: string, id: string) {
  const item = await prisma.workItem.findFirst({ where: { id, projectId } });
  if (!item) throw new Error("Élément introuvable");
  return item;
}

type WorkItemInput = {
  title: string;
  type?: ItemType;
  description?: string | null;
  stage?: Stage;
  importance?: Importance;
  categoryId?: string | null;
  boardId?: string | null;
  designElementId?: string | null;
  parentId?: string | null;
  assigneeIds?: string[];
};

function cleanAssignees(ids?: string[]): string[] {
  return Array.from(new Set((ids ?? []).filter(Boolean)));
}

export async function createWorkItem(input: WorkItemInput): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const title = input.title?.trim();
  if (!title) throw new Error("Titre requis");

  const categoryId = str(input.categoryId);
  await prisma.workItem.create({
    data: {
      projectId: project.id,
      title,
      type: input.type && TYPE_VALUES.includes(input.type) ? input.type : "TASK",
      description: str(input.description),
      stage: input.stage && STAGE_VALUES.includes(input.stage) ? input.stage : "PLANNED",
      importance:
        input.importance && IMPORTANCE_VALUES.includes(input.importance)
          ? input.importance
          : "MEDIUM",
      categoryId,
      boardId: str(input.boardId),
      designElementId: str(input.designElementId),
      parentId: str(input.parentId),
      assignees: { connect: cleanAssignees(input.assigneeIds).map((id) => ({ id })) },
    },
  });
  revalidatePath("/");
}

export async function updateWorkItem(id: string, input: WorkItemInput): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await assertItemInProject(project.id, id);
  const title = input.title?.trim();
  if (!title) throw new Error("Titre requis");

  await prisma.workItem.update({
    where: { id },
    data: {
      title,
      type: input.type && TYPE_VALUES.includes(input.type) ? input.type : "TASK",
      description: str(input.description),
      stage: input.stage && STAGE_VALUES.includes(input.stage) ? input.stage : "PLANNED",
      importance:
        input.importance && IMPORTANCE_VALUES.includes(input.importance)
          ? input.importance
          : "MEDIUM",
      categoryId: str(input.categoryId),
      boardId: str(input.boardId),
      designElementId: str(input.designElementId),
      assignees: { set: cleanAssignees(input.assigneeIds).map((id) => ({ id })) },
    },
  });
  revalidatePath("/");
}

export async function setWorkItemStage(id: string, stage: Stage): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  if (!STAGE_VALUES.includes(stage)) throw new Error("Colonne invalide");
  await assertItemInProject(project.id, id);
  await prisma.workItem.update({
    where: { id },
    data: { stage, completedAt: stage === "COMPLETED" ? new Date() : null },
  });
  revalidatePath("/");
}

export async function deleteWorkItem(id: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await assertItemInProject(project.id, id);
  await prisma.workItem.delete({ where: { id } });
  revalidatePath("/");
}

// ---------------------------------------------------------------- Suivi du temps

/** Au-delà de cet écart entre deux battements, on considère la session interrompue. */
const MAX_HEARTBEAT_GAP_SECONDS = 40;

/** Ouvre une session de travail sur une tâche. */
export async function startTimeSession(workItemId: string): Promise<string> {
  const { user, project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await assertItemInProject(project.id, workItemId);
  const session = await prisma.timeSession.create({
    data: { userId: user.id, workItemId },
    select: { id: true },
  });
  return session.id;
}

/**
 * Enregistre un battement de cœur : on ajoute le temps écoulé depuis le dernier
 * battement, uniquement s'il est court (client resté actif et page visible).
 */
export async function heartbeatTimeSession(sessionId: string): Promise<number> {
  const { user } = await getContext();
  const session = await prisma.timeSession.findFirst({
    where: { id: sessionId, userId: user.id, endedAt: null },
  });
  if (!session) return 0;

  const now = new Date();
  const seconds = session.seconds + countGap(session.lastHeartbeatAt, now);
  await prisma.timeSession.update({
    where: { id: session.id },
    data: { seconds, lastHeartbeatAt: now },
  });
  return seconds;
}

/** Clôture une session (dernier battement inclus). */
export async function endTimeSession(sessionId: string): Promise<void> {
  const { user } = await getContext();
  const session = await prisma.timeSession.findFirst({
    where: { id: sessionId, userId: user.id, endedAt: null },
  });
  if (!session) return;

  const now = new Date();
  await prisma.timeSession.update({
    where: { id: session.id },
    data: {
      seconds: session.seconds + countGap(session.lastHeartbeatAt, now),
      lastHeartbeatAt: now,
      endedAt: now,
    },
  });
  revalidatePath("/");
}

function countGap(from: Date, to: Date): number {
  const gap = Math.round((to.getTime() - from.getTime()) / 1000);
  return gap > 0 && gap <= MAX_HEARTBEAT_GAP_SECONDS ? gap : 0;
}

// ---------------------------------------------------------------- Wiki

function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "page";
}

async function uniqueWikiSlug(projectId: string, base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (
    await prisma.wikiPage.findUnique({
      where: { projectId_slug: { projectId, slug: candidate } },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export async function createWikiPage(title: string, content: string): Promise<void> {
  const { user, project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const clean = title.trim();
  if (!clean) throw new Error("Titre requis");
  const slug = await uniqueWikiSlug(project.id, slugify(clean));
  await prisma.wikiPage.create({
    data: { projectId: project.id, slug, title: clean, content, authorId: user.id },
  });
  revalidatePath("/docs");
  redirect(`/docs/${slug}`);
}

export async function updateWikiPage(slug: string, title: string, content: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const clean = title.trim();
  if (!clean) throw new Error("Titre requis");
  await prisma.wikiPage.update({
    where: { projectId_slug: { projectId: project.id, slug } },
    data: { title: clean, content },
  });
  revalidatePath("/docs");
  revalidatePath(`/docs/${slug}`);
}

export async function deleteWikiPage(slug: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await prisma.wikiPage.deleteMany({ where: { slug, projectId: project.id } });
  revalidatePath("/docs");
  redirect("/docs");
}

// ---------------------------------------------------------------- Médias

export async function createMedia(url: string, title: string, kind: string): Promise<void> {
  const { user, project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const cleanUrl = url.trim();
  if (!cleanUrl) throw new Error("URL requise");
  await prisma.media.create({
    data: {
      projectId: project.id,
      url: cleanUrl,
      title: title.trim() || cleanUrl,
      kind: kind.trim() || "image",
      authorId: user.id,
    },
  });
  revalidatePath("/media");
}

export async function deleteMedia(id: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await prisma.media.deleteMany({ where: { id, projectId: project.id } });
  revalidatePath("/media");
}

// ---------------------------------------------------------------- Projets

/** Rejoint un projet existant à partir de sa clé, puis renvoie son nom. */
export async function joinProject(rawKey: string): Promise<string> {
  const user = await getCurrentUser();
  const key = rawKey.trim().toUpperCase();
  if (!key) throw new Error("Clé requise");

  const project = await prisma.project.findUnique({ where: { key } });
  if (!project) throw new Error("Aucun projet ne correspond à cette clé");

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
    update: {},
    create: { userId: user.id, projectId: project.id, role: "MEMBER" },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  return project.name;
}

// ---------------------------------------------------------------- Boards

export async function createBoard(name: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const clean = name.trim();
  if (!clean) throw new Error("Nom requis");
  await prisma.board.create({ data: { projectId: project.id, name: clean } });
  revalidatePath("/boards");
}

export async function assignItemToBoard(itemId: string, boardId: string | null): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await assertItemInProject(project.id, itemId);
  await prisma.workItem.update({ where: { id: itemId }, data: { boardId: str(boardId) } });
  revalidatePath("/");
  revalidatePath("/boards");
}

export async function deleteBoard(id: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canManage(role)) throw new Error("Droits insuffisants");
  await prisma.board.deleteMany({ where: { id, projectId: project.id } });
  revalidatePath("/boards");
}

// ---------------------------------------------------------------- Milestones

export async function createMilestone(name: string, dueDate?: string | null): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const clean = name.trim();
  if (!clean) throw new Error("Nom requis");
  await prisma.milestone.create({
    data: {
      projectId: project.id,
      name: clean,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  revalidatePath("/boards");
}

export async function deleteMilestone(id: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canManage(role)) throw new Error("Droits insuffisants");
  await prisma.milestone.deleteMany({ where: { id, projectId: project.id } });
  revalidatePath("/boards");
}

export async function assignBoardToMilestone(
  boardId: string,
  milestoneId: string | null,
): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await prisma.board.updateMany({
    where: { id: boardId, projectId: project.id },
    data: { milestoneId: str(milestoneId) },
  });
  revalidatePath("/boards");
}

// ---------------------------------------------------------------- GDM

export async function createDesignElement(
  name: string,
  type: string,
  parentId?: string | null,
): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const clean = name.trim();
  if (!clean) throw new Error("Nom requis");
  await prisma.designElement.create({
    data: {
      projectId: project.id,
      name: clean,
      type: type.trim() || "Élément",
      parentId: str(parentId),
    },
  });
  revalidatePath("/design");
}

export async function updateDesignElement(
  id: string,
  data: { name: string; type: string; description?: string | null },
): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  const clean = data.name.trim();
  if (!clean) throw new Error("Nom requis");
  await prisma.designElement.updateMany({
    where: { id, projectId: project.id },
    data: { name: clean, type: data.type.trim() || "Élément", description: str(data.description) },
  });
  revalidatePath("/design");
}

export async function moveDesignElement(id: string, parentId: string | null): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  if (parentId === id) throw new Error("Un élément ne peut pas être son propre parent");
  await prisma.designElement.updateMany({
    where: { id, projectId: project.id },
    data: { parentId: str(parentId) },
  });
  revalidatePath("/design");
}

export async function deleteDesignElement(id: string): Promise<void> {
  const { project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  await prisma.designElement.deleteMany({ where: { id, projectId: project.id } });
  revalidatePath("/design");
}
