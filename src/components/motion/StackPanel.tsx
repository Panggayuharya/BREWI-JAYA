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
  /** Tepi atas bergelombang (bukan sudut membulat), mis. Galeri yang naik menimpa Menu */
  wave?: boolean;
}

/**
 * Bentuk gelombang tepi atas (naik di kiri, turun di tengah, naik lagi di kanan lalu landai).
 * Dipakai sebagai mask: area di atas kurva transparan, jadi section sebelumnya terlihat di baliknya.
 * preserveAspectRatio none → kurva melebar mengikuti lebar layar, tingginya tetap --wave-h.
 */
const WAVE_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 70C80 30 160 8 240 8C360 8 480 112 610 112C740 112 870 8 1010 8C1150 8 1300 70 1440 72V120H0Z"/></svg>`,
);
const WAVE_MASK = `url("data:image/svg+xml,${WAVE_SVG}") top / 100% var(--wave-h) no-repeat, linear-gradient(#000, #000) 0 calc(var(--wave-h) - 1px) / 100% 100% no-repeat`;

const WAVE_STYLE: React.CSSProperties = {
  // Tinggi gelombang: 56px di HP sampai 120px di layar lebar
  ["--wave-h" as string]: "clamp(56px, 8vw, 120px)",
  mask: WAVE_MASK,
  WebkitMask: WAVE_MASK,
};

/**
 * Pembungkus section yang "menimpa" section sebelumnya (design.md 1 & 12.1).
 * Section baru naik dengan sudut atas membulat; section sebelumnya tetap ukuran normal
 * (tidak dikecilkan) dan tanpa efek gelap.
 */
export function StackPanel({ children, className = "", pinPrevious = false, wave = false }: StackPanelProps) {
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
    // Gelombang: panel naik setinggi --wave-h (bukan hanya --radius-section) supaya lekukan terdalam pun tetap
    // menimpa section sebelumnya; padding-top yang sama menjaga isi panel tetap di posisi lamanya.
    <div
      ref={ref}
      style={wave ? WAVE_STYLE : undefined}
      className={`relative overflow-clip ${
        wave ? "-mt-(--wave-h) pt-[calc(var(--wave-h)-var(--radius-section))]" : "-mt-(--radius-section) rounded-t-section shadow-lift"
      } ${className}`}
    >
      {children}
    </div>
  );
}
