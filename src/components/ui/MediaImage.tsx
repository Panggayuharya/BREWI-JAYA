import Image from "next/image";
import { uiText } from "@/data/site";

interface MediaImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** "eager" untuk foto yang bisa langsung terlihat saat halaman dibuka (mis. dibuka lewat #tentang) */
  loading?: "eager" | "lazy";
  className?: string;
  /** Label kecil di placeholder saat foto belum ada. */
  label?: string;
  /** "contain" untuk foto produk transparan (gelas utuh, tidak terpotong). */
  fit?: "cover" | "contain";
  /** Warna placeholder: "dark" untuk section navy, "light" untuk section cream. */
  placeholderTone?: "dark" | "light";
}

const placeholderTones = {
  dark: "bg-linear-to-br from-deep to-navy-soft text-cream/50",
  light: "bg-[radial-gradient(ellipse_at_50%_120%,rgb(124_198_255/0.22),transparent_70%),var(--color-cream)] text-coffee/55",
} as const;

/**
 * Foto dengan fallback placeholder. Parent wajib `relative` dan punya ukuran.
 * Selama `src` kosong, tampil kotak placeholder (tinggal isi path di src/data/).
 */
export function MediaImage({
  src,
  alt,
  sizes,
  priority,
  loading,
  className = "",
  label,
  fit = "cover",
  placeholderTone = "dark",
}: MediaImageProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center text-center text-small font-semibold uppercase tracking-wider ${placeholderTones[placeholderTone]} ${className}`}
      >
        <span className="px-3">{label ?? uiText.photoSoon}</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      // Kualitas 90 (bawaan Next 75): foto produk & suasana lebih tajam di layar HP/retina
      quality={90}
      priority={priority}
      loading={loading}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}
