"use client";
import { useState } from "react";
import { motion } from "motion/react";
import type { NewsCategory, NewsItem } from "@/types";
import { newsCategoryLabels } from "@/data/news";
import { uiText } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { JellyTabs } from "@/components/ui/JellyTabs";
import { NewsCard } from "./NewsCard";

type Filter = NewsCategory | "all";

/** Daftar semua berita dengan filter kategori (Semua / Promo / Event / Menu Baru). */
export function NewsList({ items }: { items: NewsItem[] }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? items : items.filter((n) => n.category === filter);
  const filters: [Filter, string][] = [["all", uiText.newsFilterAll], ...Object.entries(newsCategoryLabels) as [Filter, string][]];

  return (
    <div className="flex flex-col gap-10">
      <div className="no-scrollbar -mx-(--container-pad) overflow-x-auto px-(--container-pad)">
        <JellyTabs
          ariaLabel="Kategori berita"
          surface="light"
          items={filters.map(([value, label]) => ({ value, label }))}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-body text-ink/60">{uiText.newsEmpty}</p>
      ) : (
        <motion.ul
          key={filter}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((item, i) => (
            <li key={item.id}>
              {/* Kartu pertama terlihat tanpa scroll = gambar LCP, jadi dimuat lebih dulu */}
              <NewsCard item={item} priority={i === 0} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" />
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
