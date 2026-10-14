import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems, menuBookPages, menuCategories, menuItems, news, outletStatus } from "@/db/schema";
import { getOutlets } from "@/data/outlets";
import type { GalleryItem, MenuBookPage, MenuCategory, MenuItem, NewsItem, OutletWithStatus } from "@/types";

// Query baca untuk halaman publik. Hasil dipetakan ke tipe di src/types supaya komponen tidak bergantung ke skema DB.
// `cache` = satu query per request walau dipanggil beberapa komponen.

/* ── Galeri ───────────────────────────────────────────────────────────────── */

export const getGalleryItems = cache(async (): Promise<GalleryItem[]> => {
  const rows = await db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));
  return rows.map((g) => ({
    id: g.id,
    outletId: null,
    title: g.caption,
    caption: g.caption,
    mediaUrl: g.mediaUrl,
    mediaType: "image",
    category: g.category,
    width: g.width,
    height: g.height,
    isFeatured: g.isFeatured,
    sortOrder: g.sortOrder,
  }));
});

/* ── Menu ─────────────────────────────────────────────────────────────────── */

export const getMenu = cache(async (): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> => {
  const [categories, items] = await Promise.all([
    db.select().from(menuCategories).where(eq(menuCategories.isActive, true)).orderBy(asc(menuCategories.sortOrder)),
    // Satu query (lateral join) untuk item + tag-nya, bukan query per item
    db.query.menuItems.findMany({
      where: eq(menuItems.isAvailable, true),
      orderBy: [asc(menuItems.sortOrder), asc(menuItems.id)],
      with: { tags: { with: { tag: true } } },
    }),
  ]);
  return {
    categories: categories.map((c) => ({ ...c, iconUrl: "" })),
    items: items.map((m) => ({
      id: m.id,
      categoryId: m.categoryId,
      name: m.name,
      slug: m.slug,
      description: m.description,
      basePrice: m.basePrice,
      imageUrl: m.imageUrl,
      imageCutoutUrl: m.imageIsCutout && m.imageUrl ? m.imageUrl : undefined,
      isSignature: m.isSignature,
      isBestSeller: m.isBestSeller,
      isNew: m.isNew,
      isAvailable: m.isAvailable,
      sortOrder: m.sortOrder,
      tags: m.tags.map(({ tag }) => tag),
    })),
  };
});

export const getMenuBookPages = cache(async (): Promise<MenuBookPage[]> =>
  db
    .select({ src: menuBookPages.imageUrl, alt: menuBookPages.alt })
    .from(menuBookPages)
    .orderBy(asc(menuBookPages.sortOrder), asc(menuBookPages.id)),
);

/* ── Berita ───────────────────────────────────────────────────────────────── */

const toNewsItem = (n: typeof news.$inferSelect): NewsItem => ({
  id: n.id,
  slug: n.slug,
  category: n.category,
  title: n.title,
  excerpt: n.excerpt,
  body: n.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
  imageUrl: n.imageUrl,
  imageIsCutout: n.imageIsCutout,
  publishedAt: n.publishedAt,
  isActive: n.isActive,
});

const newestFirst = [desc(news.publishedAt), desc(news.id)];

export async function getLatestNews(limit: number) {
  const rows = await db.select().from(news).where(eq(news.isActive, true)).orderBy(...newestFirst).limit(limit);
  return rows.map(toNewsItem);
}

export const getNewsBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select()
    .from(news)
    .where(and(eq(news.slug, slug), eq(news.isActive, true)))
    .limit(1);
  return row ? toNewsItem(row) : undefined;
});

/** "Berita lainnya": kategori yang sama lebih dulu, lalu yang terbaru. */
export async function getRelatedNews(item: NewsItem, limit: number) {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.isActive, true), ne(news.id, item.id)))
    .orderBy(desc(sql`${news.category} = ${item.category}`), ...newestFirst)
    .limit(limit);
  return rows.map(toNewsItem);
}

export async function getNewsSlugs() {
  return db.select({ slug: news.slug }).from(news).where(eq(news.isActive, true));
}

/* ── Outlet + status penuh ────────────────────────────────────────────────── */

export const getOutletsWithStatus = cache(async (): Promise<OutletWithStatus[]> => {
  const rows = await db.select({ slug: outletStatus.outletSlug, fullUntil: outletStatus.fullUntil }).from(outletStatus);
  const fullUntil = new Map(rows.map((r) => [r.slug, r.fullUntil?.toISOString() ?? null]));
  return getOutlets().map((o) => ({ ...o, fullUntil: fullUntil.get(o.slug) ?? null }));
});
