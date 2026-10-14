import type { Metadata } from "next";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { menuBookPages } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { ActionForm, FieldError, FormMessage, SubmitButton } from "@/components/admin/ActionForm";
import { ImageField } from "@/components/admin/ImageField";
import { DeleteButton, MoveButtons } from "@/components/admin/RowActions";
import { Card, CardTitle, EmptyState, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { createMenuBookPage, deleteMenuBookPage, moveMenuBookPage, updateMenuBookPage } from "./actions";

export const metadata: Metadata = { title: "Buku Menu" };

const ALT_HINT = "Dibacakan screen reader, mis. “Buku menu: Beverage”.";

export default async function MenuBookAdminPage() {
  await requireAdmin();
  const pages = await db.select().from(menuBookPages).orderBy(asc(menuBookPages.sortOrder), asc(menuBookPages.id));

  return (
    <>
      <PageHeader
        title="Buku Menu"
        description="Halaman buku menu cetak yang tampil sebagai flipbook di halaman /menu. Gunakan gambar mendatar (A4 landscape)."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardTitle>Tambah halaman</CardTitle>
          <ActionForm action={createMenuBookPage} resetOnSuccess className="flex flex-col gap-4 p-4 sm:p-5">
            <FormMessage />
            <ImageField preset="menuBook" label="Gambar halaman" required previewClass="aspect-297/210 w-40" />
            <Field label="Keterangan halaman" htmlFor="alt" hint={ALT_HINT} error={<FieldError name="alt" />} className="max-w-md">
              <input id="alt" name="alt" required maxLength={160} className={inputClass} />
            </Field>
            <div>
              <SubmitButton busyLabel="Meng-upload…">Tambah halaman</SubmitButton>
            </div>
          </ActionForm>
        </Card>

        <Card>
          <CardTitle aside={<span className="text-xs text-ink/50">{pages.length} halaman</span>}>Urutan halaman</CardTitle>
          {pages.length === 0 ? (
            <EmptyState>Belum ada halaman. Selama kosong, halaman /menu menampilkan pesan “sedang diperbarui”.</EmptyState>
          ) : (
            <ol className="divide-y divide-ink/8">
              {pages.map((page, i) => (
                <li key={page.id} className="flex flex-wrap items-center gap-4 px-3 py-3 sm:px-5">
                  <span className="w-5 text-sm font-semibold text-ink/45 tabular-nums">{i + 1}</span>
                  <div className="relative aspect-297/210 w-28 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-cream">
                    <Image src={page.imageUrl} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                  <ActionForm action={updateMenuBookPage.bind(null, page.id)} className="flex min-w-0 flex-1 basis-56 flex-col gap-1.5">
                    <div className="flex gap-2">
                      <label htmlFor={`alt-${page.id}`} className="sr-only">
                        Keterangan halaman {i + 1}
                      </label>
                      <input id={`alt-${page.id}`} name="alt" required maxLength={160} defaultValue={page.alt} className={inputClass} />
                      <SubmitButton busyLabel="…" className="shrink-0">
                        Simpan
                      </SubmitButton>
                    </div>
                    <FieldError name="alt" />
                    <FormMessage />
                  </ActionForm>
                  <div className="ml-auto flex items-center">
                    <MoveButtons move={moveMenuBookPage.bind(null, page.id)} isFirst={i === 0} isLast={i === pages.length - 1} />
                    <DeleteButton action={deleteMenuBookPage.bind(null, page.id)} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
