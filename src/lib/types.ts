export type Stage = "PLANNED" | "IN_PROGRESS" | "TESTING" | "COMPLETED";
export type Importance = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ItemType = "TASK" | "USER_STORY" | "BUG" | "FEATURE";

export const STAGES: { id: Stage; label: string }[] = [
  { id: "PLANNED", label: "Planifié" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "TESTING", label: "Test" },
  { id: "COMPLETED", label: "Terminé" },
];

export const IMPORTANCES: { id: Importance; label: string; color: string }[] = [
  { id: "CRITICAL", label: "Critique", color: "#ef4444" },
  { id: "HIGH", label: "Haute", color: "#f97316" },
  { id: "MEDIUM", label: "Moyenne", color: "#eab308" },
  { id: "LOW", label: "Basse", color: "#22c55e" },
];

export const ITEM_TYPES: { id: ItemType; label: string; color: string }[] = [
  { id: "TASK", label: "Tâche", color: "#3b82f6" },
  { id: "USER_STORY", label: "User story", color: "#a855f7" },
  { id: "BUG", label: "Bug", color: "#ef4444" },
  { id: "FEATURE", label: "Feature", color: "#10b981" },
];

export function stageLabel(stage: Stage): string {
  return STAGES.find((s) => s.id === stage)?.label ?? stage;
}

export function importanceMeta(i: Importance) {
  return IMPORTANCES.find((x) => x.id === i) ?? IMPORTANCES[2];
}

export type WorkItemDTO = {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  stage: Stage;
  importance: Importance;
  estimatedCost: number | null;
  boardId: string | null;
  categoryId: string | null;
  designElementId: string | null;
  parentId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  boardName: string | null;
  designElementName: string | null;
  assigneeIds: string[];
  assigneeNames: string[];
  subtaskCount: number;
  loggedHours: number;
};

export type Option = { id: string; name: string; color?: string };
