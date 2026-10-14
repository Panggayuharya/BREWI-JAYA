"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { menuShowcase, uiText } from "@/data/site";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MediaImage } from "@/components/ui/MediaImage";

/** Masuk saat section terlihat: pudar + naik sedikit, berurutan lewat `delay` */
function rise(reduced: boolean, delay = 0) {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, delay, ease: EASE_OUT_SOFT },
  };
}

/**
 * Menu: section informasi singkat (referensi poster produk) di latar putih.
 * Kiri: judul, deskripsi, tombol "Lihat detail menu" → buku menu (flipbook) di /menu, lalu poin 01/02.
 * Kanan: cup kopi miring di depan lingkaran biru, dengan kata "MENU" raksasa di latar.
 * HP: teks → visual, bertumpuk dari atas ke bawah.
 */
export function MenuCoffee() {
  const reduced = useReducedMotion();
  const { title, description, bigWord, drink, highlights, cta } = menuShowcase;

  return (
    <section
      id="menu"
      data-nav="menu"
      data-nav-theme="cream"
      className="relative overflow-hidden bg-warm text-ink lg:min-h-screen-s"
    >
      <div
        data-stack-content
        className="container-brewi relative grid gap-10 pt-[calc(var(--nav-h)+2rem)] pb-24 lg:min-h-screen-s lg:grid-cols-2 lg:items-center lg:gap-12 lg:pt-[calc(var(--nav-h)+1.5rem)] lg:pb-16"
      >
        {/* Kiri: teks, tombol ajakan, poin menu */}
        <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
          <motion.p {...rise(reduced)} className="eyebrow text-accent-deep">
            {uiText.menuEyebrow}
          </motion.p>
          <motion.h2
            {...rise(reduced, 0.08)}
            className="font-display text-section font-semibold tracking-[-0.02em] text-ink"
          >
            {title}
          </motion.h2>
          <motion.p
            {...rise(reduced, 0.16)}
            className="max-w-[46ch] text-[15px] leading-[1.75] text-ink/70 sm:text-[16px]"
          >
            {description}
          </motion.p>

          <MenuCta cta={cta} reduced={reduced} />

          <div className="grid gap-5 pt-4 sm:grid-cols-2 sm:gap-6">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                {...rise(reduced, 0.22 + i * 0.1)}
                className="border-l-2 border-accent-deep pl-4"
              >
                <h3 className="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.12em] text-ink uppercase sm:text-[14px]">
                  <span className="font-display text-[13px] font-semibold tracking-normal text-accent-deep">0{i + 1}</span>
                  {h.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-ink/65">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Kanan: kata MENU raksasa → lingkaran biru → cup kopi (depan) */}
        <div aria-hidden className="pointer-events-none relative h-[min(118vw,560px)] lg:h-[min(76svh,720px)]">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE_OUT_SOFT }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[25vw] leading-none font-bold tracking-[-0.04em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1.5px_rgb(31_111_214/0.18)] lg:text-[min(15vw,34svh)] lg:[-webkit-text-stroke:2px_rgb(31_111_214/0.16)]"
          >
            {bigWord}
          </motion.span>

          {/* Lingkaran biru di belakang cup: aksen warna brand di atas latar putih */}
          <motion.span
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE_OUT_SOFT }}
            className="absolute top-1/2 left-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(160deg,var(--color-accent-deep)_0%,var(--color-navy-soft)_100%)] shadow-[0_40px_80px_-30px_rgb(31_111_214/0.55)] lg:w-[min(72%,52svh)]"
          />

          {/* Cup kopi: miring, melayang pelan naik-turun */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 12 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: EASE_OUT_SOFT }}
            className="absolute top-1/2 left-1/2 aspect-2/3 h-[92%] -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={reduced ? undefined : { y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-full w-full will-change-transform"
            >
              <MediaImage
                src={drink}
                alt=""
                sizes="(min-width: 1024px) 560px, 70vw"
                fit="contain"
                priority={false}
                placeholderTone="light"
                className="filter-[drop-shadow(0_10px_12px_rgb(0_0_0/0.25))_drop-shadow(0_40px_50px_rgb(0_0_0/0.3))]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Tombol ajakan ke buku menu (flipbook /menu): pill hitam ringkas di bawah deskripsi.
 * Saat hover tombol terangkat dan panah bergeser.
 */
function MenuCta({ cta, reduced }: { cta: { title: string; text: string }; reduced: boolean }) {
  return (
    <motion.div {...rise(reduced, 0.22)}>
      <Link
        href="/menu"
        title={cta.text}
        className="group inline-flex items-center gap-3 rounded-pill bg-ink py-2 pr-2 pl-4 text-[14px] font-semibold text-warm shadow-[0_12px_28px_-14px_rgb(0_0_0/0.55)] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgb(31_111_214/0.6)] sm:text-[15px]"
      >
        {/* Ikon buku terbuka */}
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6.5C10.3 5.2 8 4.5 5 4.5c-.6 0-1 .4-1 1v11.5c0 .6.4 1 1 1 3 0 5.3.7 7 2 1.7-1.3 4-2 7-2 .6 0 1-.4 1-1V5.5c0-.6-.4-1-1-1-3 0-5.3.7-7 2Z" />
          <path d="M12 6.5V19.5" />
        </svg>
        {cta.title}
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-accent-deep text-[15px] transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </motion.div>
  );
}
