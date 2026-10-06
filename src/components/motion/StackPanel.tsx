"use client";
import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface StackPanelProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Tahan (pin) section sebelumnya selama panel ini naik, sehingga panel benar-benar
   * menimpa section itu (bukan sekadar lewat). Jangan dipakai jika section sebelumnya
   * sudah di-pin sendiri (Intro) — tidak boleh pin di dalam/di atas pin.
   */
  pinPrevious?: boolean;
}

/**
 * Pembungkus section yang "menimpa" section sebelumnya (design.md 1 & 12.1).
 * Section baru naik dengan sudut atas membulat; section sebelumnya tetap ukuran normal
 * (tidak dikecilkan) dan tanpa efek gelap.
 */
export function StackPanel({ children, className = "", pinPrevious = false }: StackPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!pinPrevious) return;
      gsap.matchMedia().add(MQ.motion, () => {
        const prev = ref.current?.previousElementSibling as HTMLElement | null;
        if (!prev) return;
        // Pin dimulai saat dasar section sebelumnya menyentuh dasar layar (= panel ini mulai naik),
        // selesai saat panel ini menutupi layar. pinSpacing false → panel naik di atasnya.
        // clamp(): di halaman pendek (hero News) titik mulai bisa < 0; dibatasi ke 0 supaya
        // section sebelumnya di-pin di posisi aslinya, bukan terdorong ke bawah.
        // Jika section sebelumnya lebih pendek dari layar (mis. Galeri di HP), pin baru dimulai saat
        // atasnya menyentuh atas layar — kalau tidak, ia "tergantung" di tengah layar sementara
        // section di atasnya terus ter-scroll, sehingga tampak menumpuk/aneh.
        ScrollTrigger.create({
          trigger: ref.current,
          start: () => `clamp(top ${Math.min(prev.offsetHeight, window.innerHeight)}px)`,
          end: "top top",
          pin: prev,
          pinSpacing: false,
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`relative -mt-(--radius-section) overflow-clip rounded-t-section shadow-lift ${className}`}>
      {children}
    </div>
  );
}
