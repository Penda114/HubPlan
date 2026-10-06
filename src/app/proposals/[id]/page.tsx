import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/header";
import { canEdit, getContext } from "@/lib/current";
import { countMembers, getProposal } from "@/lib/data";
import { PROPOSAL_STATUS_LABELS } from "@/lib/types";
import VoteForm from "./vote-form";

export const dynamic = "force-dynamic";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, project, role } = await getContext();
  const proposal = await getProposal(project.id, id);
  if (!proposal) notFound();

  const total = await countMembers(project.id);
  const threshold = Math.floor(total / 2) + 1;
  const yes =
    1 + proposal.votes.filter((v) => v.choice === "OUI" && v.userId !== proposal.authorId).length;
  const no = proposal.votes.filter(
    (v) => v.choice === "NON" && v.userId !== proposal.authorId,
  ).length;
  const isAuthor = proposal.authorId === user.id;
  const canVote = canEdit(role) && proposal.status === "OUVERTE" && !isAuthor;
  const myVote = proposal.votes.find((v) => v.userId === user.id);

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <Header project={project} user={user} role={role} current="/proposals" />

      <h2 className="text-base font-semibold">{proposal.title}</h2>
      <p className="text-xs text-neutral-500 mt-1 mb-4">
        par {proposal.author.name ?? proposal.author.login ?? "?"} ·{" "}
        {PROPOSAL_STATUS_LABELS[proposal.status]} · {yes} Oui / {no} Non · seuil {threshold}
      </p>

      {proposal.description && (
        <p className="text-sm whitespace-pre-wrap mb-4">{proposal.description}</p>
      )}

      <section className="mb-4">
        <h3 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
          Tâches prévues
        </h3>
        <ul className="list-disc pl-5 text-sm">
          {proposal.tasks.map((t) => (
            <li key={t.id}>{t.title}</li>
          ))}
        </ul>
      </section>

      {proposal.delegations.length > 0 && (
        <p className="text-xs text-neutral-500 mb-4">
          Délégations proposées :{" "}
          {proposal.delegations
            .map((d) => d.user.name ?? d.user.login ?? "?")
            .join(", ")}
        </p>
      )}

      {proposal.status === "OUVERTE" && (
        <section className="mb-6">
          {isAuthor ? (
            <p className="text-xs text-neutral-500">
              Ton vote compte d&apos;office pour un Oui.
            </p>
          ) : (
            canVote && (
              <VoteForm
                proposalId={proposal.id}
                current={myVote?.choice ?? null}
                currentComment={myVote?.comment ?? ""}
              />
            )
          )}
        </section>
      )}

      <section>
        <h3 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Votes</h3>
        <ul className="space-y-2 text-sm">
          <li className="text-neutral-400">
            {proposal.author.name ?? proposal.author.login ?? "?"} · Oui (proposeur)
          </li>
          {proposal.votes
            .filter((v) => v.userId !== proposal.authorId)
            .map((v) => (
              <li key={v.id} className="text-neutral-300">
                {v.user.name ?? v.user.login ?? "?"} ·{" "}
                <span className={v.choice === "OUI" ? "text-green-400" : "text-red-400"}>
                  {v.choice === "OUI" ? "Oui" : "Non"}
                </span>
                {v.comment && (
                  <span className="text-neutral-500"> — {v.comment}</span>
                )}
              </li>
            ))}
          {proposal.votes.filter((v) => v.userId !== proposal.authorId).length === 0 && (
            <li className="text-neutral-600 text-xs">Aucun autre vote pour l&apos;instant.</li>
          )}
        </ul>
      </section>

      <p className="mt-8 text-xs text-neutral-600">
        <Link href="/proposals" className="hover:text-neutral-400">
          ← Toutes les propositions
        </Link>
      </p>
    </main>
  );
}
