import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { createNews } from "../actions";
import { NewsFields } from "../fields";

export const metadata: Metadata = { title: "Tulis berita" };

export default async function NewNewsPage() {
  await requireAdmin();
  return (
    <>
      <BackLink href="/admin/berita">Berita</BackLink>
      <PageHeader title="Tulis berita" />
      <ActionForm action={createNews} className="flex flex-col gap-5">
        <FormMessage />
        <NewsFields />
        <div>
          <SubmitButton>Simpan berita</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
