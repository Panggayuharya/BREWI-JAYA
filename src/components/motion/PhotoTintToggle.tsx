"use client";
import { useEffect } from "react";

/**
 * Pasangan CSS [data-tint] (globals.css): klik/ketuk foto bernada latar → warna aslinya muncul
 * (data-color-on). Klik lagi atau klik di luar → kembali bernada latar. Penting untuk layar sentuh
 * yang tidak punya hover.
 */
export function PhotoTintToggle() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest?.("[data-tint]") ?? null;
      document.querySelectorAll("[data-color-on]").forEach((el) => {
        if (el !== target) el.removeAttribute("data-color-on");
      });
      if (target) target.toggleAttribute("data-color-on");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
