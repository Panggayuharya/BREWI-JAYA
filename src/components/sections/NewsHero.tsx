import Link from "next/link";
import { StackPanel } from "@/components/motion/StackPanel";
import { buttonClass } from "@/components/ui/Button";

/** Tema navbar berganti tepat di garis bawah navbar (hero halaman News bisa lebih pendek dari setengah layar). */
const navEdge = { "data-nav-line": "72" };

/**
 * Kepala halaman News & Menu (`nav="menu"`) berlatar navy. Hero ditahan (pin) sementara konten (`NewsBody`)
 * naik menimpanya dengan sudut atas membulat, sama seperti overlapping section di landing page.
 */
export function NewsHero({
  children,
  nav = "news",
  backdrop,
}: {
  children: React.ReactNode;
  nav?: string;
  /** Hiasan di belakang isi hero (mis. foto berita samar di sisi kanan). */
  backdrop?: React.ReactNode;
}) {
  return (
    <section data-nav={nav} data-nav-theme="light" {...navEdge} className="relative overflow-hidden bg-ink text-warm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,var(--color-navy-soft)_0%,transparent_55%)]"
      />
      {backdrop}
      {/* pb: ruang untuk sudut membulat NewsBody yang naik menimpa hero, ditambah jarak ke isi */}
      <div
        data-stack-content
        className="container-brewi relative flex flex-col gap-6 pt-[calc(var(--nav-h)+4rem)] pb-[calc(var(--radius-section)+4.5rem)]"
      >
        {children}
      </div>
    </section>
  );
}

/** Tombol kembali (pill + panah): `outline-light` di hero gelap, `outline-navy` di latar terang. */
export function BackButton({ href, label, variant }: { href: string; label: string; variant: "outline-light" | "outline-navy" }) {
  return (
    <Link href={href} className={buttonClass(variant, "group w-fit pl-5")}>
      <span aria-hidden className="text-lg leading-none transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      {label}
    </Link>
  );
}

/** Eyebrow + judul + subjudul standar di dalam NewsHero. */
export function HeroHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <>
      <p className="eyebrow text-accent">{eyebrow}</p>
      <h1 className="font-display text-hero font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="max-w-xl text-subtitle leading-relaxed text-cream/75">{subtitle}</p>
    </>
  );
}

export function NewsBody({ children, className = "", nav = "news" }: { children: React.ReactNode; className?: string; nav?: string }) {
  return (
    <StackPanel className="bg-warm" pinPrevious>
      <section data-nav={nav} data-nav-theme="cream" {...navEdge} className={`relative bg-warm ${className}`}>
        {children}
      </section>
    </StackPanel>
  );
}
