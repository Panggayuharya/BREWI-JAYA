"use client";

// Diadaptasi dari komponen "stack-spread" (Hyperiux Vault: https://vault.hyperiux.com) untuk Brewi Jaya.
//
// Foto awalnya bertumpuk miring di tengah layar. Saat di-scroll, tumpukan menyebar ke posisi
// masing-masing di seluruh layar, lalu judul di tengah muncul. Setelah tersebar penuh, foto
// sedikit bergeser mengikuti kursor (parallax, desktop saja).
//
// Perbedaan dari versi asli:
// - Foto & teks dari props (data di src/data/), bukan hardcode/CDN luar; foto kosong = placeholder.
// - Warna memakai token tema Brewi; teks bahasa Indonesia; latar foto opsional yang digelapkan.
// - Deteksi layar sentuh memakai useMediaQuery (useSyncExternalStore) agar tidak ada setState di effect.
// - Tata letak menyediakan 8 posisi; foto ke-9 dst. tidak ditampilkan di section ini.
// - Setelah tersebar, foto bisa diklik: foto terbang ke kiri dan ceritanya muncul di kanan (PhotoSpotlight),
//   sementara foto lain & judul meredup sehingga section ini sendiri tetap jadi latarnya.

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { MediaImage } from "@/components/ui/MediaImage";
import { PhotoSpotlight, type Rect, type SpotlightItem } from "@/components/ui/PhotoSpotlight";
import { uiText } from "@/data/site";

interface Slot {
  /** posisi akhir desktop (cqw/cqh dari tengah panggung) */
  target: { x: number; y: number };
  /** posisi akhir di layar sentuh (grid 2 kolom) */
  targetSm: { x: number; y: number };
  /** posisi & sudut saat masih bertumpuk */
  stackOffset: { x: number; y: number };
  stackRotate: number;
}

// Urutan = urutan tumpukan (belakang → depan).
// Satuan cqw/cqh = persen lebar/tinggi panggung sticky (bukan vw/vh), jadi tata letak selalu pas dengan
// layar yang benar-benar terlihat — juga di browser HP (Safari, WhatsApp) yang toolbar-nya naik-turun.
// Desktop: semua kartu seukuran (CARD), disusun 3 atas · 2 samping · 3 bawah dengan ruang lega di tengah
// untuk judul.
const SLOTS: Slot[] = [
  { stackOffset: { x: -8, y: -10 }, stackRotate: -18, target: { x: -30, y: -26 }, targetSm: { x: -22, y: -33 } },
  { stackOffset: { x: 14, y: -10 }, stackRotate: 20, target: { x: 1, y: -29 }, targetSm: { x: 22, y: -33 } },
  { stackOffset: { x: -16, y: 0 }, stackRotate: -4, target: { x: 31, y: -25 }, targetSm: { x: -22, y: -19 } },
  { stackOffset: { x: 1, y: -10 }, stackRotate: -2, target: { x: -37, y: 1 }, targetSm: { x: 22, y: -19 } },
  { stackOffset: { x: 18, y: 1 }, stackRotate: 6, target: { x: 37, y: 3 }, targetSm: { x: -22, y: 19 } },
  { stackOffset: { x: -6, y: 10 }, stackRotate: 6, target: { x: -28, y: 26 }, targetSm: { x: 22, y: 19 } },
  { stackOffset: { x: 8, y: 7 }, stackRotate: 3, target: { x: 2, y: 28 }, targetSm: { x: -22, y: 33 } },
  { stackOffset: { x: 20, y: 12 }, stackRotate: -7, target: { x: 30, y: 25 }, targetSm: { x: 22, y: 33 } },
];

// Tinggi section (svh) = jarak scroll untuk menyebar.
const SCROLL_LENGTH = 350;

// Progres scroll saat tumpukan mulai & selesai menyebar, dan saat judul mulai muncul.
const SCATTER_START = 0.12;
const SCATTER_END = 0.9;
const TEXT_FADE_START = 0.3;

// Desktop: ukuran kartu seragam (cqw × cqh) dan skala saat masih bertumpuk (tumpukan sedikit lebih besar)
const CARD = { w: 13, h: 17 };
const STACK_SCALE_DESKTOP = 1.2;

// Desktop: seluruh tata letak foto digeser ke bawah (cqh) supaya baris atas tidak terpotong navbar
const OFFSET_Y = 5;

const PARALLAX_X = 2.6;
const PARALLAX_Y = 2.2;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 };
const parallaxDepth = (i: number, total: number) => (total <= 1 ? 1 : 0.55 + (i / (total - 1)) * 0.75);

// Layar sentuh: grid 2 kolom dengan ukuran kartu seragam.
// Baris HP di ±19cqh & ±33cqh, kartu 17cqh (×0.72). Seluruh grid + judul digeser turun setengah tinggi navbar
// (navShift), jadi grid berada tepat di tengah ruang antara navbar dan tepi bawah layar: jarak navbar → baris atas
// sama dengan baris bawah → tepi layar, dan ruang di antara baris 2 & 3 cukup untuk judul.
// stackScale = skala kartu saat masih bertumpuk.
const SMALL = { scale: 0.72, stackScale: 0.82, colX: 22, card: { w: 40, h: 17 }, navShift: "var(--nav-h) * 0.5" };

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, PARALLAX_SPRING);
  const y = useSpring(rawY, PARALLAX_SPRING);

  useEffect(() => {
    if (!enabled || !active) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

function Card({
  item,
  slot,
  z,
  progress,
  flat,
  isSmall,
  pointer,
  depth,
  hidden,
  dimmed,
  interactive,
  buttonRef,
  onOpen,
}: {
  item: SpotlightItem;
  slot: Slot;
  z: number;
  progress: MotionValue<number>;
  flat: boolean;
  isSmall: boolean;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  depth: number;
  /** Disembunyikan selama fotonya tampil di PhotoSpotlight */
  hidden: boolean;
  /** Diredupkan selama foto lain sedang dibuka */
  dimmed: boolean;
  /** Bisa diklik (hanya setelah foto tersebar penuh) */
  interactive: boolean;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onOpen: () => void;
}) {
  const { target, stackOffset } = slot;
  const stackRotate = flat ? 0 : slot.stackRotate;
  const restScale = isSmall ? SMALL.scale : 1;
  const startScale = isSmall ? SMALL.stackScale : STACK_SCALE_DESKTOP;
  const endX = isSmall ? Math.sign(slot.targetSm.x) * SMALL.colX : target.x;
  const endY = isSmall ? slot.targetSm.y : target.y + OFFSET_Y;
  const shiftY = isSmall ? SMALL.navShift : "0px";

  // -50% menjaga kartu tetap berpusat di titik jangkarnya
  const translate = useTransform([progress, pointer.x, pointer.y], ([p, px, py]: number[]) => {
    const tx = stackOffset.x + (endX - stackOffset.x) * p;
    const ty = stackOffset.y + (endY - stackOffset.y) * p;
    const drift = depth * p;
    return `calc(-50% + ${tx - px * PARALLAX_X * drift}cqw) calc(-50% + ${ty - py * PARALLAX_Y * drift}cqh + ${shiftY})`;
  });
  const rotate = useTransform(progress, [0, 1], [stackRotate, 0]);
  const scale = useTransform(progress, [0, 1], [startScale, restScale]);

  return (
    <motion.div
      // Kartu yang disorot naik ke paling depan (important: mengalahkan zIndex inline)
      className={cn(
        "absolute top-1/2 left-1/2 transition-[opacity,filter] duration-700 ease-out-soft will-change-transform [@media(hover:hover)]:hover:z-50!",
        dimmed && "opacity-60 blur-[1.5px]",
      )}
      style={{
        width: `${isSmall ? SMALL.card.w : CARD.w}cqw`,
        height: `${isSmall ? SMALL.card.h : CARD.h}cqh`,
        zIndex: z,
        translate,
        rotate,
        scale,
        visibility: hidden ? "hidden" : undefined,
      }}
    >
      {/* Perangkat dengan mouse: semua foto blur tipis (1px); foto yang disorot membesar & tajam, yang lain tetap blur.
          Layar sentuh (tanpa hover) tetap tajam. */}
      <button
        ref={buttonRef}
        type="button"
        data-tint="dim"
        onClick={interactive ? onOpen : undefined}
        tabIndex={interactive ? 0 : -1}
        aria-label={`${uiText.placeDetailOpen}: ${item.alt}`}
        className="group relative block h-full w-full overflow-hidden rounded-card border border-cream/10 bg-deep shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)] transition-[scale,filter,box-shadow] duration-500 ease-out-soft max-md:rounded-inner [@media(hover:hover)]:blur-[1px] [@media(hover:hover)]:hover:scale-[1.1] [@media(hover:hover)]:hover:blur-none [@media(hover:hover)]:hover:shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9)] data-[interactive=true]:cursor-pointer"
        data-interactive={interactive}
      >
        <MediaImage
          src={item.src}
          alt={item.alt}
          // Tentang tepat di bawah Home; saat halaman dibuka/di-refresh di #tentang foto ini jadi LCP
          loading="eager"
          sizes="(min-width: 1024px) 16vw, 45vw"
          label={item.alt}
          className="photo-warm"
        />
        {/* Vignette tipis supaya tepi foto menyatu dengan latar gelap */}
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgb(0_0_0/0.35)]" />
        {/* Judul foto muncul saat disorot, tanda bahwa foto bisa diklik */}
        {interactive && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-ink/85 to-transparent px-4 pt-12 pb-3 text-left text-small font-semibold tracking-wide text-warm opacity-0 transition-[opacity,translate] duration-500 ease-out-soft translate-y-2 max-md:hidden [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <span>{item.alt}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>
        )}
      </button>
    </motion.div>
  );
}

interface StackSpreadProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children" | "title"> {
  items: SpotlightItem[];
  /** Judul besar di tengah (muncul saat foto menyebar) */
  title: string;
  /** Foto latar (digelapkan) di belakang kartu */
  backgroundImage?: string;
}

export function StackSpread({ items, title, backgroundImage, className, ...props }: StackSpreadProps) {
  const wrapRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Layar sentuh (bukan sekadar sempit) → grid 2 kolom tanpa parallax kursor
  const isSmall = useMediaQuery("(pointer: coarse)");
  const viewportH = useViewportHeight();

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  // tahan, menyebar, lalu diam
  const progress = useTransform(scrollYProgress, [0, SCATTER_START, SCATTER_END, 1], [0, 0, 1, 1]);

  const [spread, setSpread] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    setSpread((was) => (was ? p > 0.985 : p >= 0.999));
  });
  const parallaxEnabled = !reduce && !isSmall;
  const pointer = usePointerParallax(spread, parallaxEnabled);

  const copyOpacity = useTransform(progress, [TEXT_FADE_START, TEXT_FADE_START + 0.35], [0, 1]);
  const copyScale = useTransform(progress, [TEXT_FADE_START, 0.9], [0.85, 1]);
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0]);
  // latar membesar pelan mengikuti scroll
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

  const shown = items.slice(0, SLOTS.length);

  // Foto yang sedang dibuka di PhotoSpotlight (+ posisi kartunya saat diklik)
  const [active, setActive] = useState<{ index: number; from: Rect; closing?: boolean } | null>(null);
  // Selama foto dibuka, foto lain & judul meredup; mulai kembali begitu animasi tutup dimulai
  const dimmed = active !== null && !active.closing;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const measure = (i: number): Rect | null => {
    const r = buttons.current[i]?.getBoundingClientRect();
    return r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null;
  };
  const open = (i: number) => {
    const from = measure(i);
    if (from) setActive({ index: i, from });
  };

  return (
    <section
      ref={wrapRef}
      className={cn("relative w-full bg-ink text-warm", className)}
      style={{ height: `${SCROLL_LENGTH}svh` }}
      {...props}
    >
      {/* Tinggi panggung = area layar yang benar-benar terlihat (useViewportHeight; h-dvh hanya fallback sebelum JS jalan).
          - Bukan svh: lebih pendek dari layar saat toolbar HP tersembunyi → grid naik, sisa ruang kosong di bawah.
          - Bukan dvh: di Chrome iOS dvh tetap setinggi layar saat toolbar tersembunyi walau toolbar sedang tampil →
            panggung lebih tinggi dari area terlihat, lepas dari sticky lebih awal, dan baris foto atas tertutup navbar
            saat Menu mulai menimpa.
          container-type: size → kartu & judul memakai cqw/cqh dari panggung ini. */}
      <div
        data-stack-content
        className="sticky top-0 h-dvh w-full overflow-hidden bg-ink [container-type:size]"
        style={viewportH ? { height: viewportH } : undefined}
      >
        {backgroundImage && (
          <>
            <motion.div aria-hidden className="absolute inset-0" style={{ scale: reduce ? 1.04 : bgScale }}>
              <Image src={backgroundImage} alt="" fill loading="eager" sizes="100vw" className="object-cover filter-[sepia(0.18)_saturate(1.05)_brightness(0.92)]" />
            </motion.div>
            {/* Overlay navy gelap + sedikit hangat, lalu vignette */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_19_49/0.86),rgb(7_19_49/0.66)_45%,rgb(7_19_49/0.9))]"
            />
            <div aria-hidden className="absolute inset-0 bg-coffee-dark/20 mix-blend-multiply" />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_35%,rgb(7_19_49/0.75)_100%)]"
            />
          </>
        )}

        {/* Cahaya hangat lembut di belakang judul */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgb(143_178_245/0.12)_0%,transparent_55%)]"
        />

        {/* Judul tengah */}
        <motion.div
          className={cn(
            "pointer-events-none absolute inset-0 z-5 flex flex-col items-center justify-center px-6 text-center transition-[filter] duration-700 ease-out-soft max-md:px-8",
            // Meredup selama foto dibuka (opacity div ini dipakai progres scroll, jadi pudarnya di h2)
            dimmed && "blur-sm",
          )}
          style={{
            opacity: copyOpacity,
            scale: reduce ? 1 : copyScale,
            // Ikut turun bersama foto (OFFSET_Y / navShift) agar tetap di tengah ruang kosong di antara foto
            paddingTop: isSmall ? "var(--nav-h)" : `${OFFSET_Y * 1.6}cqh`,
          }}
        >
          <h2 className={cn("font-display text-[clamp(40px,4.4vw,80px)] leading-[1.02] font-semibold tracking-[-0.02em] text-warm drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] max-md:text-[clamp(34px,10vw,48px)] transition-opacity duration-700 ease-out-soft", dimmed && "opacity-0")}>
            {title}
          </h2>
        </motion.div>

        {/* Foto yang menyebar */}
        <div className="absolute inset-0 z-10">
          {shown.map((item, i) => (
            <Card
              key={`${item.alt}-${i}`}
              item={item}
              slot={SLOTS[i]}
              z={2 + i}
              progress={progress}
              flat={reduce}
              isSmall={isSmall}
              pointer={pointer}
              depth={parallaxEnabled ? parallaxDepth(i, shown.length) : 0}
              hidden={active?.index === i}
              dimmed={dimmed && active?.index !== i}
              interactive={spread}
              buttonRef={(el) => {
                buttons.current[i] = el;
              }}
              onOpen={() => open(i)}
            />
          ))}
        </div>

        {/* Petunjuk scroll */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-20 flex flex-col items-center gap-[0.6vh] text-small font-medium tracking-[0.2em] text-cream/70 uppercase"
          style={{ opacity: hintOpacity }}
        >
          <span>{uiText.scrollHint}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bob"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </motion.div>
      </div>

      {active && (
        <PhotoSpotlight
          item={shown[active.index]}
          from={active.from}
          getReturnRect={() => measure(active.index)}
          onCloseStart={() => setActive((a) => (a ? { ...a, closing: true } : a))}
          onClosed={() => setActive(null)}
        />
      )}
    </section>
  );
}
