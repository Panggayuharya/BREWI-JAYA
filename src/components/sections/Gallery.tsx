"use client";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
} from "motion/react";
import type { GalleryItem } from "@/types";
import { getGalleryItems, getGalleryRows } from "@/data/gallery";
import { uiText } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/motion/Reveal";

const BASE_SPEED = 40; // px per detik

/**
 * Gallery (design.md 9): dua baris marquee berlawanan arah, bisa di-drag/swipe,
 * kecepatan & arah dipengaruhi scroll, klik foto membuka lightbox.
 */
export function Gallery() {
  const [top, bottom] = getGalleryRows();
  const all = getGalleryItems();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const open = (item: GalleryItem) => setLightbox(all.findIndex((g) => g.id === item.id));

  return (
    // Dibungkus StackPanel di page.tsx: naik menimpa Menu Makanan dengan sudut atas membulat
    <section id="gallery" data-nav="gallery" data-nav-theme="light" className="relative bg-navy-soft text-warm">
      <div data-stack-content className="flex flex-col gap-4 bg-navy-soft pt-[calc(var(--nav-h)+1.5rem)] pb-20 sm:gap-6 sm:pt-[calc(var(--nav-h)+2.5rem)] sm:pb-28 lg:gap-8">
        <Reveal className="container-brewi">
          <h2 className="font-display text-section font-semibold tracking-[-0.02em] text-warm">{uiText.galleryTitle}</h2>
        </Reveal>
        {/* HP: kartu diperkecil (atas 144×180, bawah 200×160) supaya dua baris muat tanpa memenuhi layar */}
        <MarqueeRow items={top} direction={-1} size="aspect-4/5 w-36 sm:w-72" onOpen={open} />
        <MarqueeRow items={bottom} direction={1} size="aspect-5/4 w-50 sm:w-72" onOpen={open} />
      </div>
      <Lightbox items={all} index={lightbox} onChange={setLightbox} />
    </section>
  );
}

interface MarqueeRowProps {
  items: GalleryItem[];
  direction: 1 | -1;
  /** Rasio + lebar kartu per breakpoint (kelas Tailwind) */
  size: string;
  onOpen: (item: GalleryItem) => void;
}

function MarqueeRow({ items, direction, size, onOpen }: MarqueeRowProps) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const dragging = useRef(false);
  const hover = useRef(false);
  const scrollDir = useRef(1);

  const { scrollY } = useScroll();
  const scrollVelocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });

  useAnimationFrame((_, delta) => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2; // lebar satu salinan
    if (!half) return;

    if (!dragging.current && !reduced) {
      const v = scrollVelocity.get();
      if (v > 5) scrollDir.current = 1;
      else if (v < -5) scrollDir.current = -1;
      const boost = 1 + Math.min(Math.abs(v) / 400, 5);
      const speed = BASE_SPEED * (hover.current ? 0.3 : 1) * boost;
      x.set(x.get() + direction * scrollDir.current * speed * (delta / 1000));
    }
    // wrap agar loop tidak terputus
    const cur = x.get();
    if (cur <= -half) x.set(cur + half);
    else if (cur > 0) x.set(cur - half);
  });

  return (
    <div
      className="overflow-hidden"
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
    >
      <motion.div
        ref={trackRef}
        style={{ x }}
        drag="x"
        dragMomentum
        onDragStart={() => (dragging.current = true)}
        onDragTransitionEnd={() => (dragging.current = false)}
        className="flex w-max cursor-grab touch-pan-y gap-3 active:cursor-grabbing sm:gap-4 lg:gap-5"
      >
        {[...items, ...items].map((item, i) => (
          <button
            key={`${item.id}-${i}`}
            type="button"
            aria-hidden={i >= items.length}
            tabIndex={i >= items.length ? -1 : 0}
            onClick={() => onOpen(item)}
            data-tint="dim"
            className={`group relative shrink-0 overflow-hidden rounded-inner bg-deep sm:rounded-photo ${size}`}
          >
            <MediaImage
              src={item.mediaUrl}
              alt={item.caption}
              sizes="(min-width: 640px) 288px, 200px"
              className="pointer-events-none photo-warm transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
            />
            {/* Overlay gelap transparan saat hover */}
            <span
              aria-hidden
              className="absolute inset-0 bg-ink/0 transition-colors duration-500 ease-out-soft group-hover:bg-ink/25"
            />
            <span
              aria-hidden
              className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-pill bg-warm/90 text-ink opacity-0 transition-opacity duration-500 ease-out-soft group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-3 text-left text-[11px] leading-snug tracking-[0.04em] text-cream sm:p-4 sm:text-small transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">
              {item.caption}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function Lightbox({
  items,
  index,
  onChange,
}: {
  items: GalleryItem[];
  index: number | null;
  onChange: (i: number | null) => void;
}) {
  const item = index !== null ? items[index] : null;
  const step = (d: number) => index !== null && onChange((index + d + items.length) % items.length);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label={item.caption}
          data-lenis-prevent
          className="fixed inset-0 z-60 flex items-center justify-center bg-ink/92 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onChange(null);
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          <div className="relative aspect-4/5 h-[80svh] max-w-full overflow-hidden rounded-photo" onClick={(e) => e.stopPropagation()}>
            <MediaImage src={item.mediaUrl} alt={item.caption} sizes="80vw" />
          </div>
          <button
            type="button"
            autoFocus
            aria-label="Tutup"
            onClick={() => onChange(null)}
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-pill bg-warm text-ink transition-colors duration-300 hover:bg-accent"
          >
            ✕
          </button>
          <button
            type="button"
            aria-label="Foto sebelumnya"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-4 flex size-11 items-center justify-center rounded-pill bg-warm text-ink transition-colors duration-300 hover:bg-accent"
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Foto berikutnya"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-4 flex size-11 items-center justify-center rounded-pill bg-warm text-ink transition-colors duration-300 hover:bg-accent"
          >
            ▶
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
