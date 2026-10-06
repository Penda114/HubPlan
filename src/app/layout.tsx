import type { Metadata } from "next";
import { getRepoName } from "@/lib/github";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const repoName = await getRepoName();
  return {
    title: repoName ?? "HubPlan",
    description:
      "Espace de travail de l'équipe : suivi des tâches, temps passé, documentation et décisions.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="bg-neutral-950 text-neutral-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
