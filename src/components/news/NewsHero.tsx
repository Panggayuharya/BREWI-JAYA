/** Tema navbar berganti tepat di garis bawah navbar (hero halaman News bisa lebih pendek dari setengah layar). */
const navEdge = { "data-nav-line": "72" };

import { StackPanel } from "@/components/motion/StackPanel";

/**
 * Kepala halaman News (juga dipakai halaman detail menu, `nav="menu"`) berlatar navy. Hero ditahan (pin) sementara konten (`NewsBody`) naik
 * menimpanya dengan sudut atas membulat, sama seperti overlapping section di landing page.
 */
export function NewsHero({ children, className = "", nav = "news" }: { children: React.ReactNode; className?: string; nav?: string }) {
  return (
    <section data-nav={nav} data-nav-theme="light" {...navEdge} className="relative overflow-hidden bg-ink text-warm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,var(--color-navy-soft)_0%,transparent_55%)]"
      />
      <div data-stack-content className={`container-brewi relative flex flex-col gap-6 pt-[calc(var(--nav-h)+4rem)] ${className}`}>
        {children}
      </div>
    </section>
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
