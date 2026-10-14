"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { news, newsCategory } from "@/db/schema";
import type { FormState } from "@/lib/form-state";
import { slugify, SLUG_PATTERN } from "@/lib/slug";
import { requireAdmin } from "@/server/auth";
import { deleteImages, readImageFile, saveWithImage } from "@/server/storage";
import {
  checkbox,
  failed,
  formObject,
  invalid,
  positiveId,
  requiredText,
  revalidateSite,
  toggleValue,
  uniqueSlug,
} from "@/server/admin-utils";

const fields = z.object({
  title: requiredText(140),
  slug: z
    .string()
    .trim()
    .max(120, "Maksimal 120 karakter.")
    .refine((s) => s === "" || SLUG_PATTERN.test(s), "Hanya huruf kecil, angka, dan tanda hubung (-).")
    .default(""),
  category: z.enum(newsCategory.enumValues, "Pilih kategori."),
  publishedAt: z.iso.date("Tanggal tidak valid."),
  excerpt: requiredText(300),
  body: requiredText(20_000),
  imageIsCutout: checkbox,
  isActive: checkbox,
});

const DUPLICATE_SLUG = { name: "slug", message: "Slug sudah dipakai berita lain." };

/** Slug isian admin, atau dibuat otomatis (unik) dari judul. */
const resolveSlug = async (slug: string, title: string, excludeId?: number) =>
  // Dasar slug maks 110 karakter: sisa ruang untuk akhiran "-2", "-3", … (kolom maks 120)
  slug || uniqueSlug(news, slugify(title, 110) || "berita", excludeId);

export async function createNews(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = fields.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  try {
    const slug = await resolveSlug(data.slug, data.title);
    await saveWithImage(readImageFile(formData.get("image")), "news", async (image) => {
      await db.insert(news).values({ ...data, slug, imageUrl: image?.url ?? "", imageIsCutout: Boolean(image) && data.imageIsCutout });
    });
  } catch (err) {
    return failed(err, DUPLICATE_SLUG);
  }
  revalidateSite();
  redirect("/admin/berita");
}

export async function updateNews(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const newsId = positiveId.parse(id);
  const parsed = fields.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  const [existing] = await db.select().from(news).where(eq(news.id, newsId)).limit(1);
  if (!existing) return { message: "Berita tidak ditemukan (mungkin sudah dihapus)." };

  try {
    const slug = await resolveSlug(data.slug, data.title, newsId);
    const replaced = await saveWithImage(readImageFile(formData.get("image")), "news", async (image) => {
      const imageUrl = image?.url ?? existing.imageUrl;
      await db
        .update(news)
        .set({ ...data, slug, imageUrl, imageIsCutout: Boolean(imageUrl) && data.imageIsCutout })
        .where(eq(news.id, newsId));
      return Boolean(image);
    });
    if (replaced) await deleteImages(existing.imageUrl);
  } catch (err) {
    return failed(err, DUPLICATE_SLUG);
  }
  revalidateSite();
  redirect("/admin/berita");
}

export async function deleteNews(id: number) {
  await requireAdmin();
  const [row] = await db
    .delete(news)
    .where(eq(news.id, positiveId.parse(id)))
    .returning({ imageUrl: news.imageUrl });
  await deleteImages(row?.imageUrl);
  revalidateSite();
}

/** Tayang ↔ draft. */
export async function setNewsActive(id: number, formData: FormData) {
  await requireAdmin();
  await db
    .update(news)
    .set({ isActive: toggleValue.parse(formData.get("value")) })
    .where(eq(news.id, positiveId.parse(id)));
  revalidateSite();
}
