import type { ReactNode } from "react";
import Header from "@/components/header";
import { canEdit, getContext } from "@/lib/current";
import { listDesignElements } from "@/lib/data";
import {
  createDesignElement,
  deleteDesignElement,
  moveDesignElement,
  updateDesignElement,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function DesignPage() {
  const { user, project, role } = await getContext();
  const elements = await listDesignElements(project.id);
  const editable = canEdit(role);

  const childrenOf = new Map<string | null, typeof elements>();
  for (const el of elements) {
    const list = childrenOf.get(el.parentId) ?? [];
    list.push(el);
    childrenOf.set(el.parentId, list);
  }

  function renderTree(parentId: string | null, depth: number): ReactNode {
    const nodes = childrenOf.get(parentId) ?? [];
    if (nodes.length === 0) return null;
    return (
      <ul className="space-y-1">
        {nodes.map((el) => (
          <li key={el.id}>
            <div
              className="bg-neutral-900 rounded px-3 py-2 text-sm"
              style={{ marginLeft: depth * 20 }}
            >
              {editable ? (
                <form
                  className="flex items-center gap-2 flex-wrap"
                  action={async (fd) => {
                    "use server";
                    await updateDesignElement(el.id, {
                      name: String(fd.get("name") ?? ""),
                      type: String(fd.get("type") ?? ""),
                      description: (fd.get("description") as string) || null,
                    });
                  }}
                >
                  <input
                    name="name"
                    defaultValue={el.name}
                    className="bg-neutral-800 rounded px-2 py-1 flex-1 min-w-[10rem]"
                  />
                  <input
                    name="type"
                    defaultValue={el.type}
                    className="bg-neutral-800 rounded px-2 py-1 w-40"
                  />
                  <button className="border border-neutral-700 rounded px-2 py-1 hover:bg-neutral-800 text-xs">
                    Enregistrer
                  </button>
                </form>
              ) : (
                <span className="font-medium">{el.name}</span>
              )}

              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                <span>{el._count.workItems} tâche(s)</span>
                {el._count.children > 0 && <span>· {el._count.children} enfant(s)</span>}
                {editable && (
                  <div className="ml-auto flex items-center gap-2">
                    <form
                      className="flex items-center gap-1"
                      action={async (fd) => {
                        "use server";
                        const value = String(fd.get("parentId") ?? "");
                        await moveDesignElement(el.id, value || null);
                      }}
                    >
                      <select
                        name="parentId"
                        defaultValue={el.parentId ?? ""}
                        className="bg-neutral-800 rounded px-1 py-0.5"
                      >
                        <option value="">— racine —</option>
                        {elements
                          .filter((o) => o.id !== el.id)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                      </select>
                      <button className="border border-neutral-700 rounded px-1.5 py-0.5 hover:bg-neutral-800">
                        Déplacer
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteDesignElement(el.id);
                      }}
                    >
                      <button className="text-red-400 hover:text-red-300">Suppr.</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
            {renderTree(el.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <Header project={project} user={user} role={role} current="/design" />

      <p className="text-sm text-neutral-400 mb-4">
        Le modèle de conception relie les éléments de conception (mécaniques, niveaux,
        personnages, narration) aux tâches de production.
      </p>

      {editable && (
        <form
          className="flex gap-2 text-sm mb-4 flex-wrap bg-neutral-900 rounded p-3"
          action={async (fd) => {
            "use server";
            await createDesignElement(
              String(fd.get("name") ?? ""),
              String(fd.get("type") ?? ""),
              (fd.get("parentId") as string) || null,
            );
          }}
        >
          <input
            name="name"
            placeholder="Nom de l'élément"
            className="bg-neutral-800 rounded px-2 py-1.5 flex-1 min-w-[12rem]"
          />
          <input
            name="type"
            placeholder="Type (mécanique, niveau…)"
            className="bg-neutral-800 rounded px-2 py-1.5 w-48"
          />
          <select name="parentId" defaultValue="" className="bg-neutral-800 rounded px-2 py-1.5">
            <option value="">— racine —</option>
            {elements.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <button className="border border-neutral-700 rounded px-3 hover:bg-neutral-800">
            Ajouter
          </button>
        </form>
      )}

      {elements.length === 0 ? (
        <p className="text-neutral-500 text-sm">Aucun élément de design pour l&apos;instant.</p>
      ) : (
        renderTree(null, 0)
      )}
    </main>
  );
}
