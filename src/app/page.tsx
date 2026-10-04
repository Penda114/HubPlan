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

export default async function Home() {
  const { user, project, role } = await getContext();
  const [items, categories, boards, designElements, members] = await Promise.all([
    listWorkItems(project.id),
    listCategories(project.id),
    listBoards(project.id),
    listDesignElements(project.id),
    listMembers(project.id),
  ]);

  return (
    <main className="p-4">
      <Header project={project} user={user} role={role} current="/" />

      <Board
        items={items}
        categories={categories}
        boards={boards.map((b) => ({ id: b.id, name: b.name }))}
        designElements={designElements.map((d) => ({ id: d.id, name: d.name }))}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
        canEdit={canEdit(role)}
      />
    </main>
  );
}
