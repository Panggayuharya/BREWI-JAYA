"use client";
import { useSyncExternalStore } from "react";

/**
 * Waktu sekarang (dibulatkan per menit) hanya di browser; null saat render server
 * supaya status buka/tutup tidak menimbulkan hydration mismatch.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(
    (onChange) => {
      const id = window.setInterval(onChange, 30_000);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  return minute === null ? null : new Date(minute * 60_000);
}
