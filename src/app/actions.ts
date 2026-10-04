"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { canEdit, canManage, getContext } from "@/lib/current";
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
  estimatedCost?: number | null;
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
      estimatedCost:
        input.estimatedCost != null && !Number.isNaN(input.estimatedCost)
          ? input.estimatedCost
          : null,
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
      estimatedCost:
        input.estimatedCost != null && !Number.isNaN(input.estimatedCost)
          ? input.estimatedCost
          : null,
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

export async function logWork(id: string, hours: number, note?: string): Promise<void> {
  const { user, project, role } = await getContext();
  if (!canEdit(role)) throw new Error("Droits insuffisants");
  if (!(hours > 0)) throw new Error("Durée invalide");
  await assertItemInProject(project.id, id);
  await prisma.workLog.create({
    data: { workItemId: id, userId: user.id, hours, note: str(note) },
  });
  revalidatePath("/");
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
