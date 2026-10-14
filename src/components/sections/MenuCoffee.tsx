"use client";
import { Fragment } from "react";
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
 * Menu: section informasi singkat (referensi poster produk). Teks di kiri, cup kopi miring di tengah
 * dengan makanan di belakangnya dan kata "MENU" raksasa di latar, deskripsi singkat di panel biru kanan.
 * Menu lengkap dibuka lewat tombol → buku menu (flipbook) di /menu.
 * HP: teks → visual → panel deskripsi, bertumpuk dari atas ke bawah.
 */
export function MenuCoffee() {
  const reduced = useReducedMotion();
  const { title, description, bigWord, drink, food, highlights, cta } = menuShowcase;

  return (
    <section
      id="menu"
      data-nav="menu"
      data-nav-theme="light"
      className="relative overflow-hidden bg-ink text-warm lg:h-screen-s"
    >
      <div data-stack-content className="relative flex flex-col bg-ink lg:block lg:h-full">
        {/* Panel biru kanan (desktop) / blok bawah (HP): poin 01 → kartu "Lihat detail menu" di cekungan → poin 02.
            Cekungan = bidang navy (warna latar section) dengan sudut membulat yang "menggigit" panel dari kiri;
            sisa panel biru tetap tersambung lewat strip di kanan (--strip). */}
        <div className="relative order-3 bg-[linear-gradient(160deg,var(--color-accent-deep)_0%,var(--color-navy-soft)_100%)] [--notch-r:22px] [--strip:2rem] lg:absolute lg:inset-y-0 lg:right-0 lg:w-[34%] lg:[--strip:10%]">
          {/* Desktop: pb setinggi gelombang Galeri (--wave-h di StackPanel) supaya isi tidak tertutup gelombang */}
          <div className="flex flex-col pt-10 pb-24 lg:h-full lg:justify-center lg:pt-(--nav-h) lg:pb-[clamp(56px,8vw,120px)]">
            {highlights.map((h, i) => (
              <Fragment key={h.title}>
                {i === 1 && <MenuCta cta={cta} reduced={reduced} />}
                <motion.div
                  {...rise(reduced, 0.15 + i * 0.2)}
                  className="container-brewi w-full py-6 lg:mx-0 lg:max-w-none lg:py-[min(1.75rem,3svh)] lg:pr-(--container-pad) lg:pl-[12%]"
                >
                  <h3 className="flex items-center gap-3 text-[14px] font-bold tracking-[0.12em] text-warm uppercase sm:text-[16px]">
                    <span className="font-display text-[13px] font-semibold tracking-normal text-accent">0{i + 1}</span>
                    {h.title}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-[13.5px] leading-[1.7] text-warm/80 sm:text-[14px]">{h.text}</p>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Visual: kata MENU raksasa → makanan (belakang) → cup kopi (depan) */}
        <div
          aria-hidden
          className="pointer-events-none relative order-2 h-[min(118vw,560px)] lg:absolute lg:inset-0 lg:h-auto"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE_OUT_SOFT }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[25vw] leading-none font-bold tracking-[-0.04em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1.5px_rgb(124_198_255/0.22)] lg:left-[52%] lg:text-[min(24vw,42svh)] lg:[-webkit-text-stroke:2px_rgb(124_198_255/0.2)]"
          >
            {bigWord}
          </motion.span>

          {/* Cahaya biru di belakang cup */}
          <span className="absolute top-1/2 left-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_198_255/0.28)_0%,transparent_65%)] lg:left-[52%] lg:w-[60svh]" />

          {/* Makanan: di belakang kiri atas cup, sedikit lebih kecil */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: -10 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.25, ease: EASE_OUT_SOFT }}
            className="absolute top-[10%] left-[14%] aspect-square w-[46%] lg:top-[16%] lg:left-[calc(52%-33svh)] lg:w-[35svh]"
          >
            <div className={`relative h-full w-full ${food ? "" : "overflow-hidden rounded-full ring-1 ring-accent/30"}`}>
              <MediaImage
                src={food}
                alt=""
                sizes="(min-width: 1024px) 380px, 46vw"
                fit="contain"
                placeholderTone="dark"
                className="filter-[drop-shadow(0_24px_30px_rgb(0_0_0/0.45))]"
              />
            </div>
          </motion.div>

          {/* Cup kopi: miring, melayang pelan naik-turun */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 12 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: EASE_OUT_SOFT }}
            className="absolute top-1/2 left-1/2 aspect-2/3 h-[86%] -translate-x-1/2 -translate-y-1/2 lg:left-[52%] lg:h-[74svh]"
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
                className="filter-[drop-shadow(0_10px_12px_rgb(0_0_0/0.35))_drop-shadow(0_40px_50px_rgb(0_0_0/0.45))]"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Teks kiri */}
        <div className="container-brewi relative z-20 order-1 flex flex-col gap-5 pt-[calc(var(--nav-h)+2rem)] sm:gap-6 lg:h-full lg:justify-start lg:pt-[26svh]">
          <div className="flex max-w-[30rem] flex-col gap-5 sm:gap-6 lg:max-w-[min(30%,26rem)] xl:max-w-[min(32%,30rem)]">
            <motion.p {...rise(reduced)} className="eyebrow text-accent">
              {uiText.menuEyebrow}
            </motion.p>
            <motion.h2
              {...rise(reduced, 0.08)}
              className="font-display text-section font-semibold tracking-[-0.02em] text-warm"
            >
              {title}
            </motion.h2>
            <motion.p {...rise(reduced, 0.16)} className="text-[15px] leading-[1.75] text-cream/70 sm:text-[16px]">
              {description}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Kartu ajakan ke buku menu (flipbook /menu), duduk di cekungan panel biru.
 * Putih menonjol di atas navy; saat hover kartu terangkat, kilau menyapu, panah bergeser.
 */
function MenuCta({ cta, reduced }: { cta: { title: string; text: string }; reduced: boolean }) {
  return (
    <div className="relative">
      {/* Bidang cekungan: navy dengan sudut kanan membulat (cekung bila dilihat dari panel biru) */}
      <span aria-hidden className="absolute inset-y-0 left-0 right-(--strip) rounded-r-(--notch-r) bg-ink" />
      {/* Sudut cembung panel biru di tepi kiri, tepat di atas & di bawah cekungan */}
      <span
        aria-hidden
        className="absolute bottom-full left-0 size-(--notch-r) bg-[radial-gradient(circle_at_100%_0,transparent_calc(var(--notch-r)_-_0.5px),var(--color-ink)_var(--notch-r))]"
      />
      <span
        aria-hidden
        className="absolute top-full left-0 size-(--notch-r) bg-[radial-gradient(circle_at_100%_100%,transparent_calc(var(--notch-r)_-_0.5px),var(--color-ink)_var(--notch-r))]"
      />

      <motion.div
        {...rise(reduced, 0.35)}
        className="relative py-5 pr-[calc(var(--strip)+1rem)] pl-(--container-pad) lg:py-[min(1.5rem,2.6svh)] lg:pl-[12%]"
      >
        <Link
          href="/menu"
          className="group relative flex items-center gap-4 overflow-hidden rounded-card bg-warm p-4 text-ink shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)] transition-[background-color,translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:bg-cream hover:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.75)] sm:p-5"
        >
          {/* Kilau yang menyapu kartu saat hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-accent/25 to-transparent transition-[left] duration-700 ease-out-soft group-hover:left-[120%]"
          />
          <span
            aria-hidden
            className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-accent sm:size-14"
          >
            {/* Ikon buku terbuka */}
            <svg viewBox="0 0 24 24" className="size-6 sm:size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.5C10.3 5.2 8 4.5 5 4.5c-.6 0-1 .4-1 1v11.5c0 .6.4 1 1 1 3 0 5.3.7 7 2 1.7-1.3 4-2 7-2 .6 0 1-.4 1-1V5.5c0-.6-.4-1-1-1-3 0-5.3.7-7 2Z" />
              <path d="M12 6.5V19.5" />
            </svg>
          </span>
          <span className="relative flex min-w-0 flex-1 flex-col">
            <span className="font-display text-[18px] leading-tight font-semibold whitespace-nowrap sm:text-[20px] lg:text-[clamp(16px,1.3vw,20px)]">{cta.title}</span>
            <span className="mt-0.5 text-[13px] text-ink/65 sm:text-[14px]">{cta.text}</span>
          </span>
          <span
            aria-hidden
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-deep text-[18px] text-warm transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
