export type Stage = "PLANNED" | "IN_PROGRESS" | "TESTING" | "COMPLETED";
export type Importance = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ItemType = "TASK" | "USER_STORY" | "BUG" | "FEATURE";

export const STAGES: { id: Stage; label: string }[] = [
  { id: "PLANNED", label: "Planifié" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "TESTING", label: "En test" },
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
  { id: "USER_STORY", label: "Récit utilisateur", color: "#a855f7" },
  { id: "BUG", label: "Anomalie", color: "#ef4444" },
  { id: "FEATURE", label: "Fonctionnalité", color: "#10b981" },
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
  loggedSeconds: number;
};

/** Formate une durée en secondes, ex. « 2 h 05 » ou « 12 min ». */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")}`;
  return `${minutes} min`;
}

export type Option = { id: string; name: string; color?: string };

export const PROPOSAL_STATUS_LABELS: Record<"OUVERTE" | "ADOPTEE" | "REJETEE", string> = {
  OUVERTE: "En vote",
  ADOPTEE: "Adoptée",
  REJETEE: "Rejetée",
};

export const TICKET_STATUS_LABELS: Record<
  "OUVERTE" | "EN_COURS" | "RESOLUE" | "FERMEE",
  string
> = {
  OUVERTE: "Ouverte",
  EN_COURS: "En cours",
  RESOLUE: "Résolue",
  FERMEE: "Fermée",
};
