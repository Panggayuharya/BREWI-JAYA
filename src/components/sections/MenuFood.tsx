"use client";
import { useRef } from "react";
import Link from "next/link";
import { gsap, MQ, useGSAP, type ScrollTrigger } from "@/lib/gsap";
import { getMenuByType } from "@/data/menu";
import { uiText } from "@/data/site";
import { formatRupiah } from "@/lib/format";
import { useLenis, useScrollTo } from "@/components/motion/SmoothScrollProvider";
import { Chip } from "@/components/ui/Chip";
import { MediaImage } from "@/components/ui/MediaImage";

/**
 * Menu Makanan (design.md 8): di-pin, scroll vertikal menggeser deretan kartu ke samping.
 * Setelah kartu terakhir mentok, pin dilepas. Reduced motion: baris geser biasa.
 * Bisa juga digeser manual: drag (mouse), swipe (jari), atau tombol panah. Geseran manual
 * diterjemahkan ke posisi scroll, jadi scroll dan geser selalu sinkron.
 */
export function MenuFood() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const pinRef = useRef<ScrollTrigger | null>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const dragged = useRef(false);
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const foods = getMenuByType("makanan");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const track = trackRef.current;
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const cards = track.querySelectorAll<HTMLElement>("[data-food-card]");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Kartu sedikit miring mengikuti kecepatan scroll
              const skew = gsap.utils.clamp(-3, 3, self.getVelocity() / -400);
              gsap.to(cards, { skewX: skew, duration: 0.3, overwrite: "auto" });
            },
            onScrubComplete: () => gsap.to(cards, { skewX: 0, duration: 0.4 }),
          },
        });
        tl.to(track, { x: () => -distance() }, 0)
          .fromTo("[data-food-progress]", { scaleX: 0 }, { scaleX: 1 }, 0)
          .fromTo("[data-food-photo]", { x: -30 }, { x: 30 }, 0);
        pinRef.current = tl.scrollTrigger ?? null;
        return () => {
          pinRef.current = null;
        };
      });
    },
    { scope: ref },
  );

  const setScrollNow = (y: number) => {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };

  // Drag / swipe horizontal → geser posisi scroll di dalam rentang pin
  const onPointerDown = (e: React.PointerEvent) => {
    dragged.current = false;
    const st = pinRef.current;
    if (!st || (e.pointerType === "mouse" && e.button !== 0)) return;
    const y = window.scrollY;
    if (y < st.start - 2 || y > st.end + 2) return; // hanya saat section sedang ditahan
    drag.current = { x: e.clientX, scroll: y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const st = pinRef.current;
    if (!drag.current || !st) return;
    // Baru dianggap geser setelah 6px; capture dipasang di sini (bukan saat pointerdown)
    // supaya klik biasa tetap sampai ke link kartu.
    if (!dragged.current) {
      if (Math.abs(drag.current.x - e.clientX) < 6) return;
      dragged.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const target = gsap.utils.clamp(st.start, st.end, drag.current.scroll + (drag.current.x - e.clientX) * 1.2);
    setScrollNow(target);
  };
  const endDrag = () => {
    drag.current = null;
  };

  // Tombol panah: geser satu kartu
  const step = (dir: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.children[1] as HTMLElement | undefined;
    const size = (card?.offsetWidth ?? 320) + 20;
    const st = pinRef.current;
    if (!st) {
      track?.scrollBy({ left: dir * size, behavior: "smooth" }); // reduced motion: baris geser biasa
      return;
    }
    const base = gsap.utils.clamp(st.start, st.end, window.scrollY);
    scrollTo(gsap.utils.clamp(st.start, st.end, base + dir * size));
  };

  return (
    <section
      ref={ref}
      id="menu-makanan"
      data-nav="menu"
      data-nav-theme="cream"
      className="relative h-screen-s overflow-hidden bg-cream text-ink"
    >
      <div data-stack-content className="flex h-full flex-col justify-center gap-6 bg-cream pt-(--nav-h) pb-6">
        <div className="container-brewi flex items-center justify-end gap-3">
          <Link
            href="/menu"
            className="mr-auto text-small font-semibold tracking-[0.14em] text-coffee uppercase transition-colors duration-300 hover:text-accent-deep"
          >
            {uiText.menuSeeAll} →
          </Link>
          <div className="h-0.5 w-32 overflow-hidden rounded-pill bg-ink/10" aria-hidden>
            <div data-food-progress className="h-full origin-left rounded-pill bg-accent" />
          </div>
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => step(dir)}
              aria-label={dir === 1 ? "Makanan berikutnya" : "Makanan sebelumnya"}
              className="flex size-11 items-center justify-center rounded-pill border border-ink/20 bg-warm text-lg text-ink transition-colors duration-300 select-none hover:border-accent hover:bg-accent hover:text-ink"
            >
              {dir === 1 ? "›" : "‹"}
            </button>
          ))}
        </div>

        <ul
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(e) => e.preventDefault()}
          // Selesai menggeser → jangan ikut membuka detail menu
          onClickCapture={(e) => {
            if (!dragged.current) return;
            dragged.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex w-max cursor-grab touch-pan-y gap-5 px-(--container-pad) select-none active:cursor-grabbing motion-reduce:w-auto motion-reduce:overflow-x-auto"
        >
          {/* Kartu judul: strukturnya meniru kartu makanan (area foto + blok teks),
              jadi "Makanan" berada tepat di tengah vertikal area foto kartu di sebelahnya, di semua ukuran layar. */}
          <li data-food-title className="flex w-[56vw] shrink-0 flex-col self-stretch sm:w-80">
            <div className="m-2 mb-0 ml-0 flex flex-1 items-center">
              <h2 className="font-display text-section leading-none font-semibold tracking-[-0.02em] text-ink">{uiText.foodTitle}</h2>
            </div>
            {/* Pengganti tak terlihat setinggi blok teks kartu (nama, deskripsi, harga) */}
            <div aria-hidden className="invisible flex flex-col gap-1.5 pt-4 pb-5">
              <span className="font-display text-2xl font-semibold">.</span>
              <span className="text-[14px]">.</span>
              <span className="mt-1 text-[15px] font-semibold">.</span>
            </div>
          </li>
          {foods.map((item) => (
            <li
              key={item.id}
              data-food-card
              className="group relative flex aspect-3/4 w-[75vw] shrink-0 flex-col overflow-hidden rounded-card border border-ink/8 bg-warm shadow-soft transition-shadow duration-500 ease-out-soft hover:shadow-raised sm:w-80"
            >
              <div className="relative m-2 mb-0 flex-1 overflow-hidden rounded-inner bg-cream">
                <div data-food-photo className="absolute -inset-x-10 inset-y-0">
                  <MediaImage
                    src={item.imageUrl}
                    alt={item.name}
                    sizes="(min-width: 640px) 320px, 75vw"
                    placeholderTone="light"
                    className="photo-warm transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.isBestSeller && <Chip tone="accent">Best seller</Chip>}
                  {item.isNew && <Chip tone="light">Baru</Chip>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 px-5 pt-4 pb-5">
                <h3 className="font-display text-2xl font-semibold text-ink transition-colors duration-300 group-hover:text-accent-deep">
                  {/* Seluruh kartu bisa diklik ke buku menu (flipbook) */}
                  <Link href="/menu" draggable={false} className="after:absolute after:inset-0 after:content-['']">
                    {item.name}
                  </Link>
                </h3>
                <p className="truncate text-[14px] text-ink/60">{item.description}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-[0.02em] text-coffee">{formatRupiah(item.basePrice)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
