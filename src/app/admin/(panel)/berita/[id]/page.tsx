import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { idFromParams } from "@/server/admin-utils";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { updateNews } from "../actions";
import { NewsFields } from "../fields";

export const metadata: Metadata = { title: "Edit berita" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = await idFromParams(params);
  const [item] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (!item) notFound();

  return (
    <>
      <BackLink href="/admin/berita">Berita</BackLink>
      <PageHeader title="Edit berita" />
      <ActionForm action={updateNews.bind(null, item.id)} className="flex flex-col gap-5">
        <FormMessage />
        <NewsFields item={item} />
        <div>
          <SubmitButton>Simpan perubahan</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
