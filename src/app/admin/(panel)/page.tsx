import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems, menuBookPages, menuItems, news } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { getOutletsWithStatus } from "@/server/queries";
import { OutletStatusBoard } from "@/components/admin/OutletStatusBoard";
import { Icon, type IconName } from "@/components/admin/icons";
import { PageHeader } from "@/components/admin/ui";

type Counts = { gallery: number; menu: number; menu_out: number; menu_book: number; news: number; news_draft: number };

export default async function DashboardPage() {
  await requireAdmin();
  const [outlets, [counts]] = await Promise.all([
    getOutletsWithStatus(),
    // Semua hitungan dalam satu query
    db.execute<Counts>(sql`select
      (select count(*)::int from ${galleryItems}) as gallery,
      (select count(*)::int from ${menuItems}) as menu,
      (select count(*)::int from ${menuItems} where not ${menuItems.isAvailable}) as menu_out,
      (select count(*)::int from ${menuBookPages}) as menu_book,
      (select count(*)::int from ${news} where ${news.isActive}) as news,
      (select count(*)::int from ${news} where not ${news.isActive}) as news_draft`),
  ]);

  const tiles: { href: string; icon: IconName; label: string; value: number; note?: string }[] = [
    { href: "/admin/galeri", icon: "gallery", label: "Foto galeri", value: counts.gallery },
    { href: "/admin/menu", icon: "menu", label: "Item menu", value: counts.menu, note: counts.menu_out ? `${counts.menu_out} habis` : undefined },
    { href: "/admin/buku-menu", icon: "book", label: "Halaman buku menu", value: counts.menu_book },
    { href: "/admin/berita", icon: "news", label: "Berita tayang", value: counts.news, note: counts.news_draft ? `${counts.news_draft} draft` : undefined },
  ];

  return (
    <>
      <PageHeader
        title="Status tempat"
        description="Tandai outlet penuh saat ramai. Label “Tempat sedang penuh” tampil di section Lokasi & Reservasi, lalu hilang otomatis setelah durasinya habis."
      />
      <OutletStatusBoard outlets={outlets.map(({ slug, name, city, fullUntil }) => ({ slug, name, city, fullUntil }))} />

      <h2 className="mt-10 mb-3 text-[15px] font-semibold text-ink">Konten situs</h2>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex h-full flex-col gap-3 rounded-xl border border-ink/10 bg-warm p-4 transition-colors hover:border-ink/30"
            >
              <Icon name={t.icon} className="size-5 text-ink/45 transition-colors group-hover:text-ink" />
              <span className="flex flex-col">
                <span className="text-2xl font-semibold tabular-nums">{t.value}</span>
                <span className="text-xs text-ink/60">
                  {t.label}
                  {t.note && <span className="text-amber-800"> · {t.note}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
