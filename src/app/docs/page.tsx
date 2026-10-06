import Link from "next/link";
import Header from "@/components/header";
import { createWikiPage } from "@/app/actions";
import { canEdit, getContext } from "@/lib/current";
import { listWikiPages } from "@/lib/data";
import { ensureDefaultWiki } from "@/lib/wiki-seed";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const { user, project, role } = await getContext();
  await ensureDefaultWiki(project.id, user.id);
  const pages = await listWikiPages(project.id);
  const editable = canEdit(role);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <Header project={project} user={user} role={role} current="/docs" />

      <h2 className="text-sm font-semibold text-neutral-300 mb-3">Documentation</h2>
      <ul className="space-y-2 mb-8">
        {pages.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 bg-neutral-900 rounded px-3 py-2 text-sm"
          >
            <Link href={`/docs/${p.slug}`} className="font-medium hover:underline">
              {p.title}
            </Link>
            <span className="text-neutral-600 text-xs ml-auto">
              mis à jour le {p.updatedAt.toLocaleDateString("fr-FR")}
            </span>
          </li>
        ))}
        {pages.length === 0 && <li className="text-neutral-500 text-sm">Aucune page.</li>}
      </ul>

      {editable && (
        <section className="bg-neutral-900 rounded p-4">
          <h3 className="text-sm font-semibold text-neutral-300 mb-2">Nouvelle page</h3>
          <form
            className="flex flex-col gap-2 text-sm"
            action={async (fd) => {
              "use server";
              await createWikiPage(
                String(fd.get("title") ?? ""),
                String(fd.get("content") ?? ""),
              );
            }}
          >
            <input
              name="title"
              placeholder="Titre de la page"
              className="bg-neutral-800 rounded px-2 py-1.5"
            />
            <textarea
              name="content"
              rows={5}
              placeholder="Contenu (Markdown)"
              className="bg-neutral-800 rounded px-2 py-1.5 font-mono text-xs"
            />
            <button className="self-start border border-neutral-700 rounded px-3 py-1.5 hover:bg-neutral-800">
              Créer
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
