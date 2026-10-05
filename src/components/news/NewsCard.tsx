import Link from "next/link";
import type { NewsItem } from "@/types";
import { newsCategoryLabels } from "@/data/news";
import { formatDate } from "@/lib/format";
import { MediaImage } from "@/components/ui/MediaImage";

/** Foto berita: foto suasana penuh (cover), foto cup menu utuh di atas latar cream hangat (contain). */
export function NewsImage({ item, sizes, priority }: { item: NewsItem; sizes: string; priority?: boolean }) {
  if (item.imageIsCutout) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgb(143_178_245/0.35),transparent_65%),var(--color-cream)]">
        <div className="absolute inset-x-[18%] inset-y-[8%] transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]">
          <MediaImage
            src={item.imageUrl}
            alt={item.title}
            sizes={sizes}
            priority={priority}
            fit="contain"
            placeholderTone="light"
            className="drop-shadow-[0_18px_18px_rgba(62,42,32,0.3)]"
          />
        </div>
      </div>
    );
  }
  // Foto suasana bernada latar cream; warna asli muncul saat disorot/diklik (lihat [data-tint] di globals.css)
  return (
    <div data-tint="light" className="absolute inset-0">
      <MediaImage
        src={item.imageUrl}
        alt={item.title}
        sizes={sizes}
        priority={priority}
        placeholderTone="light"
        className="photo-warm transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
      />
    </div>
  );
}

/**
 * Kategori · tanggal. `surface` = warna latar: biru aksen hanya cukup kontras di latar navy;
 * di latar terang dipakai coffee (kontras ±7:1).
 */
export function NewsMeta({ item, surface = "light", className = "" }: { item: NewsItem; surface?: "light" | "dark"; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-small font-semibold tracking-[0.14em] uppercase ${className}`}>
      <span className={surface === "dark" ? "text-accent" : "text-coffee"}>{newsCategoryLabels[item.category]}</span>
      <span aria-hidden className="opacity-40">·</span>
      <time dateTime={item.publishedAt} className="opacity-60">
        {formatDate(item.publishedAt)}
      </time>
    </p>
  );
}

/**
 * Kartu berita editorial: foto, kategori & tanggal, judul, ringkasan. Seluruh kartu bisa diklik.
 * `featured` = kartu besar (foto lebih lebar, judul lebih besar).
 * `compact` = di HP tampil sebagai baris ringkas (foto kecil di kiri, judul di kanan, tanpa ringkasan);
 * mulai tablet (md) kembali menjadi kartu biasa.
 * `priority` = foto dimuat lebih dulu; pasang di kartu pertama yang terlihat tanpa scroll (gambar LCP).
 */
export function NewsCard({
  item,
  featured = false,
  compact = false,
  priority = false,
  sizes,
}: {
  item: NewsItem;
  featured?: boolean;
  compact?: boolean;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <article
      className={`group relative flex h-full gap-4 sm:gap-5 ${compact ? "flex-row items-center md:flex-col md:items-stretch" : "flex-col"}`}
    >
      <div
        className={`relative overflow-hidden bg-cream shadow-soft transition-shadow duration-500 ease-out-soft group-hover:shadow-raised ${
          compact
            ? // HP: thumbnail persegi kecil; tablet ke atas kartu 4:3 seperti biasa
              "aspect-square w-28 shrink-0 rounded-inner md:aspect-4/3 md:w-auto md:rounded-card"
            : // HP: foto lebih pendek (16:9) supaya tidak memenuhi layar; tablet ke atas tetap 4:3
              featured
              ? "aspect-video rounded-card sm:aspect-4/3 lg:aspect-16/11"
              : "aspect-video rounded-card sm:aspect-4/3"
        }`}
      >
        <NewsImage item={item} sizes={compact ? `(max-width: 767px) 112px, ${sizes}` : sizes} priority={priority} />
      </div>
      <div className={`flex min-w-0 flex-col ${compact ? "gap-1.5 md:gap-3" : "gap-2 sm:gap-3"}`}>
        <NewsMeta item={item} className={`text-ink ${compact ? "max-md:gap-2 max-md:text-[11px] max-md:tracking-widest" : ""}`} />
        <h3
          className={`font-display font-semibold tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-coffee ${
            featured
              ? "text-[22px] leading-[1.18] sm:text-[clamp(26px,2.6vw,36px)] sm:leading-[1.12]"
              : compact
                ? "line-clamp-3 text-[17px] leading-snug md:line-clamp-none md:text-2xl"
                : "text-xl leading-snug sm:text-2xl"
          }`}
        >
          {/* Link membentang ke seluruh kartu (after:inset-0) */}
          <Link href={`/news/${item.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {item.title}
          </Link>
        </h3>
        <p
          className={`leading-relaxed text-ink/70 ${
            compact ? "line-clamp-3 text-body max-md:hidden" : "line-clamp-2 text-[15px] sm:line-clamp-3 sm:text-body"
          }`}
        >
          {item.excerpt}
        </p>
      </div>
    </article>
  );
}
