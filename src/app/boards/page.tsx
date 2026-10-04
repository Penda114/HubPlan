import Header from "@/components/header";
import { canEdit, canManage, getContext } from "@/lib/current";
import { listBoards, listMilestones } from "@/lib/data";
import {
  assignBoardToMilestone,
  createBoard,
  createMilestone,
  deleteBoard,
  deleteMilestone,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const { user, project, role } = await getContext();
  const [boards, milestones] = await Promise.all([
    listBoards(project.id),
    listMilestones(project.id),
  ]);
  const editable = canEdit(role);
  const manage = canManage(role);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <Header project={project} user={user} role={role} current="/boards" />

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-300 mb-2">Milestones (roadmap)</h2>
        <ul className="space-y-2 mb-3">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 bg-neutral-900 rounded px-3 py-2 text-sm"
            >
              <span className="font-medium">{m.name}</span>
              <span className="text-neutral-500 text-xs">
                {m._count.boards} board(s)
                {m.dueDate ? ` · échéance ${m.dueDate.toLocaleDateString("fr-FR")}` : ""}
              </span>
              {manage && (
                <form
                  className="ml-auto"
                  action={async () => {
                    "use server";
                    await deleteMilestone(m.id);
                  }}
                >
                  <button className="text-red-400 hover:text-red-300 text-xs">Supprimer</button>
                </form>
              )}
            </li>
          ))}
          {milestones.length === 0 && (
            <li className="text-neutral-500 text-sm">Aucun milestone.</li>
          )}
        </ul>
        {editable && (
          <form
            className="flex gap-2 text-sm"
            action={async (fd) => {
              "use server";
              await createMilestone(String(fd.get("name") ?? ""), (fd.get("dueDate") as string) || null);
            }}
          >
            <input
              name="name"
              placeholder="Nouveau milestone (ex. Alpha)"
              className="bg-neutral-800 rounded px-2 py-1.5 flex-1"
            />
            <input name="dueDate" type="date" className="bg-neutral-800 rounded px-2 py-1.5" />
            <button className="border border-neutral-700 rounded px-3 hover:bg-neutral-800">
              Ajouter
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-300 mb-2">Boards (sprints / itérations)</h2>
        <ul className="space-y-2 mb-3">
          {boards.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-3 bg-neutral-900 rounded px-3 py-2 text-sm flex-wrap"
            >
              <span className="font-medium">{b.name}</span>
              {b.isDefault && (
                <span className="text-[10px] uppercase bg-neutral-800 rounded px-1">défaut</span>
              )}
              <span className="text-neutral-500 text-xs">{b._count.workItems} élément(s)</span>
              {editable && (
                <form
                  className="flex items-center gap-2 ml-auto text-xs"
                  action={async (fd) => {
                    "use server";
                    const value = String(fd.get("milestoneId") ?? "");
                    await assignBoardToMilestone(b.id, value || null);
                  }}
                >
                  <select
                    name="milestoneId"
                    defaultValue={b.milestoneId ?? ""}
                    className="bg-neutral-800 rounded px-2 py-1"
                  >
                    <option value="">— sans milestone —</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <button className="border border-neutral-700 rounded px-2 py-1 hover:bg-neutral-800">
                    Lier
                  </button>
                </form>
              )}
              {manage && (
                <form
                  action={async () => {
                    "use server";
                    await deleteBoard(b.id);
                  }}
                >
                  <button className="text-red-400 hover:text-red-300 text-xs">Supprimer</button>
                </form>
              )}
            </li>
          ))}
          {boards.length === 0 && <li className="text-neutral-500 text-sm">Aucun board.</li>}
        </ul>
        {editable && (
          <form
            className="flex gap-2 text-sm"
            action={async (fd) => {
              "use server";
              await createBoard(String(fd.get("name") ?? ""));
            }}
          >
            <input
              name="name"
              placeholder="Nouveau board (ex. Sprint 2)"
              className="bg-neutral-800 rounded px-2 py-1.5 flex-1"
            />
            <button className="border border-neutral-700 rounded px-3 hover:bg-neutral-800">
              Ajouter
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
