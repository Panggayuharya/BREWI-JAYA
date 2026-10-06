"use client";
import { useState } from "react";
import { motion } from "motion/react";
import type { NewsCategory, NewsItem } from "@/types";
import { newsCategoryLabels } from "@/data/news";
import { uiText } from "@/data/site";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { JellyTabs } from "@/components/ui/JellyTabs";
import { NEWS_GRID, NEWS_GRID_SIZES, NewsCard } from "./NewsCard";

type Filter = NewsCategory | "all";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: uiText.newsFilterAll },
  ...(Object.entries(newsCategoryLabels) as [NewsCategory, string][]).map(([value, label]) => ({ value, label })),
];

/** Daftar semua berita dengan filter kategori (Semua / Promo / Event / Menu Baru). */
export function NewsList({ items }: { items: NewsItem[] }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? items : items.filter((n) => n.category === filter);

  return (
    <div className="flex flex-col gap-10">
      <div className="no-scrollbar -mx-(--container-pad) overflow-x-auto px-(--container-pad)">
        <JellyTabs ariaLabel="Kategori berita" surface="light" items={filters} value={filter} onChange={setFilter} />
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-body text-ink/60">{uiText.newsEmpty}</p>
      ) : (
        <motion.ul
          key={filter}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_SOFT }}
          className={NEWS_GRID}
        >
          {shown.map((item, i) => (
            <li key={item.id}>
              {/* Kartu pertama terlihat tanpa scroll = gambar LCP, jadi dimuat lebih dulu */}
              <NewsCard item={item} priority={i === 0} sizes={NEWS_GRID_SIZES} />
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
