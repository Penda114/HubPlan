"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinProject } from "@/app/actions";

export default function JoinProjectForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const name = await joinProject(key);
        setMessage(`Projet rejoint : ${name}. Il apparaît maintenant dans ta liste.`);
        setKey("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <div className="space-y-2">
      <form
        className="flex gap-2 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Clé du projet (ex. MONJEU)"
          className="bg-neutral-800 rounded px-2 py-1.5 flex-1 uppercase placeholder:normal-case"
        />
        <button
          type="submit"
          disabled={pending || !key.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-1.5 font-medium"
        >
          {pending ? "…" : "Rejoindre"}
        </button>
      </form>
      {message && <p className="text-green-400 text-xs">{message}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
