import { prisma } from "./db";
import type { Option, WorkItemDTO } from "./types";

export async function listWorkItems(projectId: string): Promise<WorkItemDTO[]> {
  const items = await prisma.workItem.findMany({
    where: { projectId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      category: true,
      board: true,
      designElement: true,
      assignees: true,
      _count: { select: { children: true } },
      timeSessions: { select: { seconds: true } },
    },
  });

  return items.map((i) => ({
    id: i.id,
    type: i.type,
    title: i.title,
    description: i.description,
    stage: i.stage,
    importance: i.importance,
    boardId: i.boardId,
    categoryId: i.categoryId,
    designElementId: i.designElementId,
    parentId: i.parentId,
    categoryName: i.category?.name ?? null,
    categoryColor: i.category?.color ?? null,
    boardName: i.board?.name ?? null,
    designElementName: i.designElement?.name ?? null,
    assigneeIds: i.assignees.map((a) => a.id),
    assigneeNames: i.assignees.map((a) => a.name ?? a.login ?? "?"),
    subtaskCount: i._count.children,
    loggedSeconds: i.timeSessions.reduce((sum, s) => sum + s.seconds, 0),
  }));
}

export async function listCategories(projectId: string): Promise<Option[]> {
  const rows = await prisma.category.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
  return rows.map((c) => ({ id: c.id, name: c.name, color: c.color }));
}

export async function listBoards(projectId: string) {
  return prisma.board.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: { milestone: true, _count: { select: { workItems: true } } },
  });
}

export async function listMilestones(projectId: string) {
  return prisma.milestone.findMany({
    where: { projectId },
    orderBy: { dueDate: "asc" },
    include: { _count: { select: { boards: true } } },
  });
}

export async function listDesignElements(projectId: string) {
  return prisma.designElement.findMany({
    where: { projectId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { workItems: true, children: true } } },
  });
}

export async function countMembers(projectId: string) {
  return prisma.membership.count({ where: { projectId } });
}

export async function listProposals(projectId: string) {
  return prisma.proposal.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      votes: { select: { choice: true, userId: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function getProposal(projectId: string, id: string) {
  return prisma.proposal.findFirst({
    where: { id, projectId },
    include: {
      author: true,
      tasks: { orderBy: { order: "asc" } },
      delegations: { include: { user: true } },
      votes: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function listTickets(projectId: string) {
  return prisma.ticket.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      assignee: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function getTicket(projectId: string, id: string) {
  return prisma.ticket.findFirst({
    where: { id, projectId },
    include: {
      author: true,
      assignee: true,
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function listWikiPages(projectId: string) {
  return prisma.wikiPage.findMany({
    where: { projectId },
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true, updatedAt: true },
  });
}

export async function getWikiPage(projectId: string, slug: string) {
  return prisma.wikiPage.findUnique({
    where: { projectId_slug: { projectId, slug } },
  });
}

export async function listMembers(projectId: string) {
  const rows = await prisma.membership.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { id: "asc" },
  });
  return rows.map((m) => ({
    id: m.user.id,
    name: m.user.name ?? m.user.login ?? "?",
    role: m.role,
  }));
}
