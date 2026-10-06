import Header from "@/components/header";
import { getContext } from "@/lib/current";
import { prisma } from "@/lib/db";
import { IMPORTANCES, ITEM_TYPES, STAGES, formatDuration } from "@/lib/types";

export const dynamic = "force-dynamic";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 bg-neutral-800 rounded overflow-hidden">
      <div className="h-full rounded" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default async function MetricsPage() {
  const { user, project, role } = await getContext();

  const [items, members] = await Promise.all([
    prisma.workItem.findMany({
      where: { projectId: project.id },
      include: {
        category: true,
        assignees: true,
        timeSessions: { select: { seconds: true } },
      },
    }),
    prisma.membership.findMany({ where: { projectId: project.id }, include: { user: true } }),
  ]);

  const total = items.length;
  const completed = items.filter((i) => i.stage === "COMPLETED").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const logged = items.reduce(
    (s, i) => s + i.timeSessions.reduce((a, t) => a + t.seconds, 0),
    0,
  );

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const completedThisWeek = items.filter(
    (i) => i.completedAt && i.completedAt >= weekAgo,
  ).length;

  const byStage = STAGES.map((s) => ({
    ...s,
    count: items.filter((i) => i.stage === s.id).length,
  }));
  const byType = ITEM_TYPES.map((t) => ({
    ...t,
    count: items.filter((i) => i.type === t.id).length,
  }));
  const byImportance = IMPORTANCES.map((im) => ({
    ...im,
    count: items.filter((i) => i.importance === im.id).length,
  }));

  const categoryNames = Array.from(
    new Set(items.map((i) => i.category?.name).filter(Boolean) as string[]),
  );
  const byCategory = categoryNames.map((name) => {
    const list = items.filter((i) => i.category?.name === name);
    return {
      name,
      color: list[0]?.category?.color ?? "#888",
      count: list.length,
      done: list.filter((i) => i.stage === "COMPLETED").length,
    };
  });

  // Charge par personne : éléments assignés + temps réellement enregistré.
  const logs = await prisma.timeSession.groupBy({
    by: ["userId"],
    where: { workItem: { projectId: project.id } },
    _sum: { seconds: true },
  });
  const secondsByUser = new Map(logs.map((l) => [l.userId, l._sum.seconds ?? 0]));

  const workload = members.map((m) => {
    const assigned = items.filter((i) => i.assignees.some((a) => a.id === m.user.id));
    return {
      userId: m.user.id,
      name: m.user.name ?? m.user.login ?? "?",
      assigned: assigned.length,
      done: assigned.filter((i) => i.stage === "COMPLETED").length,
      seconds: secondsByUser.get(m.user.id) ?? 0,
    };
  });

  return (
    <main className="mx-auto w-[95%] py-6">
      <Header project={project} user={user} role={role} current="/metrics" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Éléments", value: total },
          { label: "Progression", value: `${progress}%` },
          { label: "Terminés (7j)", value: completedThisWeek },
          { label: "Temps actif", value: formatDuration(logged) },
        ].map((k) => (
          <div key={k.label} className="bg-neutral-900 rounded p-3">
            <p className="text-xs text-neutral-500">{k.label}</p>
            <p className="text-2xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Par colonne</h2>
          <div className="space-y-2">
            {byStage.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{s.label}</span>
                  <span className="text-neutral-500">{s.count}</span>
                </div>
                <Bar value={s.count} max={total} color="#3b82f6" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Par type</h2>
          <div className="space-y-2">
            {byType.map((t) => (
              <div key={t.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{t.label}</span>
                  <span className="text-neutral-500">{t.count}</span>
                </div>
                <Bar value={t.count} max={total} color={t.color} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Par discipline</h2>
          <div className="space-y-2">
            {byCategory.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{c.name}</span>
                  <span className="text-neutral-500">
                    {c.done}/{c.count}
                  </span>
                </div>
                <Bar value={c.count} max={total} color={c.color} />
              </div>
            ))}
            {byCategory.length === 0 && (
              <p className="text-neutral-500 text-xs">Aucune tâche catégorisée.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Importance</h2>
          <div className="space-y-2">
            {byImportance.map((im) => (
              <div key={im.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{im.label}</span>
                  <span className="text-neutral-500">{im.count}</span>
                </div>
                <Bar value={im.count} max={total} color={im.color} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-2">Charge par personne</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-500 text-xs text-left">
              <th className="py-1">Membre</th>
              <th>Assignés</th>
              <th>Terminés</th>
              <th>Temps actif</th>
            </tr>
          </thead>
          <tbody>
            {workload.map((w) => (
              <tr key={w.userId} className="border-t border-neutral-800">
                <td className="py-1.5">{w.name}</td>
                <td>{w.assigned}</td>
                <td>{w.done}</td>
                <td>{formatDuration(w.seconds)}</td>
              </tr>
            ))}
            {workload.length === 0 && (
              <tr>
                <td colSpan={4} className="py-2 text-neutral-500 text-xs">
                  Aucun membre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-neutral-500 mt-6">
        Temps actif cumulé : {formatDuration(logged)}
      </p>
    </main>
  );
}
