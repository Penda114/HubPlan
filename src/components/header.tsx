import { signOut } from "@/auth";
import type { Project, Role, User } from "@prisma/client";

const LINKS = [
  { href: "/", label: "Board" },
  { href: "/boards", label: "Sprints & jalons" },
  { href: "/design", label: "Design model" },
  { href: "/metrics", label: "Métriques" },
];

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
    <header className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">{project.name}</h1>
        <nav className="flex gap-3 text-sm">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={l.href === current ? "text-neutral-100" : "text-neutral-400 hover:text-neutral-200"}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-neutral-400">
          {user.name ?? user.login ?? user.email}{" "}
          <span className="text-neutral-600">· {role.toLowerCase()}</span>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="border border-neutral-700 rounded px-2 py-1 hover:bg-neutral-800"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  );
}
