"use client";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Fade-up halus sekali saat elemen masuk layar (0.7s, ease-out-soft).
 * Reduced motion: langsung tampil tanpa gerak.
 */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
