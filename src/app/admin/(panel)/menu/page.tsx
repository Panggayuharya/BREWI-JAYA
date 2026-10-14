import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { formatRupiah } from "@/lib/format";
import { requireAdmin } from "@/server/auth";
import { Icon } from "@/components/admin/icons";
import { DeleteButton, MoveButtons, ToggleButton } from "@/components/admin/RowActions";
import { Badge, buttonClass, Card, CardTitle, EmptyState, PageHeader } from "@/components/admin/ui";
import { deleteMenuItem, moveMenuItem, setMenuAvailable } from "./actions";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuAdminPage() {
  await requireAdmin();
  const [categories, items] = await Promise.all([
    db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder)),
    db.query.menuItems.findMany({
      orderBy: [asc(menuItems.sortOrder), asc(menuItems.id)],
      with: { tags: { with: { tag: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Menu"
        description="Item di section Menu. Menu yang ditandai habis disembunyikan dari situs."
        action={
          <Link href="/admin/menu/baru" className={buttonClass("primary")}>
            <Icon name="plus" />
            Tambah menu
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        {categories.map((category) => {
          const list = items.filter((it) => it.categoryId === category.id);
          return (
            <Card key={category.id}>
              <CardTitle aside={<span className="text-xs text-ink/50">{list.length} menu</span>}>{category.name}</CardTitle>
              {list.length === 0 ? (
                <EmptyState>Belum ada menu di kategori ini.</EmptyState>
              ) : (
                <ul className="divide-y divide-ink/8">
                  {list.map((item, i) => (
                    <li
                      key={item.id}
                      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-5 ${item.isAvailable ? "" : "bg-ink/2"}`}
                    >
                      <div className="flex min-w-0 flex-1 basis-64 items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-cream">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className={item.imageIsCutout ? "object-contain p-0.5" : "object-cover"}
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-ink/35">—</span>
                          )}
                        </div>
                        <div className={`flex min-w-0 flex-col gap-1 ${item.isAvailable ? "" : "opacity-55"}`}>
                          <Link href={`/admin/menu/${item.id}`} className="truncate text-sm font-semibold hover:underline">
                            {item.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-1">
                            {item.isSignature && <Badge tone="accent">Signature</Badge>}
                            {item.isBestSeller && <Badge tone="accent">Best seller</Badge>}
                            {item.isNew && <Badge tone="warn">Baru</Badge>}
                            {item.tags.length > 0 && (
                              <span className="truncate text-xs text-ink/50">{item.tags.map((t) => t.tag.name).join(" · ")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="w-24 text-sm font-semibold tabular-nums">{formatRupiah(item.basePrice)}</span>
                      <ToggleButton
                        action={setMenuAvailable.bind(null, item.id)}
                        on={item.isAvailable}
                        onLabel="Tersedia"
                        offLabel="Habis"
                      />
                      <div className="ml-auto flex items-center">
                        <MoveButtons move={moveMenuItem.bind(null, item.id)} isFirst={i === 0} isLast={i === list.length - 1} />
                        <Link href={`/admin/menu/${item.id}`} className={buttonClass("ghost", "sm")}>
                          Edit
                        </Link>
                        <DeleteButton action={deleteMenuItem.bind(null, item.id)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
