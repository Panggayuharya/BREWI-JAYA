"use client";

// Diadaptasi dari komponen "works-wheel" (crafterui) untuk Brewi Jaya.
//
// Saat diam, foto tersusun melingkar mengelilingi judul, tiap kartu menyinggung lingkaran.
// Scroll pertama membuka lingkaran menjadi drum vertikal: kartu di depan tampil datar dan penuh,
// kartu di atas/bawahnya berputar menjauh dalam perspektif. Scroll lagi = drum memutar foto berikutnya.
//
// Perbedaan dari versi asli:
// - Diputar oleh SCROLL HALAMAN (section di-pin dengan GSAP ScrollTrigger), bukan dengan
//   menangkap roda mouse / drag vertikal. Versi asli memakai `touch-pan-x` yang mengunci geser
//   vertikal di HP sehingga pengunjung bisa terjebak; di sini halaman tetap bisa di-scroll normal
//   dan tetap sinkron dengan Lenis.
// - Warna memakai token tema Brewi (ink/deep/mist/white), foto memakai MediaImage (next/image +
//   placeholder "Foto menyusul" selama foto belum ada).
// - Latar opsional (diadaptasi dari "scroll-locked-video-hero"): foto/video di belakang roda yang
//   membesar pelan mengikuti scroll, video maju-mundur mengikuti scroll, plus garis progres di bawah.
//   Bagian "mengunci body" dari hero asli sengaja tidak dipakai agar halaman tidak terkunci.
//
// Semuanya dikendalikan satu angka - `turn` - yang dibaca satu loop rAF dan ditulis langsung ke DOM.
// 0 = lingkaran, 1 = drum dengan item 0 di depan, tiap bilangan bulat berikutnya = satu item lagi.
import * as React from "react";

import { cn } from "@/lib/utils";
import { gsap, MQ, useGSAP, type ScrollTrigger } from "@/lib/gsap";
import { useScrollTo } from "@/components/motion/SmoothScrollProvider";
import { MediaImage } from "@/components/ui/MediaImage";
import Image from "next/image";

export interface WorksWheelItem {
  /** Nama foto. Tampil di samping kartu depan dan di daftar. */
  title: string;
  /** Path foto. Kosong = placeholder. */
  image: string;
}

export interface WorksWheelProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> {
  items: WorksWheelItem[];
  /** Judul di tengah lingkaran. */
  label: string;
  /** Kalimat kecil di bawah judul lingkaran (opsional). */
  caption?: string;
  /** Panjang scroll per foto, dalam persen tinggi layar. @default 55 */
  scrollPerItem?: number;
  /** Latar di belakang roda. `video` diputar maju-mundur mengikuti scroll; `image` dipakai jika tanpa video. */
  background?: { image?: string; video?: string };
}

/* Geometri (sama dengan versi asli). Kartu diukur terhadap stage; sisanya terhadap kartu. */
const CARD_H = 0.38;
const CARD_MAX_W = 0.34;
/** Di layar sempit (HP) kartu boleh lebih lebar supaya foto tetap terbaca. */
const CARD_MAX_W_NARROW = 0.72;
const NARROW = 640;
const CARD_RATIO = 1.45;
const STEP = 40;
const DRUM = 2.22;
const LENS = 2.7;
const RING_R = 1.14;
const BOW = 1.82;
const TITLE = 0.124;
const INDEX = 0.04;
const CULL = 1.6;
/** Bagian jarak yang ditutup tiap frame. 1 = tanpa smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

type Stage = { w: number; h: number };

/** Seberapa jauh busur membawa kartu ke kiri saat berputar `drumDeg` dari depan. */
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)));

function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label,
  caption,
  scrollPerItem = 55,
  background,
  className,
  ...props
}: WorksWheelProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);
  const pinRef = React.useRef<ScrollTrigger | null>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const scrollTo = useScrollTo();

  // Posisi roda & tujuannya. Hanya `active` yang state; sisanya ditulis ke DOM.
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * (w < NARROW ? CARD_MAX_W_NARROW : CARD_MAX_W));
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
    };
  }, [stage, count]);

  // Scroll halaman → tujuan roda. Section di-pin selama (count + 1) langkah, dengan snap per foto.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const steps = last + 1;
        const st = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${(window.innerHeight * scrollPerItem * steps) / 100}`,
            pin: true,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / steps, duration: { min: 0.2, max: 0.6 }, delay: 0.12, ease: "power2.inOut" },
            onUpdate: (self) => {
              target.current = self.progress * steps;
            },
          },
        }).scrollTrigger;
        pinRef.current = st ?? null;
        return () => {
          pinRef.current = null;
        };
      });
      // Reduced motion: tanpa pin, langsung tampil sebagai drum (item dipilih lewat daftar)
      mm.add(MQ.reduced, () => {
        target.current = 1;
      });
    },
    { scope: sectionRef, dependencies: [last, scrollPerItem] },
  );

  // Satu pass per frame: dekati tujuan, lalu tulis semua transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { ringR, ringScale, drumR, bow } = metrics;

    // Video latar: seek maju-mundur mengikuti putaran (satu seek berjalan, sisanya diantrekan)
    const video = videoRef.current;
    let seeking = false;
    let pending: number | null = null;
    const onSeeked = () => {
      seeking = false;
      if (pending !== null && video) {
        const t = pending;
        pending = null;
        seeking = true;
        video.currentTime = t;
      }
    };
    const seekTo = (t: number) => {
      if (!video) return;
      if (seeking) {
        pending = t;
        return;
      }
      if (Math.abs(video.currentTime - t) < 0.02) return;
      seeking = true;
      video.currentTime = t;
    };
    if (video) {
      video.addEventListener("seeked", onSeeked);
      // iOS Safari tidak memuat data video sebelum diputar: putar-lalu-jeda sekali untuk memicu pemuatan
      video.play().then(() => video.pause()).catch(() => {});
    }

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m);
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      const progress = clamp(t / (last + 1), 0, 1);
      if (bgRef.current) bgRef.current.style.transform = `scale(${1.04 + progress * 0.08})`;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      if (video && video.duration) seekTo(progress * video.duration);

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      video?.removeEventListener("seeked", onSeeked);
    };
  }, [metrics, stage.h, count, last]);

  /** Lompat ke foto ke-i: gulir halaman ke posisinya (atau langsung, jika tanpa pin). */
  const goTo = (i: number) => {
    const st = pinRef.current;
    if (!st) {
      target.current = i + 1;
      return;
    }
    scrollTo(st.start + ((i + 1) / (last + 1)) * (st.end - st.start));
  };

  return (
    <section
      ref={sectionRef}
      aria-label={label}
      className={cn("relative h-screen-s w-full overflow-hidden bg-ink text-warm select-none", className)}
      {...props}
    >
      <div data-stack-content className="absolute inset-0 bg-ink">
        {/* Latar foto/video yang membesar pelan mengikuti scroll, digelapkan agar roda tetap terbaca */}
        {(background?.video || background?.image) && (
          <div ref={bgRef} aria-hidden className="absolute inset-0 origin-center will-change-transform">
            {background.video ? (
              <video
                ref={videoRef}
                src={background.video}
                poster={background.image}
                muted
                playsInline
                preload="auto"
                className="size-full object-cover"
              />
            ) : (
              background.image && (
                <Image src={background.image} alt="" fill sizes="100vw" className="object-cover" />
              )
            )}
          </div>
        )}
        {(background?.video || background?.image) && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_19_49/0.82),rgb(7_19_49/0.62)_40%,rgb(7_19_49/0.72)_70%,rgb(7_19_49/0.95))] backdrop-blur-[2px]"
          />
        )}

        {/* Cahaya biru lembut di tengah */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgb(143_178_245/0.12)_0%,transparent_60%)]"
        />

        <div
          ref={stageRef}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`works-wheel-${active}`}
          className="absolute inset-0"
          style={{ perspective: `${metrics.depth}px` }}
        >
          <div ref={wheelRef} className="absolute top-1/2 left-1/2 transform-3d">
            {items.map((item, i) => (
              <div
                key={item.title}
                id={`works-wheel-${i}`}
                role="option"
                aria-selected={i === active}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="absolute backface-hidden"
                style={{
                  width: metrics.cardW,
                  height: metrics.cardH,
                  marginLeft: -metrics.cardW / 2,
                  marginTop: -metrics.cardH / 2,
                }}
              >
                <span className="relative block size-full overflow-hidden rounded-card border border-cream/10 bg-deep shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]">
                  <MediaImage src={item.image} alt={item.title} sizes="(min-width: 1024px) 40vw, 80vw" label={item.title} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Judul lingkaran dan judul kartu depan bertukar tempat selama transisi. */}
        <div
          ref={labelRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
        >
          <h2 className="font-display font-extrabold tracking-tight" style={{ fontSize: metrics.title * 1.15 }}>
            {label}
          </h2>
          {caption && <p className="max-w-[26ch] text-small text-mist sm:text-body">{caption}</p>}
        </div>
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 bottom-[9%] text-center font-display font-bold tracking-tight opacity-0 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-[6%] sm:max-w-[22%] sm:-translate-y-1/2 sm:text-left"
          style={{ fontSize: Math.max(metrics.title * 0.8, 24) }}
        >
          {items[active]?.title}
        </div>

        {/* Garis progres tipis di bawah */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-cream/10">
          <div
            ref={progressRef}
            className="h-full origin-left scale-x-0 bg-linear-to-r from-accent/60 to-cream"
          />
        </div>

        <ol
          className="absolute top-[calc(var(--nav-h)+2%)] right-[3%] hidden text-right leading-[1.9] text-mist sm:block"
          style={{ fontSize: Math.max(metrics.index, 12) }}
        >
          {items.map((item, i) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "cursor-pointer transition-colors duration-(--dur-fast) hover:text-warm",
                  i === active && "font-semibold text-accent",
                )}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default WorksWheel;
