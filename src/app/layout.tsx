import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HubPlan",
  description: "Kanban GitHub minimaliste",
};

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
