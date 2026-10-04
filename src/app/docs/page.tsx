import Header from "@/components/header";
import { getContext } from "@/lib/current";
import { listBoards, listCategories, listDesignElements, listMilestones } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Docs() {
  const { user, project, role } = await getContext();
  const [categories, boards, milestones, designElements] = await Promise.all([
    listCategories(project.id),
    listBoards(project.id),
    listMilestones(project.id),
    listDesignElements(project.id),
  ]);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <Header project={project} user={user} role={role} current="/docs" />

      <h2 className="text-sm font-semibold text-neutral-300 mb-2">Documentation du projet</h2>
      <dl className="text-sm space-y-4">
        <div>
          <dt className="text-neutral-500 text-xs uppercase">Disciplines</dt>
          <dd>{categories.map((c) => c.name).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase">Boards</dt>
          <dd>{boards.map((b) => b.name).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase">Milestones</dt>
          <dd>{milestones.map((m) => m.name).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase">Éléments de design</dt>
          <dd>{designElements.map((d) => d.name).join(", ") || "—"}</dd>
        </div>
      </dl>
    </main>
  );
}
