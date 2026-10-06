"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProposal } from "@/app/actions";

export default function ProposalForm({
  members,
}: {
  members: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<string[]>([""]);
  const [delegationIds, setDelegationIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createProposal({ title, description, tasks, delegationIds });
        setTitle("");
        setDescription("");
        setTasks([""]);
        setDelegationIds([]);
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 text-sm font-medium"
      >
        + Nouvelle proposition
      </button>
    );
  }

  return (
    <form
      className="bg-neutral-900 rounded p-4 space-y-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la proposition"
        className="w-full bg-neutral-800 rounded px-2 py-1.5"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Description de l'idée"
        className="w-full bg-neutral-800 rounded px-2 py-1.5"
      />

      <div>
        <p className="text-xs text-neutral-400 mb-1">
          Tâches nécessaires (au moins une, obligatoire)
        </p>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={task}
                onChange={(e) =>
                  setTasks(tasks.map((t, i) => (i === index ? e.target.value : t)))
                }
                placeholder={`Tâche ${index + 1}`}
                className="flex-1 bg-neutral-800 rounded px-2 py-1.5"
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                  className="text-neutral-500 hover:text-neutral-300 px-2"
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTasks([...tasks, ""])}
          className="mt-2 text-xs text-neutral-500 hover:text-neutral-300"
        >
          + Ajouter une tâche
        </button>
      </div>

      {members.length > 0 && (
        <div>
          <p className="text-xs text-neutral-400 mb-1">
            Délégations proposées (facultatif)
          </p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const checked = delegationIds.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() =>
                    setDelegationIds(
                      checked
                        ? delegationIds.filter((id) => id !== m.id)
                        : [...delegationIds, m.id],
                    )
                  }
                  className={`px-2 py-1 rounded text-xs border ${
                    checked ? "bg-blue-600 border-blue-500" : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-1.5 font-medium"
        >
          {pending ? "…" : "Soumettre"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-neutral-700 rounded px-3 py-1.5"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
