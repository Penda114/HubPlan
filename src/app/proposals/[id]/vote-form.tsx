"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { voteProposal } from "@/app/actions";

export default function VoteForm({
  proposalId,
  current,
  currentComment,
}: {
  proposalId: string;
  current: "OUI" | "NON" | null;
  currentComment: string;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<"OUI" | "NON">(current ?? "OUI");
  const [comment, setComment] = useState(currentComment);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await voteProposal(proposalId, choice, comment);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <div className="bg-neutral-900 rounded p-3 space-y-2 text-sm">
      <p className="text-xs text-neutral-400">
        {current ? `Ton vote actuel : ${current === "OUI" ? "Oui" : "Non"}` : "Ton vote"}
      </p>
      <div className="flex gap-2">
        {(["OUI", "NON"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setChoice(value)}
            className={`px-3 py-1 rounded text-sm border ${
              choice === value ? "bg-blue-600 border-blue-500" : "border-neutral-700 text-neutral-300"
            }`}
          >
            {value === "OUI" ? "Oui" : "Non"}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Commentaire (facultatif)"
        className="w-full bg-neutral-800 rounded px-2 py-1.5"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-1.5 font-medium"
      >
        {pending ? "…" : "Voter"}
      </button>
    </div>
  );
}
