import { getLatestNews } from "@/server/queries";
import { uiText } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { NewsFeature, NewsTile } from "@/components/sections/NewsCard";

/**
 * News di landing page: 3 pengumuman terbaru. Desktop: berita utama (kartu foto penuh bertema gelap) di kiri,
 * dua berita lain (kartu horizontal) bertumpuk di kanan. Kartu diklik → halaman detail berita (/news/[slug]).
 * Dibungkus StackPanel (pinPrevious) di page.tsx: Galeri ditahan, News naik menimpanya.
 */
export async function News() {
  const [featured, ...rest] = await getLatestNews(3);
  if (!featured) return null;

  return (
    <section id="news" data-nav="news" data-nav-theme="cream" className="relative bg-warm text-ink">
      <div data-stack-content className="relative overflow-hidden bg-warm">
        {/* Peralihan halus dari section biru (Galeri) di atasnya + cahaya biru samar di pojok kanan */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-navy-soft/8 to-transparent" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 size-130 rounded-full bg-[radial-gradient(circle,rgb(124_198_255/0.18),transparent_65%)]"
        />
        <div className="container-brewi relative flex flex-col gap-8 pt-[calc(var(--nav-h)+1.5rem)] pb-20 sm:gap-10 sm:pt-[calc(var(--nav-h)+2.5rem)] sm:pb-28 lg:gap-14">
          <Reveal className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="eyebrow text-coffee">{uiText.newsEyebrow}</p>
              <h2 className="font-display text-section font-semibold tracking-[-0.02em]">{uiText.newsTitle}</h2>
            </div>
            <p className="max-w-sm leading-relaxed text-ink/65 sm:text-body lg:pb-2 lg:text-right">{uiText.newsSubtitle}</p>
          </Reveal>

          <ul className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
            <li className="mb-2 sm:mb-3 lg:col-span-7 lg:row-span-2 lg:mb-0">
              <Reveal className="h-full">
                <NewsFeature item={featured} sizes="(min-width: 1024px) 700px, 100vw" />
              </Reveal>
            </li>
            {rest.map((item, i) => (
              <li key={item.id} className="lg:col-span-5">
                <Reveal className="h-full" delay={0.08 * (i + 1)}>
                  <NewsTile item={item} sizes="(min-width: 640px) 176px, 96px" />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
