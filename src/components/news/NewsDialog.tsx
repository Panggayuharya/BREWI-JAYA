"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { NewsItem } from "@/types";
import { uiText } from "@/data/site";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useScrollLock } from "@/components/motion/SmoothScrollProvider";
import { NewsImage, NewsMeta } from "@/components/news/NewsCard";

/**
 * Isi lengkap berita dalam jendela di atas halaman (pengganti halaman detail /news/[slug]).
 * Tutup: tombol ×, klik latar gelap, atau tombol Esc. Scroll halaman dikunci selama terbuka.
 */
export function NewsDialog({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  useScrollLock(item !== null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="news-dialog"
          data-lenis-prevent
          className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-dialog-title"
            className="relative my-auto w-full max-w-2xl overflow-hidden rounded-card bg-warm text-ink shadow-raised"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_SOFT }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-cream">
              <NewsImage item={item} sizes="(min-width: 768px) 672px, 100vw" />
            </div>
            <button
              type="button"
              autoFocus
              onClick={onClose}
              aria-label={uiText.newsClose}
              className="absolute top-3 right-3 grid size-10 cursor-pointer place-items-center rounded-full bg-ink/70 text-xl text-warm backdrop-blur transition-colors hover:bg-ink"
            >
              <span aria-hidden>×</span>
            </button>
            <div className="flex flex-col gap-4 px-6 pt-6 pb-8 sm:px-10 sm:pt-8 sm:pb-10">
              <NewsMeta item={item} className="text-ink" />
              <h3 id="news-dialog-title" className="font-display text-[clamp(26px,3vw,36px)] leading-[1.12] font-semibold tracking-[-0.01em]">
                {item.title}
              </h3>
              <div className="flex flex-col gap-4 pt-2 text-[16px] leading-[1.8] text-ink/80">
                {item.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
