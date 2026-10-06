"use client";

import { useState, useTransition } from "react";

export default function BackupPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/backup", { method: "POST" });
        const data = (await res.json()) as { path?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Échec de la sauvegarde");
        setMessage(`Sauvegarde envoyée : ${data.path}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <button
          onClick={run}
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-1.5 text-sm font-medium"
        >
          {pending ? "…" : "Sauvegarder sur GitHub"}
        </button>
        <a
          href="/api/export"
          className="text-sm text-neutral-400 hover:text-neutral-200"
        >
          Télécharger l&apos;export JSON
        </a>
      </div>
      {message && <p className="text-green-400 text-xs">{message}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
