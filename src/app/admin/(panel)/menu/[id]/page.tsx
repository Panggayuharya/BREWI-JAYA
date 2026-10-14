import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { idFromParams } from "@/server/admin-utils";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { updateMenuItem } from "../actions";
import { getMenuOptions, MenuFields } from "../fields";

export const metadata: Metadata = { title: "Edit menu" };

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = await idFromParams(params);
  const [item, options] = await Promise.all([
    db.query.menuItems.findFirst({ where: eq(menuItems.id, id), with: { tags: true } }),
    getMenuOptions(),
  ]);
  if (!item) notFound();

  return (
    <>
      <BackLink href="/admin/menu">Menu</BackLink>
      <PageHeader title={`Edit: ${item.name}`} />
      <ActionForm action={updateMenuItem.bind(null, item.id)} className="flex flex-col gap-5">
        <FormMessage />
        <MenuFields item={item} tagIds={item.tags.map((t) => t.tagId)} options={options} />
        <div>
          <SubmitButton>Simpan perubahan</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
