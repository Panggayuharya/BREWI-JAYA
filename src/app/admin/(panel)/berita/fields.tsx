import type { news } from "@/db/schema";
import { newsCategoryLabels } from "@/data/news";
import { FieldError } from "@/components/admin/ActionForm";
import { ImageField } from "@/components/admin/ImageField";
import { Card, CardTitle, Check, Field, inputClass } from "@/components/admin/ui";

/** Tanggal hari ini (WIB) dalam format YYYY-MM-DD untuk input date. */
const todayWib = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

/** Isian berita (form tulis & edit). */
export function NewsFields({ item }: { item?: typeof news.$inferSelect }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardTitle>Isi berita</CardTitle>
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <Field label="Judul" htmlFor="title" error={<FieldError name="title" />}>
            <input id="title" name="title" required maxLength={140} defaultValue={item?.title} className={inputClass} />
          </Field>
          <Field
            label="Ringkasan"
            htmlFor="excerpt"
            hint="Tampil di kartu berita dan sebagai deskripsi saat link dibagikan."
            error={<FieldError name="excerpt" />}
          >
            <textarea id="excerpt" name="excerpt" rows={2} required maxLength={300} defaultValue={item?.excerpt} className={inputClass} />
          </Field>
          <Field
            label="Isi"
            htmlFor="body"
            hint="Pisahkan paragraf dengan satu baris kosong. Paragraf pertama tampil lebih besar."
            error={<FieldError name="body" />}
          >
            <textarea
              id="body"
              name="body"
              rows={14}
              required
              maxLength={20_000}
              defaultValue={item?.body}
              className={`${inputClass} leading-relaxed`}
            />
          </Field>
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        <Card>
          <CardTitle>Publikasi</CardTitle>
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Kategori" htmlFor="category" error={<FieldError name="category" />}>
                <select id="category" name="category" required defaultValue={item?.category ?? ""} className={inputClass}>
                  <option value="" disabled>
                    Pilih…
                  </option>
                  {Object.entries(newsCategoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tanggal" htmlFor="publishedAt" error={<FieldError name="publishedAt" />}>
                <input
                  id="publishedAt"
                  name="publishedAt"
                  type="date"
                  required
                  defaultValue={item?.publishedAt ?? todayWib()}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field
              label="Slug URL"
              htmlFor="slug"
              hint={
                item
                  ? "Mengubah slug membuat link lama ke berita ini tidak berlaku."
                  : "Kosongkan untuk dibuat otomatis dari judul."
              }
              error={<FieldError name="slug" />}
            >
              <div className="flex items-center rounded-lg border border-ink/15 bg-warm focus-within:border-accent-deep">
                <span className="pl-3 text-sm text-ink/40">/news/</span>
                <input
                  id="slug"
                  name="slug"
                  maxLength={120}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  defaultValue={item?.slug}
                  placeholder="otomatis"
                  className="w-full min-w-0 rounded-r-lg bg-transparent py-2 pr-3 pl-0.5 text-sm"
                />
              </div>
            </Field>
            <Check name="isActive" label="Tayangkan di situs" hint="Matikan untuk menyimpan sebagai draft." defaultChecked={item?.isActive ?? true} />
          </div>
        </Card>
        <Card>
          <CardTitle>Foto</CardTitle>
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <ImageField preset="news" label="Foto sampul" currentUrl={item?.imageUrl || undefined} previewClass="aspect-4/3 w-40" />
            <Check
              name="imageIsCutout"
              label="Foto produk transparan"
              hint="Cup menu tanpa latar: tampil utuh di atas latar cream, tidak terpotong."
              defaultChecked={item?.imageIsCutout}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
