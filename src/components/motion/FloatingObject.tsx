"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

interface FloatingObjectProps {
  /** Path gambar PNG/SVG transparan. Kosong = bentuk placeholder biji kopi. */
  src?: string;
  size?: number;
  /** Posisi dalam persen terhadap parent (parent harus relative). */
  top: string;
  left: string;
  /** Kecepatan parallax: positif = naik lebih cepat, negatif = tertinggal. */
  speed?: number;
  /** Rotasi total (derajat) sepanjang scroll. */
  rotate?: number;
  hideOnMobile?: boolean;
  className?: string;
}

export function FloatingObject({
  src,
  size = 40,
  top,
  left,
  speed = 1,
  rotate = 90,
  hideOnMobile = false,
  className = "",
}: FloatingObjectProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const run = () => {
        gsap.to(ref.current, {
          yPercent: -120 * speed,
          rotate,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current?.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      };
      mm.add(MQ.desktop, run);
      if (!hideOnMobile) mm.add(MQ.mobile, run);
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute z-10 ${hideOnMobile ? "hidden lg:block" : ""} ${className}`}
      style={{ top, left, width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-contain" />
      ) : (
        // TODO: ganti dengan PNG biji kopi / daun / es batu di public/floating
        <span className="block h-full w-full rounded-[50%/60%] bg-accent/60 shadow-lift" />
      )}
    </div>
  );
}
