"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import { useLenis } from "@/components/motion/SmoothScrollProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Page {
  src: string;
  alt: string;
}

const TURN_MS = 1000;
// Mulai & berhenti pelan, tanpa hentakan di tengah
const EASE = "cubic-bezier(0.45, 0.05, 0.25, 1)";

/**
 * Buku menu bergaya flipbook, tampil sebagai buku terbuka (dua halaman): lembar dibalik 3D di punggung
 * buku (tengah) dan tetap terlihat di sisi kiri, jadi kiri = halaman sebelumnya, kanan = halaman sekarang.
 * Di sampul (halaman pertama) buku digeser ke tengah karena sisi kiri masih kosong.
 * Balik halaman: tombol panah, klik sisi kanan/kiri buku, tombol ← → keyboard, atau swipe.
 * Tombol "Layar penuh" membuka buku yang sama (halaman tetap) memenuhi layar, dan tetap bisa dibalik.
 * HP tegak: buku dibuka atas-bawah seperti kalender dinding (atas = halaman sebelumnya, bawah = sekarang,
 * lembar dibalik ke atas) supaya tiap halaman selebar layar, kira-kira dua kali lebih besar.
 */
export function MenuFlipbook({ pages }: { pages: Page[] }) {
  const [current, setCurrent] = useState(0);
  const [turning, setTurning] = useState<number | null>(null);
  const [full, setFull] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;
  const lenis = useLenis();
  const total = pages.length;
  const vertical = useMediaQuery("(max-width: 767px) and (orientation: portrait)");

  const go = (dir: 1 | -1) => {
    const next = current + dir;
    if (next < 0 || next >= total) return;
    // Halaman yang sedang bergerak: saat maju = halaman sekarang, saat mundur = halaman sebelumnya
    setTurning(dir === 1 ? current : next);
    setCurrent(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTurning(null), reduce ? 0 : TURN_MS);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  const close = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    setFull(false);
  };

  // Layar penuh: kunci scroll halaman, pakai Fullscreen API bila ada (HP tertentu tidak mendukung → tetap overlay penuh),
  // panah keyboard membalik halaman, Esc menutup.
  useEffect(() => {
    if (!full) return;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const el = overlayRef.current;
    if (el?.requestFullscreen) void el.requestFullscreen().catch(() => {});

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goRef.current(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goRef.current(-1);
      if (e.key === "Escape") setFull(false);
    };
    // Keluar dari fullscreen browser (mis. tombol Esc bawaan) → tutup overlay juga
    const onFsChange = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [full, lenis]);

  const book = { pages, current, turning, reduce, go, vertical };

  return (
    <div className="flex flex-col items-center gap-6">
      <Book {...book} className="w-full max-w-176" sizes={vertical ? "100vw" : "(min-width: 704px) 352px, 50vw"} keyboard />
      <Controls current={current} total={total} go={go} />
      <button
        type="button"
        onClick={() => setFull(true)}
        className="inline-flex items-center gap-2 text-small font-semibold tracking-[0.14em] text-coffee uppercase transition-colors duration-300 hover:text-accent-deep"
      >
        <ExpandIcon />
        Layar penuh
      </button>

      {full &&
        createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Buku menu layar penuh"
            data-lenis-prevent
            className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-ink px-4 py-6"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Tutup layar penuh"
              className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-pill border border-cream/25 text-xl text-cream transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink"
            >
              ✕
            </button>
            {/* Lebar buku mengikuti layar: sebesar mungkin tanpa melebihi tinggi layar (sisakan ruang untuk tombol) */}
            <Book
              {...book}
              className={vertical ? "w-[min(96vw,calc((100dvh-8rem)*2000/2828))]" : "w-[min(96vw,calc((100dvh-8rem)*4000/1414))]"}
              sizes={vertical ? "100vw" : "50vw"}
            />
            <Controls current={current} total={total} go={go} dark />
          </div>,
          document.body,
        )}
    </div>
  );
}

function Book({
  pages,
  current,
  turning,
  reduce,
  go,
  vertical,
  className,
  sizes,
  keyboard = false,
}: {
  pages: Page[];
  current: number;
  turning: number | null;
  reduce: boolean;
  go: (dir: 1 | -1) => void;
  /** true = buku atas-bawah (HP tegak), false = kiri-kanan */
  vertical: boolean;
  className: string;
  sizes: string;
  keyboard?: boolean;
}) {
  const swipeX = useRef<number | null>(null);
  const total = pages.length;

  return (
    <div
      role="region"
      aria-roledescription="flipbook"
      aria-label="Buku menu"
      tabIndex={keyboard ? 0 : -1}
      onKeyDown={
        keyboard
          ? (e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
            }
          : undefined
      }
      onPointerDown={(e) => (swipeX.current = e.clientX)}
      onPointerUp={(e) => {
        const start = swipeX.current;
        swipeX.current = null;
        if (start === null) return;
        const dx = e.clientX - start;
        if (Math.abs(dx) > 40) {
          go(dx < 0 ? 1 : -1);
          return;
        }
        // Ketuk/klik biasa: sisi kanan (atau bawah) = maju, sisi kiri (atau atas) = mundur
        const rect = e.currentTarget.getBoundingClientRect();
        const forward = vertical ? e.clientY - rect.top > rect.height / 2 : e.clientX - rect.left > rect.width / 2;
        go(forward ? 1 : -1);
      }}
      className={`cursor-pointer touch-pan-y rounded-inner outline-none select-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      {/* Buku terbuka: 2 halaman A4 mendatar, berdampingan (kiri-kanan) atau bertumpuk (atas-bawah), punggung buku di tengah */}
      <div
        className={`relative w-full ${vertical ? "aspect-2000/2828 perspective-[2400px]" : "aspect-4000/1414 perspective-[3000px]"}`}
        style={{
          // Sampul: sisi kiri (atas) masih kosong, jadi halaman kanan (bawah) digeser ke tengah
          transform: vertical ? `translateY(${current === 0 ? -25 : 0}%)` : `translateX(${current === 0 ? -25 : 0}%)`,
          transition: reduce ? "none" : `transform ${TURN_MS}ms ${EASE}`,
        }}
      >
        {/* Bayangan buku dibuat statis di bawah halaman (bukan di lembar yang berputar) supaya animasi tidak berat */}
        <div
          aria-hidden
          className={`absolute bg-white shadow-raised ${vertical ? "inset-x-0 top-1/2 h-1/2 rounded-b-inner" : "inset-y-0 left-1/2 w-1/2 rounded-r-inner"}`}
        />
        <div
          aria-hidden
          className={`absolute bg-white shadow-raised ${vertical ? "inset-x-0 top-0 h-1/2 rounded-t-inner" : "inset-y-0 left-0 w-1/2 rounded-l-inner"}`}
          style={{ opacity: current > 0 ? 1 : 0, transition: reduce ? "none" : `opacity ${TURN_MS / 2}ms ease` }}
        />
        {pages.map((page, i) => {
          const flipped = i < current;
          const moving = turning === i;
          return (
            <div
              key={page.src}
              // Yang terlihat: halaman sekarang (kanan/bawah) dan halaman sebelumnya (kiri/atas)
              aria-hidden={i !== current && i !== current - 1}
              // will-change hanya saat lembar bergerak: kalau permanen, browser HP merender layer-nya
              // beresolusi rendah sehingga teks menu terlihat blur
              className={`absolute transform-3d ${moving ? "will-change-transform" : ""} ${
                vertical ? "inset-x-0 top-1/2 h-1/2 origin-top" : "inset-y-0 left-1/2 w-1/2 origin-left"
              }`}
              style={{
                // Kiri-kanan: diputar di punggung kiri. Atas-bawah: diputar di punggung atas, tepi bawah terangkat ke arah pembaca.
                transform: vertical ? `rotateX(${flipped ? 180 : 0}deg)` : `rotateY(${flipped ? -180 : 0}deg)`,
                transition: reduce ? "none" : `transform ${TURN_MS}ms ${EASE}`,
                // Lembar yang sedang dibalik paling atas. Kanan: halaman awal di atas; kiri: yang terakhir dibalik di atas.
                zIndex: moving ? total + 1 : flipped ? i : total - i,
              }}
            >
              {/* Muka depan: halaman di sisi kanan (bawah) */}
              <div className={`absolute inset-0 overflow-hidden bg-white backface-hidden ${vertical ? "rounded-b-inner" : "rounded-r-inner"}`}>
                {/* Semua gambar dimuat langsung (eager): kalau baru dimuat saat dibalik, animasinya tersendat */}
                <Image
                  src={page.src}
                  alt={page.alt}
                  fill
                  sizes={sizes}
                  className="object-contain"
                  // Tanpa optimasi Next: file asli (2000px) dipakai apa adanya — kompresi ulang
                  // membuat tulisan kecil di menu pecah/blur
                  unoptimized
                  priority={i === 0}
                  loading={i === 0 ? undefined : "eager"}
                  draggable={false}
                />
                {/* Bayangan lipatan di punggung buku */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute ${
                    vertical ? "inset-x-0 top-0 h-8 bg-linear-to-b" : "inset-y-0 left-0 w-10 bg-linear-to-r"
                  } from-black/15 to-transparent`}
                />
              </div>
              {/* Muka belakang: lembar yang sudah dibalik tetap tampil di sisi kiri (atas) sebagai halaman sebelumnya */}
              <div
                className={`absolute inset-0 overflow-hidden bg-white backface-hidden ${
                  vertical ? "rotate-x-180 rounded-t-inner" : "rotate-y-180 rounded-l-inner"
                }`}
              >
                <Image src={page.src} alt="" fill sizes={sizes} className="object-contain" unoptimized loading="eager" draggable={false} />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute ${
                    vertical ? "inset-x-0 bottom-0 h-8 bg-linear-to-t" : "inset-y-0 right-0 w-10 bg-linear-to-l"
                  } from-black/15 to-transparent`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Controls({ current, total, go, dark = false }: { current: number; total: number; go: (dir: 1 | -1) => void; dark?: boolean }) {
  const btn = dark
    ? "border-cream/25 bg-transparent text-cream hover:text-ink"
    : "border-ink/20 bg-warm text-ink";
  return (
    <div className="flex items-center gap-4">
      {([-1, 1] as const).map((dir) => (
        <button
          key={dir}
          type="button"
          onClick={() => go(dir)}
          disabled={dir === -1 ? current === 0 : current === total - 1}
          aria-label={dir === 1 ? "Halaman berikutnya" : "Halaman sebelumnya"}
          className={`flex size-11 items-center justify-center rounded-pill border text-lg transition-colors duration-300 hover:border-accent hover:bg-accent disabled:pointer-events-none disabled:opacity-35 ${btn}`}
          style={{ order: dir === 1 ? 2 : 0 }}
        >
          {dir === 1 ? "›" : "‹"}
        </button>
      ))}
      <p
        aria-live="polite"
        className={`order-1 min-w-16 text-center text-small font-semibold tracking-[0.14em] tabular-nums ${dark ? "text-cream/80" : "text-coffee"}`}
      >
        {current + 1} / {total}
      </p>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
