import Header from "@/components/header";
import CopyButton from "@/components/copy-button";
import { createMedia, deleteMedia } from "@/app/actions";
import { canEdit, getContext } from "@/lib/current";
import { listMedia } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const { user, project, role } = await getContext();
  const items = await listMedia(project.id);
  const editable = canEdit(role);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <Header project={project} user={user} role={role} current="/media" />

      <h2 className="text-sm font-semibold text-neutral-300 mb-1">Médiathèque</h2>
      <p className="text-xs text-neutral-500 mb-4">
        Les médias sont référencés par leur URL externe : aucun stockage côté application.
      </p>

      {editable && (
        <form
          className="flex flex-wrap gap-2 text-sm mb-6"
          action={async (fd) => {
            "use server";
            await createMedia(
              String(fd.get("url") ?? ""),
              String(fd.get("title") ?? ""),
              String(fd.get("kind") ?? "image"),
            );
          }}
        >
          <input
            name="url"
            placeholder="URL de l'image ou du fichier"
            className="bg-neutral-800 rounded px-2 py-1.5 flex-1 min-w-[16rem]"
          />
          <input
            name="title"
            placeholder="Titre"
            className="bg-neutral-800 rounded px-2 py-1.5 w-44"
          />
          <select name="kind" defaultValue="image" className="bg-neutral-800 rounded px-2 py-1.5">
            <option value="image">Image</option>
            <option value="video">Vidéo</option>
            <option value="audio">Audio</option>
            <option value="autre">Autre</option>
          </select>
          <button className="border border-neutral-700 rounded px-3 hover:bg-neutral-800">
            Ajouter
          </button>
        </form>
      )}

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((m) => (
          <li key={m.id} className="bg-neutral-900 rounded overflow-hidden text-sm">
            {m.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.url}
                alt={m.title}
                className="w-full h-36 object-cover bg-neutral-800"
              />
            ) : (
              <div className="h-36 flex items-center justify-center text-neutral-600 text-xs uppercase">
                {m.kind}
              </div>
            )}
            <div className="p-2">
              <p className="truncate" title={m.title}>
                {m.title}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <CopyButton value={`![${m.title}](${m.url})`} label="Copier le Markdown" />
                {editable && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteMedia(m.id);
                    }}
                  >
                    <button className="text-xs text-red-400 hover:text-red-300">
                      Supprimer
                    </button>
                  </form>
                )}
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-neutral-500 text-sm col-span-full">Aucun média.</li>
        )}
      </ul>
    </main>
  );
}
