"use client";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { aboutContent, getPageSection } from "@/data/site";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollTo } from "@/components/motion/SmoothScrollProvider";
import { Button } from "@/components/ui/Button";
import { Magnet } from "@/components/ui/Magnet";
import { Reveal } from "@/components/motion/Reveal";

type PhotoData = { title: string; imageUrl: string };
type FeatureIcon = (typeof aboutContent.why.features)[number]["icon"];

/** Foto berbingkai bulat; parent menentukan ukuran (aspect/height). */
function Photo({ photo, sizes, className = "" }: { photo: PhotoData; sizes: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-photo bg-cream shadow-soft ${className}`}>
      <Image src={photo.imageUrl} alt={photo.title} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

/** Jeda antar pergantian foto kolase (ms); slot atas → tengah → bawah berganti bergiliran. */
const COLLAGE_STEP_MS = 2600;

/**
 * Posisi tiap slot kolase (persen dari kotak kolase), mengikuti referensi:
 * foto tengah tegak di belakang, foto atas & bawah mendatar di kiri menumpuk di depannya,
 * kartu biru di ruang kosong kanan bawah. `from` = arah masuk saat section terlihat.
 */
const SLOTS = {
  top: { box: "left-0 top-0 z-20 h-[27%] w-[52%]", from: { x: -40, y: -20 } },
  middle: { box: "left-[15%] top-[15%] z-10 h-[63%] w-[68%]", from: { x: 0, y: 40 } },
  bottom: { box: "left-0 top-[67%] z-20 h-[33%] w-[52%]", from: { x: -40, y: 30 } },
} as const;
type SlotName = keyof typeof SLOTS;
const SLOT_ORDER: SlotName[] = ["top", "middle", "bottom"];

/** Satu slot kolase: foto berganti dengan crossfade + zoom pelan, berbingkai putih. */
function CollageSlot({
  name,
  photos,
  index,
  reduced,
  delay,
}: {
  name: SlotName;
  photos: readonly PhotoData[];
  index: number;
  reduced: boolean;
  delay: number;
}) {
  const { box, from } = SLOTS[name];
  const photo = photos[index % photos.length];
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_SOFT }}
      className={`absolute ${box} overflow-hidden rounded-photo bg-cream shadow-raised ring-4 ring-warm`}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={photo.imageUrl}
          className="absolute inset-0"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9, ease: EASE_OUT_SOFT }, scale: { duration: 2.4, ease: EASE_OUT_SOFT } }}
        >
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            sizes={name === "middle" ? "(min-width: 1024px) 22vw, 65vw" : "(min-width: 1024px) 17vw, 50vw"}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Kolase foto Tentang. Foto tiap slot berganti bergiliran (atas → tengah → bawah),
 * jeda saat kursor di atas kolase atau saat kolase di luar layar.
 */
function AboutCollage({ reduced }: { reduced: boolean }) {
  const { collage } = aboutContent;
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = hovered || !visible;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setStep((s) => s + 1), COLLAGE_STEP_MS);
    return () => clearTimeout(t);
  }, [step, paused]);

  // Slot ke-i sudah berganti sebanyak berapa kali setelah `step` langkah (bergiliran tiap 3 langkah)
  const indexOf = (i: number) => Math.floor((step + SLOT_ORDER.length - 1 - i) / SLOT_ORDER.length);

  return (
    <div
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // Desktop: lebar dibatasi (--collage-max) supaya tinggi kolase (aspect 0.93) muat dalam satu layar
      style={{ ["--collage-max" as string]: "min(100%, calc((100svh - var(--nav-h) - 6rem) * 0.93), 595px)" }}
      className="relative mx-auto aspect-[0.93] w-full max-w-136 lg:max-w-(--collage-max)"
    >
      {SLOT_ORDER.map((name, i) => (
        <CollageSlot
          key={name}
          name={name}
          photos={collage[name]}
          index={indexOf(i)}
          reduced={reduced}
          delay={0.1 + i * 0.12}
        />
      ))}
      {/* Kartu biru di ruang kosong kanan bawah (di bawah foto tengah, di kanan foto bawah): tidak menutupi foto */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: 30, y: 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE_OUT_SOFT }}
        className="absolute top-[82%] right-0 z-30 h-[18%] w-[44%]"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-full items-center gap-[0.7em] rounded-card bg-[linear-gradient(160deg,var(--color-accent-deep)_0%,var(--color-navy-soft)_100%)] px-[7%] text-[clamp(13px,1vw,16px)] text-warm shadow-raised"
        >
          <span className="flex size-[2.2em] shrink-0 items-center justify-center rounded-full bg-warm/15">
            <Icon name="leaf" className="size-[1.2em]" />
          </span>
          <p className="font-display leading-snug font-semibold">{collage.badge}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Ikon garis sederhana untuk daftar keunggulan & kartu biru. */
function Icon({ name, className = "size-6" }: { name: FeatureIcon | "check" | "leaf"; className?: string }) {
  const paths: Record<typeof name, React.ReactNode> = {
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    leaf: (
      <>
        <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
        <path d="M5 19 13 11" />
      </>
    ),
    coffee: (
      <>
        <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
        <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
      </>
    ),
    space: (
      <>
        <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
        <path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4H3v-4Z" />
        <path d="M6 17v2M18 17v2" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.5a3 3 0 0 1 0 5.5M17.5 14a5.5 5.5 0 0 1 3 5" />
      </>
    ),
  };
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

/**
 * Tentang (mengikuti referensi halaman "About"), tiga bagian:
 * 1. Latar putih, tiga kolom: judul + deskripsi + angka + tombol | kolase foto berganti + kartu biru | poin keunggulan.
 * 2. Banner foto selebar layar (lapisan hitam tipis) dengan judul di tengah + tombol reservasi.
 * 3. Latar putih keabuan: kolase foto + kartu kecil | "Kenapa BREWi" dengan daftar ikon biru.
 * HP: semua kolom bertumpuk dari atas ke bawah.
 */
export function About() {
  const section = getPageSection("tentang", "about");
  const scrollTo = useScrollTo();
  const reduced = useReducedMotion();
  const { eyebrow, stats, side, banner, why } = aboutContent;

  return (
    <section id="tentang" data-nav="tentang" data-nav-theme="cream" className="relative bg-warm text-ink">
      <div data-stack-content>
        {/* 1. Intro tiga kolom; desktop: muat dalam satu layar (tinggi kolase dibatasi) */}
        <div className="container-brewi grid gap-12 pt-[calc(var(--nav-h)+3rem)] pb-20 lg:min-h-screen-s lg:grid-cols-[1.1fr_1.2fr_1fr] lg:items-center lg:gap-8 lg:pt-[calc(var(--nav-h)+2rem)] lg:pb-12 xl:gap-10">
          {/* Kiri: judul, deskripsi, angka, tombol */}
          <div className="flex flex-col gap-5 lg:gap-4">
            <Reveal>
              <p className="eyebrow text-accent-deep">{eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05}>
              {/* Tiap kata tidak dipotong (mis. "Lama-Lama" tidak pecah di tanda hubung) */}
              <h2 className="font-display text-section font-semibold tracking-[-0.02em] text-ink">
                {section?.title.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="whitespace-nowrap">{w}</span>
                  </Fragment>
                ))}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[15px] leading-[1.75] text-ink/70">{section?.body}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 py-2 lg:gap-y-3 lg:py-1">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <dt className="order-2 text-[13px] leading-snug text-ink/60">{s.label}</dt>
                    <dd className="order-1 font-display text-[clamp(26px,2.2vw,32px)] leading-none font-semibold text-accent-deep">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            {section?.ctaLabel && (
              <Reveal delay={0.2}>
                <Magnet>
                  <Button variant="primary" onClick={() => scrollTo(section.ctaLink)}>
                    {section.ctaLabel}
                  </Button>
                </Magnet>
              </Reveal>
            )}
          </div>

          {/* Tengah: kolase foto (berganti bergiliran) + kartu biru */}
          <AboutCollage reduced={reduced} />

          {/* Kanan: judul, deskripsi, poin keunggulan, catatan kaki */}
          <div className="flex flex-col gap-5">
            <Reveal>
              <h3 className="font-display text-[clamp(24px,2.2vw,32px)] leading-[1.15] font-semibold tracking-[-0.01em] text-ink">
                {side.title}
              </h3>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-[15px] leading-[1.75] text-ink/70">{side.body}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="flex flex-col gap-3">
                {side.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] font-semibold text-ink">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-accent">
                      <Icon name="check" className="size-3.5" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col gap-1 border-t border-ink/10 pt-4">
              {side.footnotes.map((f) => (
                <p key={f} className="text-[12.5px] text-ink/50">
                  {f}
                </p>
              ))}
            </Reveal>
          </div>
        </div>

        {/* 2. Banner foto selebar layar */}
        <div className="relative isolate overflow-hidden bg-ink text-warm">
          <Image src={banner.imageUrl} alt="" fill sizes="100vw" className="-z-10 object-cover" />
          {/* Lapisan hitam (lebih pekat di tengah) + nuansa biru tipis supaya teks terbaca */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,rgb(11_12_15/0.72)_0%,rgb(11_12_15/0.5)_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-accent-deep/15 mix-blend-color" />
          <div className="container-brewi flex flex-col items-center gap-5 py-24 text-center sm:py-32">
            <Reveal>
              <p className="eyebrow text-accent">{banner.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h3 className="font-display text-section font-semibold tracking-[-0.02em] text-warm">{banner.title}</h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto max-w-[56ch] text-[clamp(15px,1.2vw,17px)] leading-[1.75] text-cream/80">{banner.body}</p>
            </Reveal>
            <Reveal delay={0.15} className="pt-2">
              <Button variant="outline-light" onClick={() => scrollTo(banner.ctaLink)}>
                {banner.ctaLabel}
              </Button>
            </Reveal>
          </div>
        </div>

        {/* 3. Kenapa BREWi */}
        <div className="bg-cream">
          <div className="container-brewi grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
            {/* Kiri: dua foto bertumpuk + kartu putih kecil */}
            <Reveal className="relative pb-24 sm:pb-20">
              <div className="grid grid-cols-[1fr_1.3fr] items-start gap-4">
                <Photo photo={why.photos[0]} sizes="(min-width: 1024px) 20vw, 40vw" className="mt-0 aspect-4/3" />
                <Photo photo={why.photos[1]} sizes="(min-width: 1024px) 26vw, 55vw" className="mt-14 aspect-4/5" />
              </div>
              <div className="absolute bottom-0 left-0 grid w-[min(100%,26rem)] grid-cols-2 gap-5 rounded-card bg-warm p-5 shadow-raised">
                {why.cardItems.map((c) => (
                  <div key={c.title} className="flex flex-col gap-1">
                    <p className="text-[14px] font-bold text-ink">{c.title}</p>
                    <p className="text-[13px] leading-snug text-ink/60">{c.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Kanan: judul + daftar keunggulan dengan ikon */}
            <div className="flex flex-col gap-6">
              <Reveal>
                <p className="eyebrow text-accent-deep">{why.eyebrow}</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h3 className="font-display text-section font-semibold tracking-[-0.02em] text-ink">{why.title}</h3>
              </Reveal>
              <ul className="flex flex-col gap-5 pt-2">
                {why.features.map((f, i) => (
                  <li key={f.title}>
                    <Reveal delay={0.1 + i * 0.08} className="flex items-start gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-inner bg-ink text-accent">
                        <Icon name={f.icon} className="size-7" />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-[16px] font-bold text-ink">{f.title}</span>
                        <span className="text-[14px] leading-[1.7] text-ink/65">{f.text}</span>
                      </span>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
