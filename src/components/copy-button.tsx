"use client";

import { useState } from "react";

export default function CopyButton({
  value,
  label = "Copier",
  copiedLabel = "Copié",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Presse-papiers indisponible : on ignore silencieusement.
        }
      }}
      className="text-xs text-neutral-500 hover:text-neutral-300"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
