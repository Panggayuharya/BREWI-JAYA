"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO_EVENT } from "@/lib/introState";
import { documentTop } from "@/lib/utils";
import { getSiteSettings, navLinks } from "@/data/site";
import { useScrollTo } from "@/components/motion/SmoothScrollProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { JellyNav } from "@/components/ui/JellyNav";
import { MobileMenu } from "./MobileMenu";

/** dark = transparan di atas hero, light = bar navy di section gelap, cream = bar cream di section terang */
type NavTheme = "dark" | "light" | "cream";

export function Navbar() {
  const scrollTo = useScrollTo();
  const router = useRouter();
  // Di landing page link men-scroll ke section; di halaman lain (mis. /news) link pindah ke /#section.
  const pathname = usePathname();
  const onHome = pathname === "/";
  const site = getSiteSettings();
  const [active, setActive] = useState(onHome ? "home" : pathname.startsWith("/menu") ? "menu" : "news");
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [inIntro, setInIntro] = useState(false);
  const [open, setOpen] = useState(false);
  // Selama scroll karena klik menu, chip aktif ditahan di tujuan (tidak berkedip melewati tiap section).
  const travelTo = useRef<string | null>(null);

  useGSAP(() => {
    // Section menandai dirinya dengan data-nav (id link) dan data-nav-theme (dark | light | cream).
    // Section aktif = section yang memotong garis patokan: tengah layar, atau data-nav-line (px dari atas).
    // Posisi diukur dengan documentTop (posisi asli di halaman), jadi tetap benar saat ada section
    // yang sedang di-pin tanpa spacing (overlapping). Di dalam jarak pin (mis. Intro) tidak ada
    // section yang cocok → link aktif terakhir dipertahankan.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
    const spy = (scroll: number) => {
      let found: HTMLElement | undefined;
      for (const el of sections) {
        const line = scroll + (el.dataset.navLine ? Number(el.dataset.navLine) : window.innerHeight / 2);
        const top = documentTop(el);
        if (line >= top && line < top + el.offsetHeight) found = el;
      }
      if (!found) return;
      if (!travelTo.current) setActive(found.dataset.nav ?? "home");
      const t = found.dataset.navTheme;
      setTheme(t === "light" || t === "cream" ? t : "dark");
    };

    ScrollTrigger.create({
      start: 0,
      end: "max",
      refreshPriority: -1,
      onRefresh: (self) => spy(self.scroll()),
      onUpdate: (self) => spy(self.scroll()),
    });

    // Pengunjung scroll sendiri di tengah perjalanan → lepaskan tahanan chip.
    const release = () => (travelTo.current = null);
    const inputs = ["wheel", "touchstart", "keydown"] as const;
    inputs.forEach((type) => window.addEventListener(type, release, { passive: true }));
    return () => inputs.forEach((type) => window.removeEventListener(type, release));
  });

  // useLayoutEffect: harus sudah mendengarkan sebelum Intro mengirim sinyal pertamanya
  useLayoutEffect(() => {
    const onIntro = (e: Event) => setInIntro((e as CustomEvent<boolean>).detail);
    window.addEventListener(INTRO_EVENT, onIntro);
    return () => window.removeEventListener(INTRO_EVENT, onIntro);
  }, []);

  const hrefFor = (id: string) => (onHome ? `#${id}` : id === "news" ? "/news" : id === "home" ? "/" : `/#${id}`);

  const go = (id: string) => {
    setOpen(false);
    if (!onHome) {
      router.push(hrefFor(id));
      return;
    }
    travelTo.current = id;
    setActive(id);
    scrollTo(`#${id}`, () => {
      travelTo.current = null;
      ScrollTrigger.update(); // sinkronkan tema navbar dengan section tujuan
    });
  };

  const bar = open
    ? "bg-transparent text-warm"
    : theme === "light"
      ? "bg-ink/75 text-warm backdrop-blur-md"
      : theme === "cream"
        ? "bg-cream/85 text-ink backdrop-blur-md"
        : "bg-transparent text-warm";
  // Navbar selalu terlihat saat scroll (juga saat section saling menimpa); hanya disembunyikan selama intro.
  const isHidden = inIntro && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[translate,background-color,color,border-color] duration-(--dur-base) ease-out-soft ${
          // focus-within: navbar muncul jika link di dalamnya difokus keyboard saat intro
          isHidden ? "-translate-y-full focus-within:translate-y-0" : "translate-y-0"
        } ${bar}`}
      >
        {/* Lebar penuh (bukan container 1280px) supaya logo menempel lebih ke kiri */}
        <nav
          aria-label="Navigasi utama"
          className="flex h-(--nav-h) w-full items-center justify-between gap-6 px-[clamp(16px,2.5vw,40px)]"
        >
          <a
            id="nav-logo"
            href={hrefFor("home")}
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
            className="flex min-h-11 items-center"
            aria-label={site.brandName}
          >
            <BrandLogo size="sm" />
          </a>

          <JellyNav
            className="hidden lg:flex"
            items={navLinks.map((link) => ({ ...link, href: hrefFor(link.id) }))}
            active={active}
            onNavigate={go}
            tone={theme === "cream" && !open ? "light" : "dark"}
          />

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-pill lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-2xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </nav>
      </header>
      <MobileMenu open={open} active={active} hrefFor={hrefFor} onNavigate={go} />
    </>
  );
}
