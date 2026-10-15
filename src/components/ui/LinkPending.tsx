"use client";
import { useLinkStatus } from "next/link";

/**
 * Tanda "sedang membuka" untuk kartu yang seluruhnya bisa diklik: lapisan tipis + garis berjalan di bawah kartu,
 * muncul saat halaman tujuan belum siap (mis. di dev, atau prefetch belum selesai). Wajib di dalam <Link>;
 * kartu (ancestor) harus `relative`. Selalu dirender dan hanya opacity yang berubah → tanpa layout shift.
 */
export function LinkPending({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-200 ${
        pending ? "opacity-100 delay-75" : "opacity-0"
      } ${className}`}
    >
      <span className="absolute inset-0 bg-warm/30" />
      <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-accent/25">
        <span className="absolute inset-y-0 w-1/3 animate-[link-pending_0.9s_ease-in-out_infinite] bg-accent" />
      </span>
    </span>
  );
}
