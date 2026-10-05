"use client";
// Diadaptasi dari komponen "JellyRadio" untuk navigasi Brewi Jaya:
// - Chip berupa link (<a>) dengan aria-current, bukan radio, karena ini navigasi halaman.
// - Chip aktif ikut berpindah saat scroll (scroll-spy) dengan efek jelly, bukan lompat.
// - Warna dari token tema (lihat .jelly-nav di globals.css); `tone` mengikuti warna navbar.
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { applyJelly, createJellyMVs, destroyJellyMVs, jellyPadding, type JellyChipMV } from "@/lib/jelly";

export interface JellyNavItem {
  id: string;
  label: string;
  href: string;
}

interface JellyNavProps {
  items: JellyNavItem[];
  active: string;
  onNavigate: (id: string) => void;
  /** dark = navbar navy (chip aktif biru aksen), light = navbar terang (chip aktif navy) */
  tone: "dark" | "light";
  className?: string;
}

interface ChipProps {
  mv: JellyChipMV;
  href: string;
  on: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}

const Chip = forwardRef<HTMLAnchorElement, ChipProps>(function Chip({ mv, href, on, onClick, children }, ref) {
  const transform = useTransform(() => `translateX(${mv.x.get()}px) scale(${mv.sx.get()}, ${mv.sy.get()})`);
  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      aria-current={on ? "true" : undefined}
      data-on={on ? "true" : "false"}
      className="jelly-nav__chip"
      style={{ transform }}
    >
      <span className="jelly-nav__skin">{children}</span>
    </motion.a>
  );
});

export function JellyNav({ items, active, onNavigate, tone, className = "" }: JellyNavProps) {
  const reduce = useReducedMotion();
  const at = Math.max(
    0,
    items.findIndex((it) => it.id === active),
  );
  // Tidak ada link aktif (mis. section tanpa link) → semua chip diam di posisi normal.
  const sel = items.some((it) => it.id === active) ? at : -1;

  const groupRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const widths = useRef<number[]>([]);
  const applied = useRef(sel);
  const itemsKey = items.map((it) => it.id).join("|");

  // Satu set motion value (geser x, skala x/y) per chip; dibuat ulang hanya jika daftar link berubah.
  const mvs = useMemo(() => createJellyMVs(itemsKey.split("|").length), [itemsKey]);
  const apply = (target: number, instant: boolean) => applyJelly(mvs, widths.current, target, instant, reduce);

  // Ukur lebar chip + beri ruang di sisi grup agar chip yang membesar tidak terpotong.
  useLayoutEffect(() => {
    const settle = () => {
      const group = groupRef.current;
      if (!group) return;
      widths.current = chipRefs.current.map((el) => el?.offsetWidth ?? 0);
      const pad = jellyPadding(widths.current, chipRefs.current[0]?.offsetHeight ?? 0);
      group.style.setProperty("--jn-pad-x", `${pad.x}px`);
      group.style.setProperty("--jn-pad-y", `${pad.y}px`);
      apply(applied.current, true);
    };
    settle();
    const observer = new ResizeObserver(settle);
    if (groupRef.current) observer.observe(groupRef.current);
    document.fonts?.ready.then(settle);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply membaca ref terbaru
  }, [itemsKey]);

  // Chip aktif berubah (klik atau scroll-spy) → animasi jelly
  useEffect(() => {
    if (applied.current === sel) return;
    applied.current = sel;
    apply(sel, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply membaca ref terbaru
  }, [sel]);

  useEffect(() => () => destroyJellyMVs(mvs), [mvs]);

  return (
    <div ref={groupRef} data-tone={tone} className={`jelly-nav ${className}`}>
      {items.map((it, i) => (
        <Chip
          key={it.id}
          mv={mvs[i]}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          href={it.href}
          on={i === sel}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(it.id);
          }}
        >
          {it.label}
        </Chip>
      ))}
    </div>
  );
}
