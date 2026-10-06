import { useId } from "react";
import { getSiteSettings } from "@/data/site";

const sizes = {
  sm: "size-11",
  md: "size-14",
  lg: "size-44 sm:size-56",
} as const;

// Bentuk logo "jb" (sama dengan src/app/icon.svg), viewBox 91 41 750 750.
const GLYPH = {
  j: "M318 204H444V566A64 64 0 0 1 380 630H201V472H245A73 73 0 0 0 318 399Z",
  b: "M430 356L444 356C472 318 520 295 578 295C661 295 731 365 731 462C731 560 661 630 578 630C520 630 475 612 455 578L444 566L430 560Z",
  /** Lubang (counter) huruf b */
  hole: "M441 462C455 420 490 389 532 389C572 389 601 420 601 460C601 500 572 531 532 531C492 531 458 505 441 462Z",
};

/**
 * Logo Brewi Jaya (lingkaran putih + huruf "jb" navy) sebagai SVG: tajam di semua ukuran & layar retina.
 * `shine` (Intro): pita cahaya miring melintas berkala, di-mask bentuk huruf j & b (tanpa lubang b),
 * jadi kilau hanya terlihat di dalam huruf — tidak di lingkaran putih maupun kotak di sekeliling logo.
 */
export function BrandLogo({ size = "sm", shine = false }: { size?: keyof typeof sizes; shine?: boolean }) {
  const id = useId();
  const glyphMask = `${id}glyph`;
  const shineFill = `${id}shine`;

  return (
    <svg
      viewBox="91 41 750 750"
      role="img"
      aria-label={getSiteSettings().brandName}
      className={`block shrink-0 ${sizes[size]}`}
    >
      <circle cx="466" cy="416" r="374" className="fill-white" />
      <path d={GLYPH.j} className="fill-brewi-navy" />
      <path d={GLYPH.b} className="fill-brewi-navy" />
      <path d={GLYPH.hole} className="fill-white" />

      {shine && (
        <>
          <defs>
            <mask id={glyphMask} maskUnits="userSpaceOnUse" x="91" y="41" width="750" height="750">
              <path d={GLYPH.j} fill="#fff" />
              <path d={GLYPH.b} fill="#fff" />
              <path d={GLYPH.hole} fill="#000" />
            </mask>
            {/* Inti putih terang, tepi biru aksen yang memudar */}
            <linearGradient id={shineFill}>
              <stop offset="0" stopOpacity="0" className="[stop-color:var(--color-accent)]" />
              <stop offset="0.3" stopOpacity="0.4" className="[stop-color:var(--color-accent)]" />
              <stop offset="0.5" stopOpacity="0.95" className="[stop-color:var(--color-warm)]" />
              <stop offset="0.7" stopOpacity="0.4" className="[stop-color:var(--color-accent)]" />
              <stop offset="1" stopOpacity="0" className="[stop-color:var(--color-accent)]" />
            </linearGradient>
          </defs>
          {/* Mask diam di tempat; hanya pita di dalamnya yang bergerak (.logo-shine di globals.css) */}
          <g mask={`url(#${glyphMask})`}>
            <g transform="skewX(-18)">
              <rect className="logo-shine" x="0" y="41" width="170" height="750" fill={`url(#${shineFill})`} />
            </g>
          </g>
        </>
      )}
    </svg>
  );
}
