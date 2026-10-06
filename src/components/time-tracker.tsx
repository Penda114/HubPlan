"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { endTimeSession, heartbeatTimeSession, startTimeSession } from "@/app/actions";
import { formatDuration } from "@/lib/types";

const HEARTBEAT_MS = 20_000;
const IDLE_MS = 60_000;

/**
 * Chronomètre une tâche ouverte. Le temps n'avance que si l'onglet est visible
 * et que l'utilisateur a manifesté de l'activité récemment ; sinon la session
 * reste ouverte mais ne compte pas (aucun battement envoyé).
 */
export default function TimeTracker({ workItemId }: { workItemId: string }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(true);
  const sessionRef = useRef<string | null>(null);
  const lastActivityRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    lastActivityRef.current = Date.now();

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const isActive = () =>
      document.visibilityState === "visible" &&
      Date.now() - lastActivityRef.current < IDLE_MS;

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));

    void startTimeSession(workItemId)
      .then((id) => {
        if (cancelled) {
          void endTimeSession(id);
          return;
        }
        sessionRef.current = id;
      })
      .catch(() => {});

    const timer = window.setInterval(() => {
      const id = sessionRef.current;
      const currentActive = isActive();
      setActive(currentActive);
      if (!id || !currentActive) return;
      void heartbeatTimeSession(id)
        .then((total) => {
          if (!cancelled) setSeconds(total);
        })
        .catch(() => {});
    }, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, markActivity));
      const id = sessionRef.current;
      sessionRef.current = null;
      if (id) void endTimeSession(id).then(() => router.refresh());
    };
  }, [workItemId, router]);

  return (
    <p className="text-xs text-neutral-400">
      Temps actif : <span className="text-neutral-200">{formatDuration(seconds)}</span>
      {!active && <span className="text-neutral-500"> · en pause (inactif)</span>}
    </p>
  );
}
