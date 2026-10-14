"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { galleryCategory, galleryItems } from "@/db/schema";
import { isPortrait } from "@/data/gallery";
import type { FormState } from "@/lib/form-state";
import { requireAdmin } from "@/server/auth";
import { deleteImages, readImageFile, saveWithImage } from "@/server/storage";
import {
  failed,
  formObject,
  invalid,
  moveDir,
  moveRow,
  nextSortOrder,
  positiveId,
  requiredText,
  revalidateSite,
} from "@/server/admin-utils";

const fields = z.object({
  caption: requiredText(140),
  category: z.enum(galleryCategory.enumValues, "Pilih kategori."),
});

/** Urutan berikutnya di baris yang sama (potret / landscape). */
const nextInRow = (portrait: boolean) => nextSortOrder(galleryItems, eq(galleryItems.isPortrait, portrait));

export async function createGalleryItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = fields.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const file = readImageFile(formData.get("image"));
  if (!file) return { message: "Pilih foto yang akan di-upload.", errors: { image: "Wajib diisi." } };

  try {
    await saveWithImage(file, "gallery", async (image) => {
      const { url, width, height } = image!;
      await db.insert(galleryItems).values({
        ...parsed.data,
        mediaUrl: url,
        width,
        height,
        sortOrder: await nextInRow(isPortrait({ width, height })),
      });
    });
  } catch (err) {
    return failed(err);
  }
  revalidateSite();
  return { ok: true, message: "Foto ditambahkan ke galeri." };
}

export async function updateGalleryItem(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const itemId = positiveId.parse(id);
  const parsed = fields.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const [existing] = await db.select().from(galleryItems).where(eq(galleryItems.id, itemId)).limit(1);
  if (!existing) return { message: "Foto tidak ditemukan (mungkin sudah dihapus)." };

  try {
    const replaced = await saveWithImage(readImageFile(formData.get("image")), "gallery", async (image) => {
      // Foto baru beda orientasi → pindah ke akhir baris yang lain
      const portrait = image ? isPortrait(image) : existing.isPortrait;
      await db
        .update(galleryItems)
        .set({
          ...parsed.data,
          ...(image && { mediaUrl: image.url, width: image.width, height: image.height }),
          ...(portrait !== existing.isPortrait && { sortOrder: await nextInRow(Boolean(portrait)) }),
        })
        .where(eq(galleryItems.id, itemId));
      return Boolean(image);
    });
    if (replaced) await deleteImages(existing.mediaUrl);
  } catch (err) {
    return failed(err);
  }
  revalidateSite();
  redirect("/admin/galeri");
}

export async function deleteGalleryItem(id: number) {
  await requireAdmin();
  const [row] = await db
    .delete(galleryItems)
    .where(eq(galleryItems.id, positiveId.parse(id)))
    .returning({ mediaUrl: galleryItems.mediaUrl });
  await deleteImages(row?.mediaUrl);
  revalidateSite();
}

export async function moveGalleryItem(id: number, formData: FormData) {
  await requireAdmin();
  await moveRow(galleryItems, positiveId.parse(id), moveDir.parse(formData.get("dir")), galleryItems.isPortrait);
  revalidateSite();
}
