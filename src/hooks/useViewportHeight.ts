"use client";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// × scale: abaikan pinch-zoom (innerHeight mengecil saat layar diperbesar)
const getSnapshot = () => Math.round(window.innerHeight * (window.visualViewport?.scale ?? 1));

/**
 * Tinggi area layar yang benar-benar terlihat (px), ikut berubah saat toolbar browser HP muncul/sembunyi.
 * Dipakai sebagai pengganti 100dvh: di Chrome iOS, dvh tetap setinggi layar saat toolbar tersembunyi,
 * jadi elemen 100dvh lebih tinggi dari area terlihat ketika toolbar sedang tampil.
 * null saat render server → pakai fallback CSS.
 */
export function useViewportHeight(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
