import { getLatestNews } from "@/data/news";
import { uiText } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { NewsCard } from "@/components/sections/NewsCard";

/**
 * News di landing page: 3 pengumuman terbaru (1 besar + 2 kecil). Kartu diklik → halaman
 * detail berita (/news/[slug]).
 * Dibungkus StackPanel (pinPrevious) di page.tsx: Galeri ditahan, News naik menimpanya.
 */
export function News() {
  const [featured, ...rest] = getLatestNews(3);
  if (!featured) return null;

  return (
    <section id="news" data-nav="news" data-nav-theme="cream" className="relative bg-warm text-ink">
      <div data-stack-content className="relative bg-warm">
        {/* Peralihan halus dari section biru (Galeri) di atasnya */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-navy-soft/8 to-transparent" />
        <div className="container-brewi flex flex-col gap-8 pt-[calc(var(--nav-h)+1.5rem)] pb-20 sm:gap-10 sm:pt-[calc(var(--nav-h)+2.5rem)] sm:pb-28 lg:gap-14">
          <Reveal className="flex flex-col gap-3 sm:gap-4">
            <p className="eyebrow text-coffee">{uiText.newsEyebrow}</p>
            <h2 className="font-display text-section font-semibold tracking-[-0.02em]">{uiText.newsTitle}</h2>
          </Reveal>

          {/* HP: 1 kartu utama + 2 baris ringkas (foto kecil di kiri) supaya bagian ini tidak terlalu panjang */}
          <ul className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 md:gap-y-12 lg:grid-cols-12 lg:gap-x-8">
            <li className="mb-3 md:col-span-2 md:mb-0 lg:col-span-6">
              <NewsCard item={featured} featured sizes="(min-width: 1024px) 600px, 100vw" />
            </li>
            {rest.map((item) => (
              <li key={item.id} className="lg:col-span-3">
                <NewsCard item={item} compact sizes="(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
