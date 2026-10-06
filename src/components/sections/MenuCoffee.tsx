"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import type { MenuItem } from "@/types";
import { getCategoryById, getMenuByType, getMenuCategories } from "@/data/menu";
import { uiText } from "@/data/site";
import { EASE_OUT_SOFT } from "@/lib/easing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { circularOffset, MenuCapsule } from "./menu-coffee/MenuCapsule";
import { MenuDetails } from "./menu-coffee/MenuDetails";
import { JellyTabs } from "@/components/ui/JellyTabs";

/** Dua set menu yang bergantian di lingkaran yang sama: minuman (kopi + non-kopi) dan makanan. */
type MenuSet = "drinks" | "food";
const menuSets: Record<MenuSet, MenuItem[]> = {
  drinks: [...getMenuByType("kopi"), ...getMenuByType("non_kopi")],
  food: getMenuByType("makanan"),
};
// Untuk mengukur tinggi teks terpanjang di MenuDetails (kolom teks tidak melompat, juga saat ganti set)
const allItems = [...menuSets.drinks, ...menuSets.food];

/** Jeda putaran otomatis (ms) */
const AUTOPLAY_MS = 2500;

/**
 * Menu (design.md 7, referensi 2): teks menu di kiri, foto kapsul di kanan di atas lingkaran navy
 * dengan cahaya biru aksen, thumbnail di busur sekitar kapsul.
 * - Kopi, Non-Kopi, dan Makanan ada di satu section. Tab Makanan menukar set menu: cup minuman
 *   keluar pelan (pudar + turun + blur), lalu menu makanan masuk dengan cara yang sama; begitu pula sebaliknya.
 * - Berputar otomatis tiap 2,5 detik tanpa perlu diklik; berhenti hanya saat section tidak terlihat dan
 *   bagi pengguna reduced motion. Setelah diklik, hitungan waktu diulang dari awal.
 * - Tetap bisa diganti manual: klik thumbnail/kapsul/tab, atau swipe di HP. Carousel melingkar tanpa mundur ke awal.
 */
export function MenuCoffee() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.4 });
  const [set, setSet] = useState<MenuSet>("drinks");
  // step bertambah/berkurang tanpa batas; item aktif = step mod n (carousel melingkar)
  const [step, setStep] = useState(0);
  const items = menuSets[set];
  const n = items.length;
  const active = ((step % n) + n) % n;
  const select = (index: number) => setStep((s) => s + circularOffset(index, ((s % n) + n) % n, n));

  // Pindah set (minuman ↔ makanan) lalu langsung ke item pertama kategori yang dipilih
  const openCategory = (categoryId: number) => {
    const target: MenuSet = menuSets.food.some((f) => f.categoryId === categoryId) ? "food" : "drinks";
    const index = Math.max(0, menuSets[target].findIndex((d) => d.categoryId === categoryId));
    if (target !== set) {
      setSet(target);
      setStep(index);
    } else select(index);
  };

  // Putaran otomatis. `step` & `set` di dependensi → timer diulang setiap kali menu berganti (termasuk klik).
  useEffect(() => {
    if (reduced || !inView || n < 2) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [reduced, inView, n, step, set]);

  const current = items[active];
  const currentCategory = getCategoryById(current.categoryId);
  const sameCategory = items.filter((d) => d.categoryId === current.categoryId);

  return (
    <section
      ref={ref}
      id="menu"
      data-nav="menu"
      data-nav-theme="light"
      className="relative min-h-screen-s overflow-hidden bg-ink text-warm lg:h-screen-s"
    >
      {/* .menu-stage = satu sumber ukuran lingkaran, cup utama & thumbnail (lihat globals.css).
          Semua ukuran layar setinggi satu layar penuh; di HP sisa tinggi dibagi ke jarak antar blok (--free). */}
      <div data-stack-content className="menu-stage relative min-h-screen-s bg-ink lg:h-full">
        {/* Lingkaran putih: terang di sisi cup, sedikit kebiruan di tepi supaya serasi dengan navy */}
        <div
          data-menu-blob
          aria-hidden
          className="absolute rounded-full bg-[radial-gradient(circle_at_30%_45%,var(--color-warm)_0%,var(--color-cream)_48%,#dfe5ef_100%)] shadow-[0_0_120px_-30px_rgb(143_178_245/0.35)]"
          style={{
            left: "calc(var(--bx) - var(--br))",
            top: "calc(var(--by) - var(--br))",
            width: "calc(var(--br) * 2)",
            height: "calc(var(--br) * 2)",
            // HP: bagian bawah lingkaran dipudarkan di batas panggung (lihat .menu-stage)
            maskImage: "var(--blob-mask)",
            WebkitMaskImage: "var(--blob-mask)",
          }}
        />

        {/* Cup utama + thumbnail di tepi lingkaran. Ganti set = seluruh panggung keluar lalu set baru masuk. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={set}
            className="absolute inset-0 z-10"
            initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE_OUT_SOFT } }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)", transition: { duration: 0.4, ease: "easeIn" } }}
          >
            <MenuCapsule items={items} step={step} onSelect={select} />
          </motion.div>
        </AnimatePresence>

        {/* Teks menu di kiri. Desktop: titik tengah blok teks disejajarkan dengan titik tengah cup utama
            (--cap-y + --cap-h/2 = 44svh + 4% cap-h), bukan tengah layar, jadi atas & bawah teks seimbang dengan cup.
            Caranya: pb = nav-h + 12svh - 8% cap-h (pt tetap nav-h, jadi teks tidak pernah masuk ke bawah navbar).
            HP: eyebrow + tab di atas (tinggi tetap --head-h), lalu teks di kiri sejajar dengan cup di kanan. */}
        <div className="container-brewi pointer-events-none relative z-20 flex flex-col justify-start gap-3 min-h-screen-s pt-(--text-top) pb-10 *:pointer-events-auto tab-land:justify-center tab-land:gap-5 tab-land:pt-(--nav-h) tab-land:pb-6 lg:h-full lg:justify-center lg:gap-7 lg:pt-(--nav-h) lg:pb-[calc(var(--nav-h)+12svh-var(--cap-h)*0.08)]">
          {/* HP: blok setinggi --head-h supaya awal kolom teks (--row-top) pasti sejajar dengan panggung cup.
              Tablet landscape & desktop: `contents` → eyebrow & tab tetap anak langsung flex di atas (tata letak lama). */}
          <div className="mb-(--row-gap) flex h-(--head-h) flex-col gap-3 *:pointer-events-auto tab-land:contents lg:contents">
            <h2 className="eyebrow w-fit text-accent">{uiText.menuEyebrow}</h2>

            {/* Efek jelly saat diklik (juga saat berganti otomatis). HP: 3 tab dibagi rata selebar layar */}
            <JellyTabs
              ariaLabel="Kategori menu"
              surface="dark"
              variant="caps"
              fill
              className="self-start max-sm:self-stretch"
              items={getMenuCategories().map((cat) => ({ value: String(cat.id), label: cat.name }))}
              value={String(currentCategory?.id ?? "")}
              onChange={(v) => openCategory(Number(v))}
            />
          </div>

          {/* Pembungkus tidak menangkap klik (HP: ia membentang di atas cup); hanya teks & tombol di dalamnya yang aktif */}
          <div className="pointer-events-none! tab-land:max-w-[46%] lg:max-w-[46%]">
            <MenuDetails
              item={current}
              sizerItems={allItems}
              index={sameCategory.findIndex((d) => d.id === current.id)}
              total={sameCategory.length}
              categoryName={currentCategory?.name ?? ""}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
