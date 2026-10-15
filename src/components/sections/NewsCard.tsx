import Link from "next/link";
import type { NewsItem } from "@/types";
import { newsCategoryLabels } from "@/data/news";
import { uiText } from "@/data/site";
import { formatDate } from "@/lib/format";
import { MediaImage } from "@/components/ui/MediaImage";
import { LinkPending } from "@/components/ui/LinkPending";

/**
 * Foto berita: foto suasana penuh (cover), foto cup menu utuh (contain) di atas latar bercahaya biru.
 * `tone="dark"` = latar navy untuk kartu bertema gelap; `cutoutInset` = posisi cup di dalam kotak.
 */
export function NewsImage({
  item,
  sizes,
  priority,
  tone = "light",
  cutoutInset = "inset-x-[18%] inset-y-[8%]",
}: {
  item: NewsItem;
  sizes: string;
  priority?: boolean;
  tone?: "light" | "dark";
  cutoutInset?: string;
}) {
  if (item.imageIsCutout) {
    return (
      <div
        className={`absolute inset-0 ${
          tone === "dark"
            ? "bg-[radial-gradient(ellipse_at_50%_35%,rgb(124_198_255/0.35),transparent_60%),linear-gradient(160deg,var(--color-navy-soft),var(--color-ink)_75%)]"
            : "bg-[radial-gradient(ellipse_at_50%_110%,rgb(124_198_255/0.35),transparent_65%),var(--color-cream)]"
        }`}
      >
        <div className={`absolute ${cutoutInset} transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]`}>
          <MediaImage
            src={item.imageUrl}
            alt={item.title}
            sizes={sizes}
            priority={priority}
            fit="contain"
            placeholderTone={tone}
            className={tone === "dark" ? "drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)]" : "drop-shadow-[0_18px_18px_rgba(62,42,32,0.3)]"}
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
        placeholderTone={tone}
        className="photo-warm transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
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

/** Link judul yang membentang ke seluruh kartu (after:inset-0) + tanda "sedang membuka". */
function CardLink({ item, pendingClass = "" }: { item: NewsItem; pendingClass?: string }) {
  return (
    <Link href={`/news/${item.slug}`} className="after:absolute after:inset-0 after:z-10 after:content-['']">
      {item.title}
      <LinkPending className={pendingClass} />
    </Link>
  );
}

/** Panah dalam lingkaran; ikut bergeser saat kartu disorot. */
function ArrowCircle({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-[background-color,color,translate] duration-500 ease-out-soft group-hover:translate-x-1 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

/**
 * Berita utama di landing page: foto penuh, teks putih di atas gradasi gelap, chip kategori, dan ajakan baca.
 * Foto cup tampil di latar navy bercahaya (bukan abu) supaya kartu tetap terasa hidup: di HP cup di atas teks,
 * mulai sm cup di kanan dan teks di kiri (gradasi dari kiri) supaya cup tidak tertutup teks.
 */
export function NewsFeature({ item, sizes }: { item: NewsItem; sizes: string }) {
  const cutout = item.imageIsCutout;
  return (
    <article className="group relative isolate flex aspect-4/5 h-full flex-col justify-end overflow-hidden rounded-card bg-ink text-warm shadow-raised sm:aspect-4/3 lg:aspect-auto lg:min-h-130">
      {/* Foto + gradasi di belakang (-z-10, kartu `isolate`); teks sengaja tidak `relative` supaya link membentang ke seluruh kartu */}
      <div className="absolute inset-0 -z-10">
        <NewsImage
          item={item}
          sizes={sizes}
          tone="dark"
          cutoutInset="inset-x-[22%] top-[6%] bottom-[46%] sm:inset-y-[10%] sm:right-[4%] sm:left-auto sm:w-[40%]"
        />
        <div
          aria-hidden
          className={`absolute inset-0 bg-linear-to-t from-ink to-transparent ${
            cutout ? "via-ink/40 sm:bg-linear-to-r sm:via-ink/60" : "via-ink/55"
          }`}
        />
      </div>
      <div className={`flex flex-col gap-4 p-6 sm:p-8 lg:p-10 ${cutout ? "sm:max-w-[60%]" : ""}`}>
        <div className="flex flex-wrap items-center gap-3 text-small font-semibold tracking-[0.14em] uppercase">
          <span className="rounded-pill bg-accent px-3 py-1 text-ink">{newsCategoryLabels[item.category]}</span>
          <time dateTime={item.publishedAt} className="text-cream/70">
            {formatDate(item.publishedAt)}
          </time>
        </div>
        <h3 className="max-w-xl font-display text-[26px] leading-[1.12] font-semibold tracking-[-0.01em] sm:text-[clamp(30px,3vw,42px)]">
          <CardLink item={item} />
        </h3>
        <p className="line-clamp-2 max-w-lg leading-relaxed text-cream/75 sm:text-body">{item.excerpt}</p>
        <span className="mt-1 inline-flex w-fit items-center gap-3 text-[15px] font-semibold">
          {uiText.newsReadMore}
          <ArrowCircle className="size-9 bg-warm/10 text-warm ring-1 ring-warm/25 group-hover:bg-accent group-hover:text-ink group-hover:ring-accent" />
        </span>
      </div>
    </article>
  );
}

/**
 * Berita pendamping di landing page: kartu horizontal di panel cream (foto di kiri, teks di kanan).
 * HP: foto lebih kecil dan ringkasan disembunyikan supaya bagian ini tidak terlalu panjang.
 */
export function NewsTile({ item, sizes }: { item: NewsItem; sizes: string }) {
  return (
    <article className="group relative flex h-full items-center gap-4 overflow-hidden rounded-card bg-cream p-3 transition-[background-color,box-shadow] duration-500 ease-out-soft hover:bg-warm hover:shadow-raised sm:gap-6 sm:p-4">
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-inner bg-cream shadow-soft sm:w-40 lg:w-44">
        <NewsImage item={item} sizes={sizes} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2.5">
        <p className="text-[11px] font-semibold tracking-widest text-coffee uppercase sm:text-small">{newsCategoryLabels[item.category]}</p>
        <h3 className="line-clamp-3 font-display text-[17px] leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-coffee sm:text-[22px]">
          <CardLink item={item} pendingClass="rounded-card" />
        </h3>
        <p className="line-clamp-2 text-[15px] leading-relaxed text-ink/65 max-sm:hidden">{item.excerpt}</p>
        <time dateTime={item.publishedAt} className="text-[12px] tracking-[0.04em] text-ink/50 sm:text-[13px]">
          {formatDate(item.publishedAt)}
        </time>
      </div>
      <ArrowCircle className="mr-2 bg-warm text-ink shadow-soft group-hover:bg-accent max-sm:hidden" />
    </article>
  );
}

/** Baris berita ringkas (foto kecil di kiri; kategori, judul, tanggal di kanan) untuk "Berita lainnya" di halaman detail. */
export function NewsRow({ item }: { item: NewsItem }) {
  return (
    <article className="group relative flex items-center gap-4">
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-inner bg-cream shadow-soft transition-shadow duration-500 ease-out-soft group-hover:shadow-raised">
        <NewsImage item={item} sizes="96px" />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-[11px] font-semibold tracking-widest text-coffee uppercase">{newsCategoryLabels[item.category]}</p>
        <h3 className="line-clamp-3 font-display text-[17px] leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-coffee">
          <CardLink item={item} pendingClass="rounded-inner" />
        </h3>
        <time dateTime={item.publishedAt} className="text-[12px] tracking-[0.04em] text-ink/50">
          {formatDate(item.publishedAt)}
        </time>
      </div>
    </article>
  );
}
