"use client";

// Detail foto untuk StackSpread: foto yang diklik terbang dari posisinya ke sisi kiri layar,
// lalu cerita singkatnya muncul di sisi kanan. Di layar sempit foto naik ke atas dan teks di bawahnya.
// Latarnya tetap section Tentang itu sendiri (foto lain & judul diredupkan oleh StackSpread).
// Klik di mana saja (atau Esc) → foto kembali ke kartunya semula.
//
// Interaksi: foto miring 3D + kilau cahaya mengikuti kursor dan zoom sangat pelan (Ken Burns).

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/motion/SmoothScrollProvider";

export interface SpotlightItem {
  src: string;
  alt: string;
  description?: string;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const FLY = 0.95;
// Di bawah lebar ini foto di atas, teks di bawah
const STACK_BELOW = 768;
const TILT = 7; // derajat maksimum
const TILT_SPRING = { stiffness: 140, damping: 18, mass: 0.6 };

function targetRect(w: number, h: number): Rect {
  if (w < STACK_BELOW) {
    const pad = 16;
    const width = w - pad * 2;
    return { left: pad, top: Math.max(72, h * 0.1), width, height: Math.min(h * 0.4, width * 0.9) };
  }
  return { left: w * 0.06, top: h * 0.12, width: w * 0.46, height: h * 0.76 };
}

export function PhotoSpotlight({
  item,
  from,
  getReturnRect,
  onCloseStart,
  onClosed,
}: {
  item: SpotlightItem;
  /** Posisi kartu saat diklik (titik awal animasi) */
  from: Rect;
  /** Posisi kartu saat ditutup (titik akhir animasi) */
  getReturnRect: () => Rect | null;
  /** Dipanggil saat animasi tutup dimulai (foto lain bisa mulai muncul kembali) */
  onCloseStart: () => void;
  onClosed: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const lenis = useLenis();
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [closeTo, setCloseTo] = useState<Rect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Kemiringan 3D & kilau mengikuti posisi kursor di atas foto
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, TILT_SPRING);
  const rotateY = useSpring(tiltY, TILT_SPRING);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useSpring(0, { stiffness: 120, damping: 20 });
  const sheen = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgb(255 236 210 / 0.28), transparent 55%)`;

  const closing = closeTo !== null;
  const stacked = vp.w < STACK_BELOW;
  const target = targetRect(vp.w, vp.h);
  const fly = reduce ? 0 : FLY;

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
    glowOpacity.set(0);
  };
  const close = () => {
    if (closing) return;
    resetTilt();
    onCloseStart();
    setCloseTo(getReturnRect() ?? from);
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || stacked || closing || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    tiltY.set((px - 0.5) * 2 * TILT);
    tiltX.set(-(py - 0.5) * 2 * TILT);
    glowX.set(px * 100);
    glowY.set(py * 100);
    glowOpacity.set(1);
  };

  // Kunci scroll halaman, Esc menutup, ikuti ukuran layar
  useEffect(() => {
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [lenis]);

  // Cadangan bila onAnimationComplete tidak terpanggil
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onClosed, fly * 1000 + 250);
    return () => clearTimeout(t);
  }, [closing, fly, onClosed]);

  const panelStyle: React.CSSProperties = stacked
    ? { left: 16, right: 16, top: target.top + target.height + 24, bottom: 16 }
    : { left: target.left + target.width + vp.w * 0.05, right: vp.w * 0.07, top: 0, bottom: 0 };

  return createPortal(
    // Klik di mana saja menutup detail
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spotlight-title"
      tabIndex={-1}
      onClick={close}
      className="fixed inset-0 z-100 cursor-pointer outline-none"
    >
      {/* Bayangan lembut agar teks terbaca di atas section Tentang (bukan latar penuh) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_19_49/0.1),rgb(7_19_49/0.3)_55%,rgb(7_19_49/0.5))] max-md:bg-[linear-gradient(180deg,rgb(7_19_49/0.1),rgb(7_19_49/0.55)_55%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
      />

      {/* Foto yang terbang dari kartu ke sisi kiri */}
      <motion.div
        className="absolute overflow-hidden rounded-card border border-cream/10 bg-deep shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)]"
        style={{ rotateX, rotateY, transformPerspective: 1400 }}
        initial={{ ...from }}
        animate={{ ...(closeTo ?? target) }}
        transition={{ duration: fly, ease: EASE }}
        onAnimationComplete={() => {
          if (closing) onClosed();
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
      >
        {/* Zoom sangat pelan selama foto dibuka */}
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { scale: [1, 1.07] }}
          transition={{ duration: 14, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        >
          <SpotlightImage item={item} />
        </motion.div>
        {/* Kilau cahaya mengikuti kursor */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ backgroundImage: sheen, opacity: glowOpacity }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgb(0_0_0/0.3)]" />
      </motion.div>

      {/* Cerita foto di sisi kanan (atau di bawah foto pada layar sempit) */}
      <motion.div
        data-lenis-prevent
        className={`absolute flex flex-col ${stacked ? "overflow-y-auto" : "justify-center"}`}
        style={panelStyle}
        initial="hidden"
        animate={closing ? "out" : "shown"}
        variants={{
          shown: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.45 } },
          out: { opacity: 0, transition: { duration: reduce ? 0 : 0.3 } },
        }}
      >
        {/* Judul muncul per kata dari balik garis (mask) */}
        <motion.h3
          id="spotlight-title"
          aria-label={item.alt}
          className="font-display text-[clamp(32px,3.6vw,60px)] leading-[1.08] font-semibold tracking-[-0.02em] text-warm drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          variants={{ shown: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}
        >
          {item.alt.split(" ").map((word, i) => (
            <span key={i} aria-hidden className="mr-[0.25em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
              <motion.span
                className="inline-block origin-bottom-left"
                variants={{
                  hidden: reduce ? { opacity: 0 } : { y: "110%", rotate: 4 },
                  shown: { y: "0%", rotate: 0, opacity: 1, transition: { duration: reduce ? 0 : 0.9, ease: EASE } },
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h3>

        {item.description && (
          <Reveal stacked={stacked} reduce={reduce}>
            <p className="mt-5 max-w-[46ch] text-[clamp(15px,1.15vw,19px)] leading-relaxed text-cream/80 max-md:mt-3">
              {item.description}
            </p>
          </Reveal>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

/** Teks masuk bergiliran: dari kanan (desktop) atau dari bawah (layar sempit). */
function Reveal({ children, stacked, reduce }: { children: React.ReactNode; stacked: boolean; reduce: boolean }) {
  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, x: stacked ? 0 : 36, y: stacked ? 18 : 0, filter: "blur(6px)" },
        shown: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0 : 0.8, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Versi kecil (sudah dimuat kartu) tampil langsung, versi tajam memudar masuk setelah selesai dimuat. */
function SpotlightImage({ item }: { item: SpotlightItem }) {
  const [sharp, setSharp] = useState(false);
  if (!item.src) return <div className="absolute inset-0 bg-linear-to-br from-deep to-navy-soft" />;
  return (
    <>
      <Image src={item.src} alt="" fill draggable={false} sizes="(min-width: 1024px) 25vw, 45vw" className="photo-warm object-cover" />
      <Image
        src={item.src}
        alt={item.alt}
        fill
        draggable={false}
        sizes="(min-width: 768px) 50vw, 100vw"
        onLoad={() => setSharp(true)}
        className={`photo-warm object-cover transition-opacity duration-500 ${sharp ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
