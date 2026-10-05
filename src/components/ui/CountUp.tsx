"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface CountUpProps {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/** Angka naik saat pertama terlihat. (Bisa diganti Count Up dari React Bits.) */
export function CountUp({ to, duration = 1.4, format = (n) => String(n), className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const state = { n: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        n: to,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = format(Math.round(state.n));
        },
      });
    },
    { scope: ref, dependencies: [to] },
  );

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
