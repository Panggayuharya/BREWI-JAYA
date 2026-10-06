"use client";
// Tab pilihan dengan efek jelly (diadaptasi dari JellyRadio, sama dengan JellyNav di navbar):
// chip yang diklik membesar, chip lain terdorong ke samping dengan pegas.
// Dipakai untuk kategori menu, pilihan outlet, dan filter berita. Warna di .jelly-tabs (globals.css).
import { forwardRef } from "react";
import { motion } from "motion/react";
import { useJellyGroup, useJellyTransform, type JellyChipMV } from "@/lib/jelly";

interface JellyTabItem<T extends string> {
  value: T;
  label: string;
}

interface JellyTabsProps<T extends string> {
  items: JellyTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Warna latar tempat tab berada: dark = navy, light = putih/terang */
  surface?: "dark" | "light";
  /** caps = huruf kapital kecil berjarak (tab kategori menu) */
  variant?: "default" | "caps";
  /** Chip dibagi rata selebar grup (mis. 3 tab kategori di HP) */
  fill?: boolean;
  className?: string;
}

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  mv: JellyChipMV;
  on: boolean;
}

const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip({ mv, on, children, ...rest }, ref) {
  const transform = useJellyTransform(mv);
  return (
    <motion.button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={on}
      tabIndex={on ? 0 : -1}
      data-on={on ? "true" : "false"}
      className="jelly-tabs__chip"
      style={{ transform }}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      <span className="jelly-tabs__skin">{children}</span>
    </motion.button>
  );
});

export function JellyTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  surface = "light",
  variant = "default",
  fill = false,
  className = "",
}: JellyTabsProps<T>) {
  const at = Math.max(0, items.findIndex((it) => it.value === value));
  const { groupRef, chipRefs, mvs } = useJellyGroup<HTMLButtonElement>(
    items.map((it) => it.value),
    at,
    "--jt-pad",
  );

  const select = (i: number) => {
    const it = items[i];
    if (it && i !== at) onChange(it.value);
  };

  // Pola radiogroup: panah kiri/kanan pindah pilihan, Home/End ke ujung
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const n = items.length;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
    chipRefs.current[next]?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      data-surface={surface}
      data-variant={variant}
      data-fill={fill ? "true" : undefined}
      className={`jelly-tabs ${className}`}
    >
      {items.map((it, i) => (
        <Chip
          key={it.value}
          mv={mvs[i]}
          on={i === at}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          onClick={() => select(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {it.label}
        </Chip>
      ))}
    </div>
  );
}
