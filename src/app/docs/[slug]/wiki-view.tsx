"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { marked } from "marked";
import { deleteWikiPage, updateWikiPage } from "@/app/actions";

export default function WikiView({
  slug,
  title,
  content,
  editable,
}: {
  slug: string;
  title: string;
  content: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftContent, setDraftContent] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shown = editing ? draftContent : content;

  function cancel() {
    setDraftTitle(title);
    setDraftContent(content);
    setError(null);
    setEditing(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateWikiPage(slug, draftTitle, draftContent);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteWikiPage(slug);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <article className="text-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold">{editing ? draftTitle : title}</h2>
        {editable && (
          <div className="flex items-center gap-3 text-xs">
            {editing ? (
              <>
                <button
                  onClick={cancel}
                  disabled={pending}
                  className="text-neutral-500 hover:text-neutral-300"
                >
                  Annuler
                </button>
                <button
                  onClick={save}
                  disabled={pending}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-1 font-medium"
                >
                  {pending ? "…" : "Enregistrer"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-neutral-500 hover:text-neutral-300"
                >
                  Modifier
                </button>
                <button onClick={remove} className="text-red-400 hover:text-red-300">
                  Supprimer
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="space-y-2 mb-4">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Titre"
            className="w-full bg-neutral-800 rounded px-2 py-1.5"
          />
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={16}
            placeholder="Contenu (Markdown)"
            className="w-full bg-neutral-800 rounded px-2 py-1.5 font-mono text-xs"
          />
        </div>
      )}

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: marked.parse(shown) as string }}
      />

      <p className="mt-8 text-xs text-neutral-600">
        <Link href="/docs" className="hover:text-neutral-400">
          ← Toutes les pages
        </Link>
      </p>
    </article>
  );
}
