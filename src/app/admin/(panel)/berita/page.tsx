import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { newsCategoryLabels } from "@/data/news";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/server/auth";
import { Icon } from "@/components/admin/icons";
import { DeleteButton, ToggleButton } from "@/components/admin/RowActions";
import { Badge, buttonClass, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { deleteNews, setNewsActive } from "./actions";

export const metadata: Metadata = { title: "Berita" };

export default async function NewsAdminPage() {
  await requireAdmin();
  const rows = await db
    .select({
      id: news.id,
      slug: news.slug,
      title: news.title,
      category: news.category,
      publishedAt: news.publishedAt,
      isActive: news.isActive,
      imageUrl: news.imageUrl,
      imageIsCutout: news.imageIsCutout,
    })
    .from(news)
    .orderBy(desc(news.publishedAt), desc(news.id));

  return (
    <>
      <PageHeader
        title="Berita"
        description="Promo, event, dan menu baru. Tiga berita tayang terbaru tampil di section News."
        action={
          <Link href="/admin/berita/baru" className={buttonClass("primary")}>
            <Icon name="plus" />
            Tulis berita
          </Link>
        }
      />

      <Card>
        {rows.length === 0 ? (
          <EmptyState>Belum ada berita.</EmptyState>
        ) : (
          <ul className="divide-y divide-ink/8">
            {rows.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-5">
                <div className="flex min-w-0 flex-1 basis-72 items-center gap-3">
                  <div className="relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-cream">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className={item.imageIsCutout ? "object-contain p-1" : "object-cover"}
                      />
                    )}
                  </div>
                  <div className={`flex min-w-0 flex-col gap-1 ${item.isActive ? "" : "opacity-60"}`}>
                    <Link href={`/admin/berita/${item.id}`} className="line-clamp-2 text-sm font-semibold hover:underline">
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-ink/55">
                      <Badge>{newsCategoryLabels[item.category]}</Badge>
                      <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                    </div>
                  </div>
                </div>
                <ToggleButton action={setNewsActive.bind(null, item.id)} on={item.isActive} onLabel="Tayang" offLabel="Draft" />
                <div className="ml-auto flex items-center">
                  {item.isActive && (
                    <a
                      href={`/news/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Lihat "${item.title}" di situs`}
                      title="Lihat di situs"
                      className={buttonClass("ghost", "sm", "w-8 px-0")}
                    >
                      <Icon name="external" />
                    </a>
                  )}
                  <Link href={`/admin/berita/${item.id}`} className={buttonClass("ghost", "sm")}>
                    Edit
                  </Link>
                  <DeleteButton action={deleteNews.bind(null, item.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
