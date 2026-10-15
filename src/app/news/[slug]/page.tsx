import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug, getNewsSlugs, getRelatedNews } from "@/server/queries";
import { getSiteSettings, uiText } from "@/data/site";
import { NewsBody, NewsHero } from "@/components/sections/NewsHero";
import { NewsImage, NewsMeta, NewsRow } from "@/components/sections/NewsCard";

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

export default async function NewsDetailPage({ params }: Params) {
  const item = await getNewsBySlug((await params).slug);
  if (!item) notFound();
  const related = await getRelatedNews(item, 5);

  return (
    <>
      {/* Hero ditahan; konten (foto + isi) naik menimpanya */}
      <NewsHero>
        <Link
          href="/#news"
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

      {/* Desktop: kiri foto + isi berita, kanan daftar berita lain (sticky). HP: daftar turun ke bawah isi. */}
      <NewsBody className="pt-12 pb-28 md:pt-16">
        <div className="container-brewi grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <article className="flex flex-col gap-10 lg:col-span-8 lg:gap-12">
            <div className="relative aspect-3/2 w-full overflow-hidden rounded-card bg-cream shadow-raised md:aspect-video">
              <NewsImage item={item} sizes="(min-width: 1280px) 800px, (min-width: 1024px) 66vw, 100vw" priority />
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
            <aside className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:col-span-4 lg:self-start">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.01em]">{uiText.newsOther}</h2>
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
