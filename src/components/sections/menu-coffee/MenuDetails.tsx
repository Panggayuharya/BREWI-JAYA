"use client";
import { useLayoutEffect, useRef } from "react";
import { animate, AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { MenuItem } from "@/types";
import { uiText } from "@/data/site";
import { buttonClass } from "@/components/ui/Button";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { formatRupiah, padIndex, splitName } from "@/lib/format";

interface MenuDetailsProps {
  item: MenuItem;
  /** Semua menu yang bisa tampil di sini; hanya untuk mengukur tinggi teks terpanjang (tidak terlihat) */
  sizerItems: MenuItem[];
  /** Urutan item di dalam kategorinya (0-based) */
  index: number;
  total: number;
  categoryName: string;
}

/** Angka harga tanpa "Rp" (label "Rp" ditulis terpisah, lebih kecil). */
const formatNumber = (v: number) => formatRupiah(v).replace(/^Rp\s*/, "");

export function MenuDetails({ item, sizerItems, index, total, categoryName }: MenuDetailsProps) {
  return (
    <div className="flex flex-col gap-4 *:pointer-events-auto sm:gap-5 lg:gap-8" aria-live="polite">
      {/* HP: kolom kiri di samping cup (lebar --text-w, setinggi panggung --text-min-h); desktop: tanpa batas (lihat .menu-stage) */}
      <div className="flex max-w-(--text-w) min-h-(--text-min-h) flex-col gap-2 sm:gap-3 lg:gap-4">
        {/* 01 / 04  KOPI */}
        <p className="flex items-center gap-2 text-small font-medium tracking-[0.2em] uppercase sm:gap-3 sm:tracking-[0.25em]">
          <span className="flex text-accent">
            <span className="relative inline-flex h-[1.4em] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={padIndex(index + 1)}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.6, ease: EASE_OUT_SOFT }}
                >
                  {padIndex(index + 1)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="ml-2 opacity-60">/ {padIndex(total)}</span>
          </span>
          <span className="text-mist/70">{categoryName}</span>
        </p>

        {/* Nama, catatan rasa, dan deskripsi. Semua menu (sizerItems) dirender tak terlihat di sel grid yang sama,
            jadi tinggi blok ini selalu = teks menu terpanjang dan kolom tidak melompat saat menu berganti
            (kolom ini rata tengah vertikal; tinggi yang berubah dulu menggeser seluruh kolom).
            Animasi hanya opacity + geser (tanpa blur) supaya ringan. mode="wait" → teks lama hilang dulu. */}
        <div className="grid">
          {sizerItems.map((it) => (
            <MenuCopy key={it.id} item={it} aria-hidden className="invisible [grid-area:1/1]" />
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.id}
              className="[grid-area:1/1]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_SOFT } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            >
              <MenuCopy item={item} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Harga + tombol sejajar: "Rp" kecil biru aksen, angka besar. HP: diberi jarak tambahan (--price-gap) dari panggung */}
      <div className="mt-(--price-gap) flex flex-wrap items-center gap-x-5 gap-y-4 sm:gap-x-8">
        <p className="flex items-baseline gap-1.5 font-display font-semibold text-warm tabular-nums">
          <span className="text-[14px] font-light tracking-[0.08em] text-accent sm:text-[16px]">Rp</span>
          <PriceTicker value={item.basePrice} className="text-[26px] leading-none sm:text-price" />
        </p>
        <Link href="/menu" className={buttonClass("outline-light", "w-fit max-sm:px-5 max-sm:text-[14px]")}>
          {uiText.menuSeeDetail}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/** Nama (2 baris), catatan rasa, dan deskripsi satu menu. */
function MenuCopy({ item, className = "", ...rest }: { item: MenuItem; className?: string; "aria-hidden"?: boolean }) {
  const [line1, line2] = splitName(item.name);
  return (
    <div className={`flex flex-col ${className}`} {...rest}>
      {/* HP: 24–30px karena kolom teks hanya separuh layar (desktop tetap 36–76px) */}
      <h3 className="font-display text-[clamp(24px,7vw,30px)] leading-[1.05] sm:text-[clamp(36px,5.4vw,76px)] sm:leading-[1.02] font-semibold tracking-[-0.02em]">
        <span className="block text-cream">{line1}</span>
        {/* Spasi supaya screen reader membaca "Kopi Susu Brewi", bukan "Kopi SusuBrewi" */}
        {line2 && " "}
        {line2 && <span className="block text-accent italic">{line2}</span>}
      </h3>
      {/* Catatan rasa ala kartu menu: teks miring tipis, dipisah titik tengah (bukan pill) */}
      {item.tags.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap items-center font-display text-[14px] font-light text-cream/75 italic sm:mt-4 sm:text-subtitle">
          {item.tags.map((tag, i) => (
            <li key={tag.id} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="px-1.5 text-accent not-italic sm:px-2.5">
                  ·
                </span>
              )}
              {tag.name.charAt(0).toUpperCase() + tag.name.slice(1).toLowerCase()}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2.5 line-clamp-4 max-w-[40ch] text-[13px] leading-[1.6] text-cream/60 sm:mt-4 sm:line-clamp-2 sm:text-[16px] sm:leading-[1.75] lg:mt-5">
        {item.description}
      </p>
    </div>
  );
}

/** Harga dianimasikan (count up) saat item berganti. */
function PriceTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useLayoutEffect(() => {
    const from = prev.current;
    prev.current = value;
    const el = ref.current;
    if (!el || from === value) return;
    el.textContent = formatNumber(from);
    const controls = animate(from, value, {
      duration: 0.8,
      ease: EASE_OUT_SOFT,
      onUpdate: (v) => {
        el.textContent = formatNumber(Math.round(v / 500) * 500);
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(value)}
    </span>
  );
}
