import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/header";
import { addTicketMessage, setTicketStatus } from "@/app/actions";
import { canEdit, getContext } from "@/lib/current";
import { getTicket } from "@/lib/data";
import { TICKET_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES = ["OUVERTE", "EN_COURS", "RESOLUE", "FERMEE"] as const;

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, project, role } = await getContext();
  const ticket = await getTicket(project.id, id);
  if (!ticket) notFound();
  const editable = canEdit(role);

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <Header project={project} user={user} role={role} current="/tickets" />

      <h2 className="text-base font-semibold">{ticket.title}</h2>
      <p className="text-xs text-neutral-500 mt-1 mb-4">
        par {ticket.author.name ?? ticket.author.login ?? "?"} ·{" "}
        {TICKET_STATUS_LABELS[ticket.status]}
        {ticket.assignee
          ? ` · assignée à ${ticket.assignee.name ?? ticket.assignee.login}`
          : ""}
      </p>

      <p className="text-sm whitespace-pre-wrap mb-6">{ticket.body}</p>

      <section className="space-y-3 mb-6">
        {ticket.messages.map((m) => (
          <div key={m.id} className="bg-neutral-900 rounded px-3 py-2 text-sm">
            <p className="text-xs text-neutral-500 mb-1">
              {m.author.name ?? m.author.login ?? "?"} ·{" "}
              {m.createdAt.toLocaleDateString("fr-FR")}
            </p>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
        {ticket.messages.length === 0 && (
          <p className="text-neutral-600 text-xs">Aucun message.</p>
        )}
      </section>

      {editable && (
        <>
          <form
            className="space-y-2 mb-6"
            action={async (fd) => {
              "use server";
              await addTicketMessage(ticket.id, String(fd.get("body") ?? ""));
            }}
          >
            <textarea
              name="body"
              rows={3}
              placeholder="Ajouter un message"
              className="w-full bg-neutral-800 rounded px-2 py-1.5 text-sm"
            />
            <button className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 text-sm font-medium">
              Envoyer
            </button>
          </form>

          <form
            className="flex items-center gap-2"
            action={async (fd) => {
              "use server";
              await setTicketStatus(
                ticket.id,
                String(fd.get("status") ?? "OUVERTE") as (typeof STATUSES)[number],
              );
            }}
          >
            <select
              name="status"
              defaultValue={ticket.status}
              className="bg-neutral-800 rounded px-2 py-1.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button className="border border-neutral-700 rounded px-3 py-1.5 text-sm hover:bg-neutral-800">
              Changer le statut
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-xs text-neutral-600">
        <Link href="/tickets" className="hover:text-neutral-400">
          ← Toutes les requêtes
        </Link>
      </p>
    </main>
  );
}
