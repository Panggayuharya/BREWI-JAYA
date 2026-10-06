"use client";
// Diadaptasi dari komponen "JellyRadio" untuk navigasi Brewi Jaya:
// - Chip berupa link (<a>) dengan aria-current, bukan radio, karena ini navigasi halaman.
// - Chip aktif ikut berpindah saat scroll (scroll-spy) dengan efek jelly, bukan lompat.
// - Warna dari token tema (lihat .jelly-nav di globals.css); `tone` mengikuti warna navbar.
import { forwardRef } from "react";
import { motion } from "motion/react";
import { useJellyGroup, useJellyTransform, type JellyChipMV } from "@/lib/jelly";

interface JellyNavItem {
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
  const transform = useJellyTransform(mv);
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
  // Tidak ada link aktif (mis. section tanpa link) → -1: semua chip diam di posisi normal.
  const sel = items.findIndex((it) => it.id === active);
  const { groupRef, chipRefs, mvs } = useJellyGroup<HTMLAnchorElement>(
    items.map((it) => it.id),
    sel,
    "--jn-pad",
  );

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
