"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { menuItems, menuItemTags } from "@/db/schema";
import type { FormState } from "@/lib/form-state";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/server/auth";
import { deleteImages, readImageFile, saveWithImage } from "@/server/storage";
import {
  checkbox,
  failed,
  formObject,
  invalid,
  moveDir,
  moveRow,
  nextSortOrder,
  optionalText,
  positiveId,
  requiredText,
  revalidateSite,
  toggleValue,
  uniqueSlug,
} from "@/server/admin-utils";

const fields = z.object({
  name: requiredText(80),
  categoryId: z.coerce.number("Pilih kategori.").int().positive("Pilih kategori."),
  basePrice: z.coerce
    .number("Isi harga dengan angka.")
    .int("Harga tanpa desimal.")
    .min(0, "Harga tidak boleh negatif.")
    .max(10_000_000, "Harga terlalu besar."),
  description: optionalText(300),
  imageIsCutout: checkbox,
  isSignature: checkbox,
  isBestSeller: checkbox,
  isNew: checkbox,
  isAvailable: checkbox,
});
const tagIdsSchema = z.array(positiveId).max(10, "Maksimal 10 tag.");

function parse(formData: FormData) {
  const data = fields.safeParse(formObject(formData));
  const tagIds = tagIdsSchema.safeParse(formData.getAll("tags"));
  return { data, tagIds };
}

const lastInCategory = (categoryId: number) => nextSortOrder(menuItems, eq(menuItems.categoryId, categoryId));

export async function createMenuItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, tagIds } = parse(formData);
  if (!data.success) return invalid(data.error);
  if (!tagIds.success) return invalid(tagIds.error);
  const item = data.data;

  try {
    const slug = await uniqueSlug(menuItems, slugify(item.name) || "menu");
    await saveWithImage(readImageFile(formData.get("image")), "menu", async (image) => {
      const sortOrder = await lastInCategory(item.categoryId);
      await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(menuItems)
          .values({
            ...item,
            slug,
            imageUrl: image?.url ?? "",
            imageIsCutout: Boolean(image) && item.imageIsCutout,
            sortOrder,
          })
          .returning({ id: menuItems.id });
        if (tagIds.data.length) {
          await tx.insert(menuItemTags).values(tagIds.data.map((tagId) => ({ menuItemId: row.id, tagId })));
        }
      });
    });
  } catch (err) {
    // Slug dibuat unik otomatis; bentrok hanya terjadi bila dua admin menyimpan nama sama bersamaan
    return failed(err, { name: "name", message: "Nama menu baru saja dipakai. Simpan sekali lagi." });
  }
  revalidateSite();
  redirect("/admin/menu");
}

export async function updateMenuItem(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const itemId = positiveId.parse(id);
  const { data, tagIds } = parse(formData);
  if (!data.success) return invalid(data.error);
  if (!tagIds.success) return invalid(tagIds.error);
  const item = data.data;

  const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, itemId)).limit(1);
  if (!existing) return { message: "Menu tidak ditemukan (mungkin sudah dihapus)." };

  try {
    const replaced = await saveWithImage(readImageFile(formData.get("image")), "menu", async (image) => {
      // Pindah kategori → taruh di urutan paling akhir kategori baru
      const sortOrder = item.categoryId !== existing.categoryId ? await lastInCategory(item.categoryId) : undefined;
      const imageUrl = image?.url ?? existing.imageUrl;
      await db.transaction(async (tx) => {
        await tx
          .update(menuItems)
          .set({ ...item, imageUrl, imageIsCutout: Boolean(imageUrl) && item.imageIsCutout, ...(sortOrder && { sortOrder }) })
          .where(eq(menuItems.id, itemId));
        await tx.delete(menuItemTags).where(eq(menuItemTags.menuItemId, itemId));
        if (tagIds.data.length) {
          await tx.insert(menuItemTags).values(tagIds.data.map((tagId) => ({ menuItemId: itemId, tagId })));
        }
      });
      return Boolean(image);
    });
    if (replaced) await deleteImages(existing.imageUrl);
  } catch (err) {
    return failed(err);
  }
  revalidateSite();
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: number) {
  await requireAdmin();
  const [row] = await db
    .delete(menuItems)
    .where(eq(menuItems.id, positiveId.parse(id)))
    .returning({ imageUrl: menuItems.imageUrl });
  await deleteImages(row?.imageUrl);
  revalidateSite();
}

export async function moveMenuItem(id: number, formData: FormData) {
  await requireAdmin();
  await moveRow(menuItems, positiveId.parse(id), moveDir.parse(formData.get("dir")), menuItems.categoryId);
  revalidateSite();
}

/** Tersedia ↔ habis (menu habis tidak tampil di situs). */
export async function setMenuAvailable(id: number, formData: FormData) {
  await requireAdmin();
  await db
    .update(menuItems)
    .set({ isAvailable: toggleValue.parse(formData.get("value")) })
    .where(eq(menuItems.id, positiveId.parse(id)));
  revalidateSite();
}
