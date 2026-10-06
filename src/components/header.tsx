import { signOut } from "@/auth";
import type { Project, Role, User } from "@prisma/client";

const LINKS = [
  { href: "/", label: "Tableau" },
  { href: "/boards", label: "Sprints" },
  { href: "/design", label: "Modèle de conception" },
  { href: "/proposals", label: "Propositions" },
  { href: "/tickets", label: "Requêtes" },
  { href: "/metrics", label: "Métriques" },
  { href: "/docs", label: "Documentation" },
];

const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
  VIEWER: "Observateur",
};

export default function Header({
  project,
  user,
  role,
  current,
}: {
  project: Project;
  user: User;
  role: Role;
  current: string;
}) {
  return (
    <header className="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div className="flex items-center gap-5">
        <h1 className="text-base font-semibold tracking-tight">{project.name}</h1>
        <nav className="flex gap-4 text-sm">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={
                l.href === current
                  ? "text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-neutral-500">
          {user.name ?? user.login ?? user.email}
          <span className="text-neutral-600"> · {ROLE_LABELS[role]}</span>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="text-neutral-500 hover:text-neutral-300"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  );
}
