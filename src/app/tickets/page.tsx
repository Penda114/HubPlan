import Link from "next/link";
import Header from "@/components/header";
import { createTicket } from "@/app/actions";
import { canEdit, getContext } from "@/lib/current";
import { listMembers, listTickets } from "@/lib/data";
import { TICKET_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  OUVERTE: "text-neutral-400",
  EN_COURS: "text-amber-400",
  RESOLUE: "text-green-400",
  FERMEE: "text-neutral-600",
};

export default async function TicketsPage() {
  const { user, project, role } = await getContext();
  const [tickets, members] = await Promise.all([
    listTickets(project.id),
    listMembers(project.id),
  ]);
  const editable = canEdit(role);

  return (
    <main className="mx-auto w-[95%] py-6">
      <Header project={project} user={user} role={role} current="/tickets" />

      <h2 className="text-sm font-semibold text-neutral-300 mb-1">Requêtes</h2>
      <p className="text-xs text-neutral-500 mb-4">
        Demandes internes à l&apos;équipe, avec un fil de discussion et un statut.
      </p>

      {editable && (
        <form
          className="bg-neutral-900 rounded p-4 space-y-2 text-sm mb-6"
          action={async (fd) => {
            "use server";
            await createTicket(
              String(fd.get("title") ?? ""),
              String(fd.get("body") ?? ""),
              (fd.get("assigneeId") as string) || null,
            );
          }}
        >
          <input
            name="title"
            placeholder="Titre de la requête"
            className="w-full bg-neutral-800 rounded px-2 py-1.5"
          />
          <textarea
            name="body"
            rows={3}
            placeholder="Décris ta demande"
            className="w-full bg-neutral-800 rounded px-2 py-1.5"
          />
          <div className="flex items-center gap-2">
            <select
              name="assigneeId"
              defaultValue=""
              className="bg-neutral-800 rounded px-2 py-1.5"
            >
              <option value="">— non assignée —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button className="ml-auto bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 font-medium">
              Créer
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="bg-neutral-900 rounded px-3 py-2 text-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href={`/tickets/${t.id}`} className="font-medium hover:underline">
                {t.title}
              </Link>
              <span
                className={`text-[10px] uppercase tracking-wide ${STATUS_COLORS[t.status]}`}
              >
                {TICKET_STATUS_LABELS[t.status]}
              </span>
              <span className="ml-auto text-neutral-500 text-xs">
                {t._count.messages} message(s)
                {t.assignee ? ` · ${t.assignee.name ?? t.assignee.login}` : ""}
              </span>
            </div>
            <p className="text-neutral-500 text-xs mt-1">
              par {t.author.name ?? t.author.login ?? "?"}
            </p>
          </li>
        ))}
        {tickets.length === 0 && (
          <li className="text-neutral-500 text-sm">Aucune requête.</li>
        )}
      </ul>
    </main>
  );
}
