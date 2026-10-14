import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { galleryCategoryLabels } from "@/data/gallery";
import { requireAdmin } from "@/server/auth";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { DeleteButton, MoveButtons } from "@/components/admin/RowActions";
import { Badge, buttonClass, Card, CardTitle, EmptyState, PageHeader } from "@/components/admin/ui";
import { createGalleryItem, deleteGalleryItem, moveGalleryItem } from "./actions";
import { GalleryFields } from "./fields";

export const metadata: Metadata = { title: "Galeri" };

type Item = typeof galleryItems.$inferSelect;

function GalleryRow({ title, aspect, items }: { title: string; aspect: string; items: Item[] }) {
  return (
    <Card>
      <CardTitle aside={<span className="text-xs text-ink/50">{items.length} foto</span>}>{title}</CardTitle>
      {items.length === 0 ? (
        <EmptyState>Belum ada foto di baris ini.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, i) => (
            <li key={item.id} className="flex flex-col overflow-hidden rounded-lg border border-ink/10">
              <div className={`relative bg-cream ${aspect}`}>
                <Image src={item.mediaUrl} alt={item.caption} fill sizes="(min-width: 1024px) 200px, 45vw" className="object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-ink/75 px-1.5 py-0.5 text-[11px] font-semibold text-warm tabular-nums">
                  {i + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                <p className="line-clamp-2 text-[13px] leading-snug font-medium">{item.caption}</p>
                <Badge>{galleryCategoryLabels[item.category]}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-ink/8 px-1 py-1">
                <MoveButtons move={moveGalleryItem.bind(null, item.id)} isFirst={i === 0} isLast={i === items.length - 1} />
                <div className="flex">
                  <Link href={`/admin/galeri/${item.id}`} className={buttonClass("ghost", "sm")}>
                    Edit
                  </Link>
                  <DeleteButton action={deleteGalleryItem.bind(null, item.id)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default async function GalleryAdminPage() {
  await requireAdmin();
  const items = await db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));

  return (
    <>
      <PageHeader
        title="Galeri"
        description="Foto untuk section “Suasana di Brewi”. Urutan di sini sama dengan urutan di situs."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardTitle>Upload foto baru</CardTitle>
          <ActionForm action={createGalleryItem} resetOnSuccess className="flex flex-col gap-4 p-4 sm:p-5">
            <FormMessage />
            <GalleryFields />
            <div>
              <SubmitButton busyLabel="Meng-upload…">Upload foto</SubmitButton>
            </div>
          </ActionForm>
        </Card>

        <GalleryRow title="Baris atas · foto potret" aspect="aspect-4/5" items={items.filter((g) => g.isPortrait)} />
        <GalleryRow title="Baris bawah · foto landscape" aspect="aspect-5/4" items={items.filter((g) => !g.isPortrait)} />
      </div>
    </>
  );
}
