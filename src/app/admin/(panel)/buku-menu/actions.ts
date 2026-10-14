"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { menuBookPages } from "@/db/schema";
import type { FormState } from "@/lib/form-state";
import { requireAdmin } from "@/server/auth";
import { deleteImages, readImageFile, saveWithImage } from "@/server/storage";
import { failed, formObject, invalid, moveDir, moveRow, nextSortOrder, positiveId, requiredText, revalidateSite } from "@/server/admin-utils";

const fields = z.object({ alt: requiredText(160) });

export async function createMenuBookPage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = fields.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const file = readImageFile(formData.get("image"));
  if (!file) return { message: "Pilih gambar halaman menu.", errors: { image: "Wajib diisi." } };

  try {
    await saveWithImage(file, "menuBook", async (image) => {
      await db.insert(menuBookPages).values({ ...parsed.data, imageUrl: image!.url, sortOrder: await nextSortOrder(menuBookPages) });
    });
  } catch (err) {
    return failed(err);
  }
  revalidateSite();
  return { ok: true, message: "Halaman ditambahkan di urutan terakhir." };
}

export async function updateMenuBookPage(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = fields.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  try {
    await db.update(menuBookPages).set(parsed.data).where(eq(menuBookPages.id, positiveId.parse(id)));
  } catch (err) {
    return failed(err);
  }
  revalidateSite();
  return { ok: true, message: "Tersimpan." };
}

export async function deleteMenuBookPage(id: number) {
  await requireAdmin();
  const [row] = await db
    .delete(menuBookPages)
    .where(eq(menuBookPages.id, positiveId.parse(id)))
    .returning({ imageUrl: menuBookPages.imageUrl });
  await deleteImages(row?.imageUrl);
  revalidateSite();
}

export async function moveMenuBookPage(id: number, formData: FormData) {
  await requireAdmin();
  await moveRow(menuBookPages, positiveId.parse(id), moveDir.parse(formData.get("dir")));
  revalidateSite();
}
