"use client";
import { useNow } from "@/hooks/useNow";
import { uiText } from "@/data/site";

/**
 * Label "Tempat sedang penuh" selama `fullUntil` belum lewat. Dihitung di browser (useNow), jadi
 * halaman statis tetap akurat: status otomatis hilang saat waktunya habis walau cache halaman belum diperbarui.
 */
export function FullBadge({
  fullUntil,
  surface,
  className = "",
}: {
  fullUntil: string | null;
  /** Warna latar section: "light" (cream) atau "dark" (navy) */
  surface: "light" | "dark";
  className?: string;
}) {
  const now = useNow();
  if (!fullUntil || !now || new Date(fullUntil) <= now) return null;

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-pill px-3 py-1 text-small font-semibold ${
        surface === "dark" ? "bg-warm/10 text-warm" : "bg-coffee/10 text-coffee"
      } ${className}`}
    >
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      {uiText.placeFull}
    </span>
  );
}
