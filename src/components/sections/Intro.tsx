"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { setIntroActive } from "@/lib/introState";
import { uiText } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { jumpScroll, useLenis } from "@/components/motion/SmoothScrollProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Aurora } from "@/components/reactbits/Aurora";
import { documentTop } from "@/lib/utils";

// Pusat lingkaran yang membuka Home = posisi logo (tengah layar)
const ORIGIN = "50% 50vh";

/**
 * Intro (design.md 3), versi elegan:
 * - Otomatis: aurora WebGL (Aurora) bergerak pelan, logo muncul dari blur, dua cincin tipis tergambar, lalu nama brand.
 * - Scroll (di-pin): cahaya hangat melebar, logo meluncur ke navbar, Home terbuka lewat lingkaran
 *   dari tengah dengan riak cincin di tepinya.
 * Intro membungkus Home, jadi tidak ada layar kosong. Setelah selesai, pin dibuang dan scroll dikoreksi.
 * Intro selalu diputar setiap halaman dibuka (permintaan pemilik; aturan sessionStorage di CLAUDE.md tidak dipakai).
 */
export function Intro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const removedDistance = useRef(0);
  const active = !reduced && !finished;

  const pendingHash = useRef<string | null>(null);

  // Selalu mulai dari paling atas agar intro terlihat (browser tidak memulihkan posisi scroll lama).
  // Kecuali datang dengan hash (mis. /#lokasi dari halaman News): intro dilewati, langsung ke section itu.
  useLayoutEffect(() => {
    window.history.scrollRestoration = "manual";
    if (window.location.hash.length > 1) {
      pendingHash.current = window.location.hash;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hash hanya bisa dibaca di browser
      setFinished(true);
      return;
    }
    window.scrollTo(0, 0);
  }, []);

  // Setelah intro dilewati karena hash: lompat ke section tujuan. Tata letak masih bisa berubah
  // sesaat setelah halaman dibuka (font & gambar selesai dimuat → ScrollTrigger menghitung ulang pin),
  // jadi selama ~3 detik posisi dicek ulang dan dikoreksi, kecuali pengunjung sudah scroll sendiri.
  useEffect(() => {
    if (!finished || !pendingHash.current) return;
    const el = document.getElementById(decodeURIComponent(pendingHash.current.slice(1)));
    if (!el) return;
    let userMoved = false;
    const stop = () => (userMoved = true);
    const jump = () => {
      if (userMoved) return;
      const y = documentTop(el);
      if (Math.abs(window.scrollY - y) > 2) jumpScroll(lenis, y);
    };
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) => window.addEventListener(type, stop, { passive: true }));
    const first = window.setTimeout(() => {
      ScrollTrigger.refresh();
      jump();
    }, 60);
    const check = window.setInterval(jump, 200);
    const done = window.setTimeout(() => {
      pendingHash.current = null;
      window.clearInterval(check);
    }, 3000);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(done);
      window.clearInterval(check);
      inputs.forEach((type) => window.removeEventListener(type, stop));
    };
  }, [finished, lenis]);

  useGSAP(
    () => {
      if (!active) return;
      const mm = gsap.matchMedia();

      const build = (pinLength: string) => {
        setIntroActive(true);
        const logo = ref.current?.querySelector<HTMLElement>("[data-intro-logo]");
        const navLogo = document.getElementById("nav-logo");

        // Tahap otomatis (tanpa scroll)
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo("[data-intro-aurora]", { opacity: 0 }, { opacity: 1, duration: 2.4, ease: "power1.out" }, 0)
          // Logo muncul pelan dari hitam. clearProps: filter dilepas setelah selesai (brightness(1) = tanpa efek),
          // jadi tidak ada layer filter tersisa di elemen yang pendarnya berdenyut.
          .fromTo(
            "[data-intro-logo-inner]",
            { opacity: 0, filter: "brightness(0)" },
            { opacity: 1, filter: "brightness(1)", duration: 1.8, ease: "power2.inOut", clearProps: "filter" },
            0.2,
          )
          .fromTo("[data-intro-word]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 1.4)
          .fromTo("[data-intro-hint]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 2.1);

        // Posisi logo navbar diukur relatif ke header (header sedang disembunyikan selama intro).
        const delta = (axis: "x" | "y") => {
          if (!logo || !navLogo) return 0;
          const a = logo.getBoundingClientRect();
          return axis === "x"
            ? navLogo.offsetLeft + navLogo.offsetWidth / 2 - (a.left + a.width / 2)
            : navLogo.offsetTop + navLogo.offsetHeight / 2 - (a.top + a.height / 2);
        };

        let navShown = false;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: `+=${pinLength}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const show = self.progress > 0.85;
              if (show !== navShown) {
                navShown = show;
                setIntroActive(!show);
              }
            },
            onLeave: (self) => {
              removedDistance.current = self.end - self.start;
              setFinished(true);
            },
          },
        });

        // Nama brand & petunjuk tetap menyala penuh (tidak meredup) selama awal scroll,
        // lalu hilang cepat tepat sebelum logo mulai meluncur (±10–15%). Cahaya hangat membesar.
        tl.fromTo(
          ["[data-intro-copy]", "[data-intro-hint-fade]"],
          { opacity: 1 },
          { opacity: 0, duration: 5, ease: "power1.in", immediateRender: false },
          10,
        )
          .to("[data-intro-glow]", { scale: 3.2, opacity: 0.9, duration: 45, ease: "power1.inOut" }, 0)
          .to("[data-intro-aurora]", { opacity: 0, scale: 1.25, duration: 55, ease: "power1.in" }, 5);

        // 15–42%: logo meluncur ke posisi logo navbar
        tl.to(
          logo ?? {},
          {
            x: () => delta("x"),
            y: () => delta("y"),
            scale: () => (logo && navLogo ? navLogo.offsetWidth / logo.offsetWidth : 0.25),
            ease: "power3.inOut",
            duration: 27,
          },
          15,
        );

        // 28–85%: Home terbuka dari tengah, riak cincin mengikuti tepi lingkaran
        tl.fromTo(
          "[data-intro-home]",
          { clipPath: `circle(0% at ${ORIGIN})` },
          {
            clipPath: `circle(150% at ${ORIGIN})`,
            duration: 57,
            ease: "power2.inOut",
          },
          28,
        )
          .fromTo(
            "[data-intro-wave]",
            { scale: 0.3, opacity: 0.8 },
            { scale: 14, opacity: 0, duration: 50, ease: "power2.in" },
            28,
          )
          .to(logo ?? {}, { opacity: 0, duration: 8 }, 86);

        return () => setIntroActive(false);
      };

      mm.add(MQ.desktop, () => build("220%"));
      mm.add(MQ.mobile, () => build("160%"));
    },
    // revertOnUpdate: saat intro selesai, pin + semua tween intro dibuang (bukan hanya saat unmount)
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  // Setelah pin dibuang, halaman memendek sebesar jarak pin: geser scroll agar tampilan tidak loncat.
  useLayoutEffect(() => {
    if (!finished) return;
    // Pastikan Home terbuka penuh (revert GSAP mengembalikan clip-path ke state awal 0%)
    const home = ref.current?.querySelector<HTMLElement>("[data-intro-home]");
    if (home) home.style.clipPath = "";
    const d = removedDistance.current;
    if (!d) return;
    removedDistance.current = 0;
    jumpScroll(lenis, Math.max(0, window.scrollY - d));
    ScrollTrigger.refresh();
  }, [finished, lenis]);

  return (
    <div ref={ref} id="intro" className="relative overflow-hidden bg-ink">
      {active && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen-s">
          {/* Aurora WebGL (React Bits "Aurora"): tirai cahaya redup — navy lembut di sisi, biru aksen di tengah */}
          <div data-intro-aurora className="absolute inset-0 overflow-hidden opacity-0">
            <Aurora
              colorStops={["#2F4F8F", "#8FB2F5", "#2F4F8F"]}
              amplitude={0.85}
              blend={0.6}
              speed={0.5}
              className="opacity-85"
            />
          </div>
          {/* Cahaya biru aksen yang sangat lembut di belakang logo */}
          <div
            data-intro-glow
            className="absolute inset-0 m-auto size-[60vmin] rounded-full bg-[radial-gradient(circle,rgb(143_178_245/0.28)_0%,rgb(19_45_99/0.55)_38%,transparent_70%)] opacity-60"
          />
        </div>
      )}

      {/* Selama intro aktif, Home tertutup (lingkaran 0%) sejak render pertama agar tidak berkedip */}
      <div data-intro-home className={`relative z-10 ${active ? "[clip-path:circle(0%_at_50%_50vh)]" : ""}`}>
        {children}
      </div>

      {active && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-screen-s flex-col items-center justify-center">
          {/* Riak cincin di tepi lingkaran yang membuka Home */}
          <div
            data-intro-wave
            aria-hidden
            className="absolute inset-0 m-auto size-[30vmin] rounded-full border border-accent/45 opacity-0"
          />

          <div className="relative flex items-center justify-center">
            <div data-intro-logo>
              {/* Pendar berdenyut di sekeliling lingkaran (.logo-glow); kilau hanya di huruf j & b (BrandLogo shine) */}
              <div
                data-intro-logo-inner
                className="logo-glow rounded-full opacity-0 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6),0_0_70px_rgb(143_178_245/0.14)]"
              >
                <BrandLogo size="lg" shine />
              </div>
            </div>
            {/* Nama brand di bawah logo; dipudarkan sebagai satu kesatuan saat scroll ([data-intro-copy]) */}
            <div className="absolute top-full left-1/2 mt-10 -translate-x-1/2 whitespace-nowrap">
              <div data-intro-copy className="flex flex-col items-center gap-3">
                {/* Font brand (Unbounded Bold), sama dengan tulisan "BREWi JAYA" di Home & footer */}
                <p className="flex gap-[0.35em] font-brand text-[28px] font-bold tracking-[0.08em] text-white [text-shadow:0_0_24px_rgb(255_236_200/0.45),0_2px_16px_rgb(0_0_0/0.55)] sm:text-[42px]">
                  {uiText.brandWordmark.split(" ").map((w) => (
                    <span key={w} data-intro-word className="opacity-0">
                      {w}
                    </span>
                  ))}
                </p>
                <p data-intro-word className="flex items-center gap-3 opacity-0">
                  <span className="pl-[0.3em] font-sans text-small font-semibold tracking-[0.3em] text-accent uppercase [text-shadow:0_0_18px_rgb(143_178_245/0.55)] sm:text-body">
                    {uiText.brandSubline}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div data-intro-hint-fade>
              <p
                data-intro-hint
                className="flex flex-col items-center gap-1 text-small tracking-[0.18em] text-cream uppercase opacity-0"
              >
                {uiText.introHint}
                <span className="animate-bob" aria-hidden>
                  ↓
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
