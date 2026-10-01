import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Board from "./board";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");
  return (
    <main className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">HubPlan</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-400">
            {session.user.name ?? session.user.email}
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
      <Board />
      <a href="/docs" className="text-sm text-neutral-500 hover:text-neutral-300 mt-4 inline-block">
        → Documentation du repo (/docs)
      </a>
    </main>
  );
}
