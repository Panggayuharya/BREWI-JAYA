"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { documentTop } from "@/lib/utils";

const LenisContext = createContext<Lenis | null>(null);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ autoRaf: false, lerp: 0.1 });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- instance Lenis hanya ada di browser
    setLenis(instance);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  return useContext(LenisContext);
}

/** Kunci scroll halaman (Lenis + overflow <html>) selama `locked` true; dipakai overlay layar penuh. */
export function useScrollLock(locked = true) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    lenis?.stop();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [locked, lenis]);
}

/** Lompat langsung ke posisi scroll `y` (tanpa animasi); Lenis ikut disinkronkan bila aktif. */
export function jumpScroll(lenis: Lenis | null, y: number) {
  window.scrollTo(0, y);
  lenis?.scrollTo(y, { immediate: true, force: true });
}

/** easeInOutCubic: pelan di awal & akhir, tanpa hentakan */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scroll halus ke elemen (selector, mis. "#menu"); fallback ke native scroll jika Lenis tidak aktif (reduced motion).
 * Posisi dihitung lewat documentTop agar tetap tepat saat section sedang di-pin.
 * Durasi mengikuti jarak (0,7–1,8 detik) supaya lompatan jauh tetap tenang dan lompatan dekat tetap cepat.
 * `onComplete` dipanggil saat scroll selesai (dipakai navbar untuk menahan chip aktif selama perjalanan).
 */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (selector: string, onComplete?: () => void) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const to = documentTop(el);
      if (!lenis) {
        window.scrollTo({ top: to });
        onComplete?.();
        return;
      }
      const duration = Math.min(1.8, Math.max(0.7, Math.abs(to - window.scrollY) / 2600));
      lenis.scrollTo(to, { duration, easing: easeInOut, onComplete: () => onComplete?.() });
    },
    [lenis],
  );
}
