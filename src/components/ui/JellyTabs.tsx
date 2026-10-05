"use client";
// Tab pilihan dengan efek jelly (diadaptasi dari JellyRadio, sama dengan JellyNav di navbar):
// chip yang diklik membesar, chip lain terdorong ke samping dengan pegas.
// Dipakai untuk kategori menu, pilihan outlet, dan filter berita. Warna di .jelly-tabs (globals.css).
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { applyJelly, createJellyMVs, destroyJellyMVs, jellyPadding, type JellyChipMV } from "@/lib/jelly";

export interface JellyTabItem<T extends string> {
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
  const transform = useTransform(() => `translateX(${mv.x.get()}px) scale(${mv.sx.get()}, ${mv.sy.get()})`);
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
  const reduce = useReducedMotion();
  const at = Math.max(
    0,
    items.findIndex((it) => it.value === value),
  );

  const groupRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const widths = useRef<number[]>([]);
  const applied = useRef(at);
  const itemsKey = items.map((it) => it.value).join("|");

  const mvs = useMemo(() => createJellyMVs(itemsKey.split("|").length), [itemsKey]);
  const apply = (target: number, instant: boolean) => applyJelly(mvs, widths.current, target, instant, reduce);

  // Ukur lebar chip + beri ruang di sisi grup agar chip yang membesar tidak terpotong.
  useLayoutEffect(() => {
    const settle = () => {
      const group = groupRef.current;
      if (!group) return;
      widths.current = chipRefs.current.map((el) => el?.offsetWidth ?? 0);
      const pad = jellyPadding(widths.current, chipRefs.current[0]?.offsetHeight ?? 0);
      group.style.setProperty("--jt-pad-x", `${pad.x}px`);
      group.style.setProperty("--jt-pad-y", `${pad.y}px`);
      apply(applied.current, true);
    };
    settle();
    const observer = new ResizeObserver(settle);
    if (groupRef.current) observer.observe(groupRef.current);
    document.fonts?.ready.then(settle);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply membaca ref terbaru
  }, [itemsKey]);

  // Pilihan berubah (klik, keyboard, atau dari luar mis. putaran otomatis menu) → animasi jelly
  useEffect(() => {
    if (applied.current === at) return;
    applied.current = at;
    apply(at, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply membaca ref terbaru
  }, [at]);

  useEffect(() => () => destroyJellyMVs(mvs), [mvs]);

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
