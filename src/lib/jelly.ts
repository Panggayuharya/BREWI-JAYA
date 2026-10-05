// Efek "jelly" bersama untuk JellyNav (navbar) dan JellyTabs (tab pilihan):
// chip aktif membesar, chip lain terdorong ke samping & sedikit mengecil dengan pegas.
// Diadaptasi dari komponen JellyRadio (React Bits).
import { animate, motionValue, type MotionValue } from "motion/react";

export type JellyChipMV = { x: MotionValue<number>; sx: MotionValue<number>; sy: MotionValue<number> };

// Lebih kalem dari default JellyRadio supaya terasa premium, bukan main-main.
export const JELLY = {
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

export function createJellyMVs(count: number): JellyChipMV[] {
  return Array.from({ length: count }, () => ({ x: motionValue(0), sx: motionValue(1), sy: motionValue(1) }));
}

export function destroyJellyMVs(mvs: JellyChipMV[]) {
  mvs.forEach((mv) => {
    mv.x.destroy();
    mv.sx.destroy();
    mv.sy.destroy();
  });
}

/**
 * Gerakkan semua chip ke keadaan untuk `target` (indeks chip aktif; -1 = tidak ada yang aktif, semua diam).
 * `instant` / `reduce` → langsung lompat tanpa pegas.
 */
export function applyJelly(mvs: JellyChipMV[], widths: number[], target: number, instant: boolean, reduce: boolean) {
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
export function jellyPadding(widths: number[], chipH: number) {
  const maxW = Math.max(0, ...widths);
  return {
    x: Math.ceil((maxW * JELLY.swell * 1.3) / 2 + JELLY.barge) + 2,
    y: Math.ceil((chipH * JELLY.swell) / 2) + 2,
  };
}
