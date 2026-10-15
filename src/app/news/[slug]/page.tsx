import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { NewsItem } from "@/types";
import { getNewsBySlug, getNewsSlugs, getRelatedNews } from "@/server/queries";
import { getSiteSettings, uiText } from "@/data/site";
import { BackButton, NewsBody, NewsHero } from "@/components/sections/NewsHero";
import { NewsImage, NewsMeta, NewsRow } from "@/components/sections/NewsCard";
import { MediaImage } from "@/components/ui/MediaImage";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNewsSlugs();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const item = await getNewsBySlug((await params).slug);
  if (!item) return {};
  return {
    title: `${item.title} — ${getSiteSettings().brandName}`,
    description: item.excerpt,
    // TODO: tambahkan images (item.imageUrl) setelah metadataBase / domain asli di-set di app/layout.tsx
    openGraph: { title: item.title, description: item.excerpt },
  };
}

/** Perkiraan waktu baca (±200 kata per menit), minimal 1 menit. */
function readingMinutes(item: NewsItem) {
  const words = [item.excerpt, ...item.body].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Foto berita samar di sisi kanan hero (desktop saja) supaya hero tidak polos.
 * Foto suasana memudar ke kiri; foto cup (cutout) tampil utuh dengan cahaya biru di belakangnya.
 */
function HeroBackdrop({ item }: { item: NewsItem }) {
  if (!item.imageUrl) return null;
  if (item.imageIsCutout) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[6%] hidden w-[26%] lg:block">
        <div className="absolute inset-x-0 top-1/2 aspect-square -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-x-0 top-[calc(var(--nav-h)+2rem)] bottom-[calc(var(--radius-section)+2.5rem)] opacity-90">
          <MediaImage src={item.imageUrl} alt="" sizes="30vw" fit="contain" className="drop-shadow-[0_24px_30px_rgba(0,0,0,0.45)]" />
        </div>
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] opacity-25 mask-[linear-gradient(to_left,black_35%,transparent)] lg:block"
    >
      <MediaImage src={item.imageUrl} alt="" sizes="55vw" />
    </div>
  );
}

export default async function NewsDetailPage({ params }: Params) {
  const item = await getNewsBySlug((await params).slug);
  if (!item) notFound();
  const related = await getRelatedNews(item, 5);
  const { brandName } = getSiteSettings();
  const [lead, ...rest] = item.body;

  return (
    <>
      {/* Hero ditahan; konten (foto + isi) naik menimpanya */}
      <NewsHero backdrop={<HeroBackdrop item={item} />}>
        <BackButton href="/#news" label={uiText.newsBack} variant="outline-light" />
        <NewsMeta item={item} surface="dark" className="mt-4 text-cream" />
        <h1 className="max-w-4xl font-display text-[clamp(36px,5vw,72px)] leading-[1.05] font-semibold tracking-[-0.02em] lg:max-w-[62%]">
          {item.title}
        </h1>
        <p className="max-w-2xl text-subtitle leading-relaxed text-cream/75 lg:max-w-[55%]">{item.excerpt}</p>
      </NewsHero>

      {/* Desktop: kiri foto + isi berita, kanan daftar berita lain (sticky). HP: daftar turun ke bawah isi. */}
      <NewsBody className="pt-12 pb-28 md:pt-16">
        <div className="container-brewi grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <article className="flex flex-col gap-8 lg:col-span-8">
            <figure className="flex flex-col gap-4">
              <div className="relative aspect-3/2 w-full overflow-hidden rounded-card bg-cream shadow-raised md:aspect-video">
                <NewsImage item={item} sizes="(min-width: 1280px) 800px, (min-width: 1024px) 66vw, 100vw" priority />
              </div>
              <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small tracking-[0.06em] text-ink/55">
                <span>
                  {uiText.newsBy} <span className="font-semibold text-ink">{brandName}</span>
                </span>
                <span aria-hidden className="size-1 rounded-full bg-ink/25" />
                <span>
                  {readingMinutes(item)} {uiText.newsMinutesRead}
                </span>
              </figcaption>
            </figure>

            <div className="flex w-full max-w-2xl flex-col gap-6 text-ink/80">
              {/* Paragraf pembuka: huruf display dengan garis aksen di kiri */}
              {lead && (
                <p className="border-l-2 border-accent pl-5 font-display text-[clamp(20px,1.8vw,24px)] leading-relaxed text-ink sm:pl-6">
                  {lead}
                </p>
              )}
              {rest.map((p, i) => (
                <p
                  key={i}
                  className={`text-[17px] leading-[1.8] ${
                    // Huruf awal besar (drop cap) di paragraf isi pertama
                    i === 0
                      ? "first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-display first-letter:text-[64px] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-coffee"
                      : ""
                  }`}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Penutup artikel: ornamen + tombol kembali */}
            <div className="mt-6 flex max-w-2xl flex-col gap-8">
              <div aria-hidden className="flex items-center gap-4 text-accent-deep/60">
                <span className="h-px flex-1 bg-ink/10" />
                <span className="size-1.5 rotate-45 bg-current" />
                <span className="size-2 rotate-45 bg-current" />
                <span className="size-1.5 rotate-45 bg-current" />
                <span className="h-px flex-1 bg-ink/10" />
              </div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <NewsMeta item={item} className="text-ink" />
                <BackButton href="/#news" label={uiText.newsBack} variant="outline-navy" />
              </div>
            </div>
          </article>

          {related.length > 0 && (
            <aside className="flex flex-col gap-6 self-start rounded-card bg-cream p-6 sm:p-7 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:col-span-4">
              <div className="flex flex-col gap-2">
                <p className="eyebrow text-coffee">{uiText.newsAlsoRead}</p>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em]">{uiText.newsOther}</h2>
              </div>
              <ul className="flex flex-col divide-y divide-ink/10">
                {related.map((n) => (
                  <li key={n.id} className="py-5 first:pt-0 last:pb-0">
                    <NewsRow item={n} />
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </NewsBody>
    </>
  );
}
