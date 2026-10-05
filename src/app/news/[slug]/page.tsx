import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNews, getNewsBySlug, getRelatedNews } from "@/data/news";
import { getSiteSettings, uiText } from "@/data/site";
import { NewsBody, NewsHero } from "@/components/news/NewsHero";
import { NewsCard, NewsImage, NewsMeta } from "@/components/news/NewsCard";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const item = getNewsBySlug((await params).slug);
  if (!item) return {};
  return {
    title: `${item.title} — ${getSiteSettings().brandName}`,
    description: item.excerpt,
    // TODO: tambahkan images (item.imageUrl) setelah metadataBase / domain asli di-set di app/layout.tsx
    openGraph: { title: item.title, description: item.excerpt },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const item = getNewsBySlug((await params).slug);
  if (!item) notFound();
  const related = getRelatedNews(item, 3);

  return (
    <>
      {/* Hero ditahan; konten (foto + isi) naik menimpanya */}
      <NewsHero className="pb-[calc(var(--radius-section)+4.5rem)]">
        <Link
          href="/news"
          className="group inline-flex w-fit items-center gap-2 text-small font-semibold tracking-[0.14em] text-cream/70 uppercase transition-colors duration-300 hover:text-accent"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          {uiText.newsBack}
        </Link>
        <NewsMeta item={item} surface="dark" className="text-cream" />
        <h1 className="max-w-4xl font-display text-[clamp(36px,5vw,72px)] leading-[1.05] font-semibold tracking-[-0.02em]">
          {item.title}
        </h1>
        <p className="max-w-2xl text-subtitle leading-relaxed text-cream/75">{item.excerpt}</p>
      </NewsHero>

      <NewsBody className="pt-12 pb-28 md:pt-16">
        <article className="container-brewi flex flex-col items-center gap-14">
          <div className="relative aspect-3/2 w-full overflow-hidden rounded-card bg-cream shadow-raised md:aspect-video">
            <NewsImage item={item} sizes="(min-width: 1280px) 1200px, 100vw" priority />
          </div>

          <div className="flex w-full max-w-2xl flex-col gap-6 text-ink/80">
            {item.body.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "font-display text-[clamp(20px,1.8vw,24px)] leading-relaxed text-ink"
                    : "text-[17px] leading-[1.8]"
                }
              >
                {p}
              </p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <div className="container-brewi mt-24 flex flex-col gap-10 pt-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.02em]">{uiText.newsOther}</h2>
              <Link
                href="/news"
                className="text-small font-semibold tracking-[0.14em] text-coffee uppercase transition-colors duration-300 hover:text-accent-deep"
              >
                {uiText.newsSeeAll} →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {related.map((n) => (
                <li key={n.id}>
                  <NewsCard item={n} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </NewsBody>
    </>
  );
}
