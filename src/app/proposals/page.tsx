import Link from "next/link";
import Header from "@/components/header";
import { canEdit, getContext } from "@/lib/current";
import { countMembers, listMembers, listProposals } from "@/lib/data";
import { PROPOSAL_STATUS_LABELS } from "@/lib/types";
import ProposalForm from "./proposal-form";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: "OUVERTE" | "ADOPTEE" | "REJETEE" }) {
  const color =
    status === "ADOPTEE"
      ? "text-green-400"
      : status === "REJETEE"
        ? "text-red-400"
        : "text-neutral-400";
  return (
    <span className={`text-[10px] uppercase tracking-wide ${color}`}>
      {PROPOSAL_STATUS_LABELS[status]}
    </span>
  );
}

export default async function ProposalsPage() {
  const { user, project, role } = await getContext();
  const [proposals, members, total] = await Promise.all([
    listProposals(project.id),
    listMembers(project.id),
    countMembers(project.id),
  ]);
  const threshold = Math.floor(total / 2) + 1;

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <Header project={project} user={user} role={role} current="/proposals" />

      <h2 className="text-sm font-semibold text-neutral-300 mb-1">Propositions</h2>
      <p className="text-xs text-neutral-500 mb-4">
        Adoption à la majorité absolue : {threshold} « Oui » sur {total} membres, le proposeur
        comptant d&apos;office pour un Oui.
      </p>

      {canEdit(role) && (
        <div className="mb-6">
          <ProposalForm members={members.map((m) => ({ id: m.id, name: m.name }))} />
        </div>
      )}

      <ul className="space-y-2">
        {proposals.map((p) => {
          const yes =
            1 + p.votes.filter((v) => v.choice === "OUI" && v.userId !== p.authorId).length;
          const no = p.votes.filter(
            (v) => v.choice === "NON" && v.userId !== p.authorId,
          ).length;
          return (
            <li key={p.id} className="bg-neutral-900 rounded px-3 py-2 text-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <Link href={`/proposals/${p.id}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
                <StatusBadge status={p.status} />
                <span className="ml-auto text-neutral-500 text-xs">
                  {yes} Oui · {no} Non · {p._count.tasks} tâche(s)
                </span>
              </div>
              <p className="text-neutral-500 text-xs mt-1">
                par {p.author.name ?? p.author.login ?? "?"}
              </p>
            </li>
          );
        })}
        {proposals.length === 0 && (
          <li className="text-neutral-500 text-sm">Aucune proposition.</li>
        )}
      </ul>
    </main>
  );
}
