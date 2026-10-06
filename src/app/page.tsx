import Header from "@/components/header";
import { canEdit, getContext } from "@/lib/current";
import {
  listBoards,
  listCategories,
  listDesignElements,
  listMembers,
  listWorkItems,
} from "@/lib/data";
import Board from "./board";

export const dynamic = "force-dynamic";

/** Message lisible sur le temps restant avant l'échéance d'un sprint. */
function remainingLabel(dueDate: Date): string {
  const days = Math.ceil((dueDate.getTime() - Date.now()) / 86_400_000);
  if (days > 1) return `${days} jours restants`;
  if (days === 1) return "dernier jour";
  if (days === 0) return "échéance aujourd'hui";
  return `échéance dépassée de ${Math.abs(days)} jour(s)`;
}

export default async function Home() {
  const { user, project, role } = await getContext();
  const [items, categories, boards, designElements, members] = await Promise.all([
    listWorkItems(project.id),
    listCategories(project.id),
    listBoards(project.id),
    listDesignElements(project.id),
    listMembers(project.id),
  ]);

  const sprint = boards.find((b) => b.isDefault) ?? boards[0] ?? null;

  return (
    <main className="mx-auto w-[95%] py-6">
      <Header project={project} user={user} role={role} current="/" />

      {sprint && (
        <p className="text-sm text-neutral-400 mb-4">
          Sprint en cours : <span className="text-neutral-200">{sprint.name}</span>
          {" — "}
          {sprint.dueDate
            ? `${remainingLabel(sprint.dueDate)} · échéance le ${sprint.dueDate.toLocaleDateString(
                "fr-FR",
                { day: "numeric", month: "long" },
              )}`
            : "aucune échéance définie"}
        </p>
      )}

      <Board
        items={items}
        categories={categories}
        boards={boards.map((b) => ({ id: b.id, name: b.name }))}
        designElements={designElements.map((d) => ({ id: d.id, name: d.name }))}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
        currentUserId={user.id}
        canEdit={canEdit(role)}
      />
    </main>
  );
}
