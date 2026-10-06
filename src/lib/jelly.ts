// Efek "jelly" bersama untuk JellyNav (navbar) dan JellyTabs (tab pilihan):
// chip aktif membesar, chip lain terdorong ke samping & sedikit mengecil dengan pegas.
// Diadaptasi dari komponen JellyRadio (React Bits).
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { animate, motionValue, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type JellyChipMV = { x: MotionValue<number>; sx: MotionValue<number>; sy: MotionValue<number> };

// Lebih kalem dari default JellyRadio supaya terasa premium, bukan main-main.
const JELLY = {
  swell: 0.12, // chip aktif membesar 12%
  barge: 4, // chip lain terdorong ke samping (px)
  shrink: 0.04, // chip lain sedikit mengecil
  jelly: 0.8,
  bounce: 0.22,
  stagger: 18, // ms per jarak chip
  stiffness: 520,
} as const;

const spring = (k: number, m: number, bounce: number) => ({
  type: "spring" as const,
  stiffness: k,
  damping: 2 * Math.sqrt(k * m) * (1 - bounce),
  mass: m,
});

/**
 * Gerakkan semua chip ke keadaan untuk `target` (indeks chip aktif; -1 = tidak ada yang aktif, semua diam).
 * `instant` / `reduce` → langsung lompat tanpa pegas.
 */
function applyJelly(mvs: JellyChipMV[], widths: number[], target: number, instant: boolean, reduce: boolean) {
  const { swell, barge, shrink, jelly, bounce, stagger, stiffness } = JELLY;
  const push = target < 0 ? 0 : ((widths[target] ?? 0) * swell) / 2 + barge;
  mvs.forEach((mv, i) => {
    const on = i === target;
    const far = target < 0 ? 0 : Math.abs(i - target);
    const x = target < 0 ? 0 : Math.sign(i - target) * push;
    const s = target < 0 ? 1 : on ? 1 + swell : 1 - shrink;
    if (instant || reduce) {
      mv.x.jump(x);
      mv.sx.jump(s);
      mv.sy.jump(s);
      return;
    }
    const k = stiffness * (1 - 0.12 * Math.min(far, 3));
    const inFlight = mv.x.isAnimating() || mv.sx.isAnimating() || mv.sy.isAnimating();
    const delay = inFlight ? 0 : (far * stagger) / 1000;
    animate(mv.x, x, { ...spring(k, 0.9, bounce), delay });
    animate(mv.sx, s, { ...spring(k * (1 + 0.24 * jelly), 0.9 - 0.1 * jelly, Math.min(0.85, bounce + 0.3 * jelly)), delay });
    animate(mv.sy, s, { ...spring(k * (1 - 0.14 * jelly), 0.9 + 0.05 * jelly, bounce), delay: delay + 0.05 * jelly });
  });
}

/** Ruang di sisi grup supaya chip yang membesar/terdorong tidak terpotong. */
function jellyPadding(widths: number[], chipH: number) {
  const maxW = Math.max(0, ...widths);
  return {
    x: Math.ceil((maxW * JELLY.swell * 1.3) / 2 + JELLY.barge) + 2,
    y: Math.ceil((chipH * JELLY.swell) / 2) + 2,
  };
}

/**
 * Logika grup chip jelly (JellyNav & JellyTabs): satu set motion value per chip, ukur lebar chip
 * + beri ruang di sisi grup (CSS var `<padVar>-x` / `<padVar>-y`), lalu animasikan setiap kali
 * `selected` berubah (-1 = tidak ada chip aktif).
 */
export function useJellyGroup<T extends HTMLElement>(keys: string[], selected: number, padVar: string) {
  const reduce = useReducedMotion();
  const groupRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(T | null)[]>([]);
  const widths = useRef<number[]>([]);
  const applied = useRef(selected);
  const itemsKey = keys.join("|");

  // Satu set motion value (geser x, skala x/y) per chip; dibuat ulang hanya jika daftar chip berubah.
  const mvs = useMemo<JellyChipMV[]>(
    () =>
      Array.from({ length: itemsKey.split("|").length }, () => ({
        x: motionValue(0),
        sx: motionValue(1),
        sy: motionValue(1),
      })),
    [itemsKey],
  );
  const apply = (target: number, instant: boolean) => applyJelly(mvs, widths.current, target, instant, reduce);

  useLayoutEffect(() => {
    const settle = () => {
      const group = groupRef.current;
      if (!group) return;
      widths.current = chipRefs.current.map((el) => el?.offsetWidth ?? 0);
      const pad = jellyPadding(widths.current, chipRefs.current[0]?.offsetHeight ?? 0);
      group.style.setProperty(`${padVar}-x`, `${pad.x}px`);
      group.style.setProperty(`${padVar}-y`, `${pad.y}px`);
      apply(applied.current, true);
    };
    settle();
    const observer = new ResizeObserver(settle);
    if (groupRef.current) observer.observe(groupRef.current);
    document.fonts?.ready.then(settle);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply membaca ref terbaru
  }, [itemsKey, padVar]);

  // Chip aktif berubah (klik, keyboard, scroll-spy, atau dari luar mis. putaran otomatis menu) → animasi jelly
  useEffect(() => {
    if (applied.current === selected) return;
    applied.current = selected;
    apply(selected, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply membaca ref terbaru
  }, [selected]);

  useEffect(
    () => () =>
      mvs.forEach((mv) => {
        mv.x.destroy();
        mv.sx.destroy();
        mv.sy.destroy();
      }),
    [mvs],
  );

  return { groupRef, chipRefs, mvs };
}

/** Transform satu chip (geser + skala) dari motion value-nya. */
export function useJellyTransform(mv: JellyChipMV) {
  return useTransform(() => `translateX(${mv.x.get()}px) scale(${mv.sx.get()}, ${mv.sy.get()})`);
}
