import Header from "@/components/header";
import BackupPanel from "@/components/backup-panel";
import { getContext } from "@/lib/current";
import { prisma } from "@/lib/db";
import JoinProjectForm from "./join-form";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { user, project, role } = await getContext();

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    orderBy: { project: { createdAt: "asc" } },
    include: {
      project: {
        include: { _count: { select: { memberships: true, workItems: true } } },
      },
    },
  });

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <Header project={project} user={user} role={role} current="/projects" />

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-300 mb-2">Mes projets</h2>
        <ul className="space-y-2">
          {memberships.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 bg-neutral-900 rounded px-3 py-2 text-sm flex-wrap"
            >
              <span className="font-medium">{m.project.name}</span>
              <span className="text-[10px] uppercase bg-neutral-800 rounded px-1 tracking-wide">
                {m.project.key}
              </span>
              {m.project.id === project.id && (
                <span className="text-[10px] uppercase bg-blue-900/60 text-blue-300 rounded px-1">
                  actif
                </span>
              )}
              <span className="text-neutral-500 text-xs ml-auto">
                {m.project._count.memberships} membre(s) · {m.project._count.workItems} élément(s) ·{" "}
                {m.role.toLowerCase()}
              </span>
            </li>
          ))}
          {memberships.length === 0 && (
            <li className="text-neutral-500 text-sm">Aucun projet.</li>
          )}
        </ul>
      </section>

      <section className="bg-neutral-900 rounded p-4">
        <h2 className="text-sm font-semibold text-neutral-300 mb-1">Rejoindre un projet</h2>
        <p className="text-xs text-neutral-500 mb-3">
          Demande sa clé au propriétaire du projet, puis saisis-la ici pour collaborer sur son
          board.
        </p>
        <JoinProjectForm />
      </section>

      <section className="bg-neutral-900 rounded p-4 mt-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-1">Sauvegarde des données</h2>
        <p className="text-xs text-neutral-500 mb-3">
          Exporte l&apos;intégralité du contenu en JSON, ou enregistre-le sur le dépôt GitHub
          (une sauvegarde automatique est aussi réalisée chaque nuit).
        </p>
        <BackupPanel />
      </section>
    </main>
  );
}
