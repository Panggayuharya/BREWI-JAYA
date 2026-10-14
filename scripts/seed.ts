// pnpm db:seed → isi database kosong dengan konten awal. Aman diulang: tabel yang sudah berisi dilewati.
import "./load-env";
import { count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { galleryItems, menuBookPages, menuCategories, menuItems, menuItemTags, news, tags } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { seedCategories, seedGallery, seedMenu, seedMenuBook, seedNews, seedTags } from "./seed-data";
import { runScript } from "./run";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function isEmpty(tx: Tx, table: PgTable) {
  const [row] = await tx.select({ n: count() }).from(table);
  return row.n === 0;
}

/** sortOrder 1..n sesuai urutan array */
const ordered = <T>(rows: T[]) => rows.map((r, i) => ({ ...r, sortOrder: i + 1 }));

runScript(async () => {
  await db.transaction(async (tx) => {
    if (await isEmpty(tx, menuCategories)) {
      const cats = await tx.insert(menuCategories).values(ordered(seedCategories)).returning();
      const tagRows = await tx.insert(tags).values(seedTags).returning();
      const catId = new Map(cats.map((c) => [c.slug, c.id]));
      const tagId = new Map(tagRows.map((t) => [t.slug, t.id]));

      // sortOrder per kategori
      const position = new Map<string, number>();
      const items = await tx
        .insert(menuItems)
        .values(
          seedMenu.map((m) => {
            const sortOrder = (position.get(m.category) ?? 0) + 1;
            position.set(m.category, sortOrder);
            return {
              categoryId: catId.get(m.category)!,
              name: m.name,
              slug: slugify(m.name),
              description: m.description,
              basePrice: m.basePrice,
              imageUrl: m.photo ? `/menu/${m.photo}` : "",
              imageIsCutout: Boolean(m.photo),
              isSignature: m.isSignature ?? false,
              isBestSeller: m.isBestSeller ?? false,
              isNew: m.isNew ?? false,
              sortOrder,
            };
          }),
        )
        .returning({ id: menuItems.id, slug: menuItems.slug });

      const itemId = new Map(items.map((i) => [i.slug, i.id]));
      const links = seedMenu.flatMap((m) =>
        (m.tags ?? []).map((t) => ({ menuItemId: itemId.get(slugify(m.name))!, tagId: tagId.get(t)! })),
      );
      if (links.length) await tx.insert(menuItemTags).values(links);
      console.log(`Menu: ${items.length} item, ${tagRows.length} tag.`);
    }

    if (await isEmpty(tx, menuBookPages)) {
      await tx.insert(menuBookPages).values(ordered(seedMenuBook));
      console.log(`Buku menu: ${seedMenuBook.length} halaman.`);
    }

    if (await isEmpty(tx, galleryItems)) {
      await tx.insert(galleryItems).values(ordered(seedGallery));
      console.log(`Galeri: ${seedGallery.length} foto.`);
    }

    if (await isEmpty(tx, news)) {
      await tx.insert(news).values(seedNews.map((n) => ({ ...n, body: n.body.join("\n\n") })));
      console.log(`Berita: ${seedNews.length} artikel.`);
    }
  });
  console.log("Seed selesai.");
});
