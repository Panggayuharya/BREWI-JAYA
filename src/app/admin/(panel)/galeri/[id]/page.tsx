import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { idFromParams } from "@/server/admin-utils";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { BackLink, Card, PageHeader } from "@/components/admin/ui";
import { updateGalleryItem } from "../actions";
import { GalleryFields } from "../fields";

export const metadata: Metadata = { title: "Edit foto galeri" };

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = await idFromParams(params);
  const [item] = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1);
  if (!item) notFound();

  return (
    <>
      <BackLink href="/admin/galeri">Galeri</BackLink>
      <PageHeader title="Edit foto galeri" />
      <Card className="max-w-3xl">
        <ActionForm action={updateGalleryItem.bind(null, item.id)} className="flex flex-col gap-4 p-4 sm:p-5">
          <FormMessage />
          <GalleryFields item={item} />
          <div>
            <SubmitButton>Simpan perubahan</SubmitButton>
          </div>
        </ActionForm>
      </Card>
    </>
  );
}
