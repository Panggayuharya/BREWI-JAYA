"use client";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getAboutPhotos, getPageSection, uiText } from "@/data/site";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollTo } from "@/components/motion/SmoothScrollProvider";
import { Button } from "@/components/ui/Button";
import { Magnet } from "@/components/ui/Magnet";
import { Reveal } from "@/components/motion/Reveal";

/** Lama tiap foto tampil (ms). */
const SLIDE_MS = 5500;

/*
 * Tepi foto dipudarkan ke warna latar (mask): kiri & bawah lebar, atas & kanan tipis.
 * Dua gradien digabung (intersect) supaya keempat sisi memudar sekaligus.
 */
const photoMask = {
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 38%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 14%, #000 70%, transparent 100%)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 38%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 14%, #000 70%, transparent 100%)",
  WebkitMaskComposite: "source-in",
} as const;

/**
 * Tentang: deskripsi di kiri, foto suasana di kanan yang berganti otomatis (crossfade + zoom pelan).
 * Foto dibaurkan ke latar navy (mask di tepi, warna diredam, pendar biru di belakangnya),
 * jadi terasa menyatu dengan section, bukan foto berbingkai.
 * Jeda otomatis saat kursor di area foto atau saat section di luar layar.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);
  const section = getPageSection("tentang", "about");
  const photos = getAboutPhotos();
  const scrollTo = useScrollTo();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = hovered || !visible;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % photos.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, paused, photos.length]);

  const photo = photos[index];

  return (
    <section
      ref={ref}
      id="tentang"
      data-nav="tentang"
      data-nav-theme="dark"
      className="relative overflow-hidden bg-ink text-warm"
    >
      <div data-stack-content className="relative flex min-h-screen-s flex-col lg:block">
        {/* Pendar biru di belakang foto: membuat foto seolah "menyala" dari latar */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[8%] right-[-10%] size-[70vw] rounded-full bg-accent-deep/25 blur-[120px] lg:top-[10%] lg:right-[2%] lg:size-[46vw]"
        />

        {/* Foto: di HP di atas teks, di desktop mengisi sisi kanan sampai tepi layar */}
        <div
          className="relative h-[52svh] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <div className="absolute inset-0" style={photoMask}>
            <AnimatePresence initial={false}>
              <motion.div
                key={photo.imageUrl}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: reduce ? 1 : 1.1 }}
                animate={{ opacity: 1, scale: reduce ? 1 : 1.02 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.4, ease: EASE_OUT_SOFT },
                  scale: { duration: SLIDE_MS / 1000 + 1.4, ease: "linear" },
                }}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover filter-[saturate(0.95)_brightness(1.05)_contrast(1.03)]"
                />
              </motion.div>
            </AnimatePresence>
            {/* Nuansa biru tipis: menyeragamkan warna semua foto dengan latar tanpa membuatnya gelap */}
            <div aria-hidden className="absolute inset-0 bg-accent-deep/8 mix-blend-color" />
          </div>
        </div>

        <div className="container-brewi relative z-10 -mt-[14svh] flex flex-1 flex-col justify-center pb-16 lg:mt-0 lg:min-h-screen-s lg:pt-(--nav-h) lg:pb-24">
          <div className="flex max-w-[34rem] flex-col gap-6 xl:pl-8">
            <Reveal>
              {/* Tiap kata tidak dipotong (mis. "Lama-Lama" tidak pecah di tanda hubung) */}
              <h2 className="font-display text-section font-semibold tracking-[-0.02em] text-warm">
                {section?.title.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="whitespace-nowrap">{w}</span>
                  </Fragment>
                ))}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[clamp(16px,1.25vw,18px)] leading-[1.8] text-cream/75">{section?.body}</p>
            </Reveal>
            {section?.ctaLabel && (
              <Reveal delay={0.2} className="flex flex-wrap gap-3 pt-2">
                <Magnet>
                  <Button variant="primary" onClick={() => scrollTo(section.ctaLink)}>
                    {section.ctaLabel}
                  </Button>
                </Magnet>
                <Button variant="outline-light" onClick={() => scrollTo("#reservasi")}>
                  {uiText.aboutSecondaryCta}
                </Button>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
