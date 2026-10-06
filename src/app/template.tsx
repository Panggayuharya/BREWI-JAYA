"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// true setelah halaman pertama tampil; dipakai supaya fade hanya berjalan saat pindah halaman,
// bukan saat halaman pertama dibuka (HTML dari server tidak boleh mulai dengan opacity 0).
let hasMounted = false;

/**
 * Transisi antar-halaman (landing ↔ News): halaman baru muncul dengan fade lembut.
 * Hanya opacity yang dianimasikan — transform di pembungkus ini akan merusak elemen
 * position: fixed (navbar, pin GSAP, lightbox).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [firstLoad] = useState(() => !hasMounted);
  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <motion.div
      initial={firstLoad || reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT_SOFT }}
    >
      {children}
    </motion.div>
  );
}
