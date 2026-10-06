"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { getPageSection, heroBackdrop } from "@/data/site";
import { useScrollTo } from "@/components/motion/SmoothScrollProvider";
import { Button } from "@/components/ui/Button";
import { Magnet } from "@/components/ui/Magnet";
import { ManagedBy } from "@/components/ui/ManagedBy";

/**
 * Home (design.md 5): nama brand + deskripsi di tengah layar, di atas foto latar.
 * Latar: tiga foto yang dibaurkan (heroBackdrop di src/data/site.ts), diredam dengan gradasi navy.
 */
export function Home() {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const hero = getPageSection("home", "hero");

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        gsap.from("[data-home-line]", { yPercent: 110, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out" });

        // Parallax saat section Tentang naik menimpa Home.
        // refreshPriority -1: dihitung setelah pin Intro supaya posisinya benar.
        const st = {
          trigger: document.getElementById("tentang"),
          start: "top bottom",
          end: "top top",
          scrub: 1,
          refreshPriority: -1,
        };
        gsap.to('[data-home-blob="right"]', { x: 40, ease: "none", scrollTrigger: st });
        gsap.to('[data-home-blob="left"]', { x: -40, ease: "none", scrollTrigger: st });
        gsap.to("[data-home-bg]", { yPercent: 10, ease: "none", scrollTrigger: st });
        gsap.to("[data-home-text]", { yPercent: -25, ease: "none", scrollTrigger: st });
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="home"
      data-nav="home"
      data-nav-theme="dark"
      className="relative overflow-hidden bg-deep text-warm"
    >
      {/* +radius-section +4rem: panel berikutnya (naik -radius-section) beserta bayangan ke atasnya
          (shadow-lift) mulai di luar layar, jadi tidak ada yang terlihat lalu terdorong saat pin intro
          dipasang (CLS). Isi Home tetap di tengah 1 layar pertama. */}
      <div data-stack-content className="relative min-h-[calc(max(100vh,100svh)+var(--radius-section)+4rem)]">
        {/* Tiga foto latar yang dibaurkan: foto tim di tengah, espresso di kiri, barista di kanan.
            Tepi tiap foto dipudarkan (mask) supaya saling menyatu; warnanya diseragamkan (redup, bernada biru tipis).
            unoptimized: file sudah WebP ringan; pengoptimal AVIF Next bisa macet pada foto besar ini. */}
        <div
          data-home-bg
          aria-hidden
          className="absolute inset-0 bg-ink filter-[saturate(0.72)_brightness(0.82)_contrast(1.06)]"
        >
          <div className="absolute inset-y-0 left-0 hidden w-[38%] mask-[linear-gradient(90deg,#000_50%,transparent)] lg:block">
            <Image
              src={heroBackdrop.left}
              alt=""
              fill
              priority
              unoptimized
              sizes="38vw"
              className="object-cover object-[40%_50%]"
            />
          </div>
          <div className="absolute inset-y-0 right-0 hidden w-[38%] mask-[linear-gradient(270deg,#000_50%,transparent)] lg:block">
            <Image
              src={heroBackdrop.right}
              alt=""
              fill
              priority
              unoptimized
              sizes="38vw"
              className="object-cover object-[45%_40%]"
            />
          </div>
          <div className="absolute inset-0 lg:inset-x-[20%] lg:mask-[linear-gradient(90deg,transparent,#000_24%,#000_76%,transparent)]">
            <Image
              src={heroBackdrop.center}
              alt=""
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover object-[50%_62%]"
            />
          </div>
          {/* Sentuhan biru tipis agar ketiga foto senada dengan navy brand */}
          <div className="absolute inset-0 bg-navy-soft/45 mix-blend-color" />
        </div>
        {/* Lapisan navy: paling gelap di tengah (teks), tetap memperlihatkan foto; gelap di atas & bawah */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgb(7_19_49/0.78)_0%,rgb(7_19_49/0.55)_70%,rgb(7_19_49/0.6)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(7_19_49/0.65)_0%,rgb(7_19_49/0.8)_100%)]"
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/80 to-transparent" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-ink via-ink/50 to-transparent"
        />
        {/* Kilau biru aksen lembut di tengah */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgb(143_178_245/0.14)_0%,transparent_55%)]"
        />
        {/* Cahaya navy lembut dari kiri atas & kanan atas (simetris) agar latar tidak datar */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,var(--color-navy-soft)_0%,transparent_50%),radial-gradient(ellipse_at_85%_20%,var(--color-navy-soft)_0%,transparent_50%)] opacity-70"
        />
        {/* Bidang navy melengkung di kanan & kiri (cermin), desktop saja. Cukup pekat supaya terasa,
            tapi tetap transparan sehingga foto latar masih terlihat. */}
        {(["right", "left"] as const).map((side) => (
          <svg
            key={side}
            data-home-blob={side}
            aria-hidden
            viewBox="0 0 600 900"
            preserveAspectRatio="none"
            className={`absolute top-0 hidden h-full w-[42%] lg:block ${side === "right" ? "right-0" : "left-0 -scale-x-100"}`}
          >
            <defs>
              <linearGradient id={`home-blob-${side}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-navy-soft)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--color-navy-soft)" stopOpacity="0.78" />
              </linearGradient>
            </defs>
            <path d="M600 0H260C180 120 330 240 210 380C90 520 60 700 180 900H600Z" fill={`url(#home-blob-${side})`} />
          </svg>
        ))}
        <div
          aria-hidden
          className="absolute bottom-[-45vw] left-1/2 size-[130vw] -translate-x-1/2 rounded-full bg-linear-to-t from-navy-soft to-deep/40 lg:hidden"
        />
        <div className="container-brewi relative flex min-h-screen-s items-center justify-center pt-[calc(var(--nav-h)+1rem)] pb-12">
          {/* Nama brand + deskripsi, rata tengah */}
          <div data-home-text className="relative z-10 flex w-full flex-col items-center gap-6 text-center">
            <p className="overflow-hidden">
              {/* pl = jarak huruf di ujung teks, supaya label benar-benar di tengah */}
              <span data-home-line className="eyebrow pl-[0.2em] text-accent lg:pl-[0.28em]">
                {hero?.subtitle}
              </span>
            </p>
            {/* Font brand (Unbounded Bold), sama dengan tulisan "BREWi JAYA" di Intro & footer */}
            <h1 className="overflow-hidden pb-2">
              <span
                data-home-line
                className="block font-brand text-[clamp(30px,8vw,104px)] leading-[0.95] font-bold tracking-[0.01em] whitespace-nowrap text-warm"
              >
                {hero?.title}
              </span>
            </h1>
            <p className="overflow-hidden">
              <span
                data-home-line
                className="mx-auto block max-w-[52ch] text-[clamp(16px,1.35vw,20px)] leading-[1.75] text-cream/75"
              >
                {hero?.body}
              </span>
            </p>
            {hero?.ctaLabel && (
              <div>
                <Magnet>
                  <Button variant="outline-light" onClick={() => scrollTo(hero.ctaLink)}>
                    {hero.ctaLabel}
                  </Button>
                </Magnet>
              </div>
            )}
            {/* Tulisan "Managed by" di atas, logo UB Coffee di bawahnya */}
            <ManagedBy className="mt-4 flex-col justify-center pt-6 text-cream" />
          </div>
        </div>
      </div>
    </section>
  );
}
