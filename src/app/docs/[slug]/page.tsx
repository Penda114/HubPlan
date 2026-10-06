import { notFound } from "next/navigation";
import Header from "@/components/header";
import { canEdit, getContext } from "@/lib/current";
import { getWikiPage } from "@/lib/data";
import WikiView from "./wiki-view";

export const dynamic = "force-dynamic";

export default async function WikiPageView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, project, role } = await getContext();
  const page = await getWikiPage(project.id, slug);
  if (!page) notFound();

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <Header project={project} user={user} role={role} current="/docs" />
      <WikiView
        slug={page.slug}
        title={page.title}
        content={page.content}
        editable={canEdit(role)}
      />
    </main>
  );
}
