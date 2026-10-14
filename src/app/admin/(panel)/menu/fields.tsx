import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { menuCategories, tags, type menuItems } from "@/db/schema";
import { FieldError } from "@/components/admin/ActionForm";
import { ImageField } from "@/components/admin/ImageField";
import { Card, CardTitle, Check, Field, hintClass, inputClass, labelClass } from "@/components/admin/ui";

/** Pilihan kategori & tag untuk form menu. */
export async function getMenuOptions() {
  const [categories, tagList] = await Promise.all([
    db.select({ id: menuCategories.id, name: menuCategories.name }).from(menuCategories).orderBy(asc(menuCategories.sortOrder)),
    db.select({ id: tags.id, name: tags.name }).from(tags).orderBy(asc(tags.name)),
  ]);
  return { categories, tags: tagList };
}

type Options = Awaited<ReturnType<typeof getMenuOptions>>;

/** Isian item menu (form tambah & edit). */
export function MenuFields({
  item,
  tagIds = [],
  options,
}: {
  item?: typeof menuItems.$inferSelect;
  tagIds?: number[];
  options: Options;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardTitle>Info menu</CardTitle>
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <Field label="Nama menu" htmlFor="name" error={<FieldError name="name" />}>
            <input id="name" name="name" required maxLength={80} defaultValue={item?.name} className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" htmlFor="categoryId" error={<FieldError name="categoryId" />}>
              <select id="categoryId" name="categoryId" required defaultValue={item?.categoryId ?? ""} className={inputClass}>
                <option value="" disabled>
                  Pilih…
                </option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Harga (Rp)" htmlFor="basePrice" error={<FieldError name="basePrice" />}>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                inputMode="numeric"
                min={0}
                max={10_000_000}
                step={500}
                required
                defaultValue={item?.basePrice}
                placeholder="22000"
                className={`${inputClass} tabular-nums`}
              />
            </Field>
          </div>
          <Field
            label="Deskripsi"
            htmlFor="description"
            hint="Satu–dua kalimat; tampil di bawah nama menu."
            error={<FieldError name="description" />}
          >
            <textarea id="description" name="description" rows={3} maxLength={300} defaultValue={item?.description} className={inputClass} />
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className={`${labelClass} mb-2`}>Catatan rasa</legend>
            <div className="flex flex-wrap gap-2">
              {options.tags.map((t) => (
                <label key={t.id} className="cursor-pointer">
                  <input type="checkbox" name="tags" value={t.id} defaultChecked={tagIds.includes(t.id)} className="peer sr-only" />
                  <span className="inline-flex rounded-lg border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink/70 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-warm peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                    {t.name}
                  </span>
                </label>
              ))}
            </div>
            <FieldError name="tags" />
          </fieldset>
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        <Card>
          <CardTitle>Foto</CardTitle>
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <ImageField preset="menu" label="Foto produk" currentUrl={item?.imageUrl || undefined} previewClass="aspect-4/5 w-32" />
            <Check
              name="imageIsCutout"
              label="Foto transparan (cutout)"
              hint="PNG/WebP tanpa latar: cup tampil utuh tanpa bingkai bulat."
              defaultChecked={item?.imageIsCutout ?? true}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Label & status</CardTitle>
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            <Check name="isSignature" label="Signature" defaultChecked={item?.isSignature} />
            <Check name="isBestSeller" label="Best seller" defaultChecked={item?.isBestSeller} />
            <Check name="isNew" label="Menu baru" defaultChecked={item?.isNew} />
            <div className="my-1 border-t border-ink/8" />
            <Check
              name="isAvailable"
              label="Tersedia"
              hint="Matikan saat menu habis; menu disembunyikan dari situs."
              defaultChecked={item?.isAvailable ?? true}
            />
            <p className={hintClass}>Urutan tampil diatur dari daftar menu (tombol panah).</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
