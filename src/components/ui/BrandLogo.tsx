import Image from "next/image";

/**
 * Logo Brewi Jaya (huruf "jb") dari public/brand/logo.avif.
 * Gambar sudah berupa lingkaran putih + logo navy, aman di latar gelap maupun terang.
 */
const sizes = {
  sm: "size-11",
  md: "size-14",
  lg: "size-44 sm:size-56",
} as const;

interface BrandLogoProps {
  size?: keyof typeof sizes;
  /** "mark" tidak memakai ukuran bawaan, sehingga ukurannya diatur lewat className. */
  variant?: "badge" | "mark";
  className?: string;
  title?: string;
}

export function BrandLogo({ size = "sm", variant = "badge", className = "", title = "Brewi Jaya" }: BrandLogoProps) {
  const sizeClass = variant === "mark" ? "" : sizes[size];

  return (
    <Image
      src="/brand/logo.avif"
      alt={title}
      width={512}
      height={512}
      className={`block shrink-0 ${sizeClass} ${className}`}
    />
  );
}
