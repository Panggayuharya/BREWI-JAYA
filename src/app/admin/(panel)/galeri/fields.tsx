import type { galleryItems } from "@/db/schema";
import { galleryCategoryLabels } from "@/data/gallery";
import { FieldError } from "@/components/admin/ActionForm";
import { ImageField } from "@/components/admin/ImageField";
import { Field, inputClass } from "@/components/admin/ui";

/** Isian galeri (dipakai form tambah & edit). */
export function GalleryFields({ item }: { item?: typeof galleryItems.$inferSelect }) {
  return (
    <>
      <ImageField
        preset="gallery"
        currentUrl={item?.mediaUrl}
        required
        hint="Foto potret tampil di baris atas, landscape di baris bawah."
      />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <Field label="Keterangan foto" htmlFor="caption" error={<FieldError name="caption" />}>
          <input
            id="caption"
            name="caption"
            required
            maxLength={140}
            defaultValue={item?.caption}
            placeholder="mis. Rooftop saat senja"
            className={inputClass}
          />
        </Field>
        <Field label="Kategori" htmlFor="category" error={<FieldError name="category" />}>
          <select id="category" name="category" required defaultValue={item?.category ?? ""} className={inputClass}>
            <option value="" disabled>
              Pilih…
            </option>
            {Object.entries(galleryCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </>
  );
}
