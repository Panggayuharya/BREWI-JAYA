"use client";
import { useSyncExternalStore } from "react";

// Toolbar HP yang naik-turun kadang hanya memicu "resize" di visualViewport (bukan di window), jadi keduanya didengar.
function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  vv?.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
    vv?.removeEventListener("resize", onChange);
  };
}

// Ambil yang terkecil dari innerHeight dan visualViewport:
// - Chrome iOS: innerHeight ikut menghitung area di balik toolbar bawah walau toolbar sedang tampil, jadi lebih
//   tinggi dari layar yang terlihat; visualViewport.height = area yang benar-benar terlihat.
// - × scale: abaikan pinch-zoom (visualViewport.height mengecil saat layar diperbesar).
const getSnapshot = () => {
  const vv = window.visualViewport;
  const inner = window.innerHeight;
  const visible = vv ? vv.height * vv.scale : inner;
  return Math.round(Math.min(inner, visible));
};

/**
 * Tinggi area layar yang benar-benar terlihat (px), ikut berubah saat toolbar browser HP muncul/sembunyi.
 * Dipakai sebagai pengganti 100dvh: di Chrome iOS, dvh tetap setinggi layar saat toolbar tersembunyi,
 * jadi elemen 100dvh lebih tinggi dari area terlihat ketika toolbar sedang tampil.
 * null saat render server → pakai fallback CSS.
 */
export function useViewportHeight(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
