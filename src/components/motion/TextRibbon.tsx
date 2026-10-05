"use client";
import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

/** Pita teks berjalan di antara Tempat dan Menu; arah ikut arah scroll. */
export function TextRibbon({ words }: { words: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const line = [...words, ...words, ...words];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        gsap.fromTo(
          "[data-ribbon-track]",
          { xPercent: 0 },
          {
            xPercent: -33.333,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className="relative z-10 overflow-hidden bg-coffee-dark py-4">
      <div data-ribbon-track className="flex w-max gap-10 whitespace-nowrap">
        {line.map((w, i) => (
          <span key={i} className="font-display text-subtitle font-light text-cream italic">
            {w} <span className="ml-10 text-accent not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
