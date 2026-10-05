import type { Metadata } from "next";
import { getNews } from "@/data/news";
import { getSiteSettings, uiText } from "@/data/site";
import { NewsBody, NewsHero } from "@/components/news/NewsHero";
import { NewsList } from "@/components/news/NewsList";

export const metadata: Metadata = {
  title: `News — ${getSiteSettings().brandName}`,
  description: uiText.newsSubtitle,
};

export default function NewsPage() {
  return (
    <>
      <NewsHero className="pb-[calc(var(--radius-section)+4.5rem)]">
        <p className="eyebrow text-accent">{uiText.newsEyebrow}</p>
        <h1 className="font-display text-hero font-semibold tracking-[-0.02em]">{uiText.newsTitle}</h1>
        <p className="max-w-xl text-subtitle leading-relaxed text-cream/75">{uiText.newsSubtitle}</p>
      </NewsHero>
      <NewsBody>
        <div className="container-brewi pt-14 pb-28">
          <NewsList items={getNews()} />
        </div>
      </NewsBody>
    </>
  );
}
