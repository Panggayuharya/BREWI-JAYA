import type { Metadata } from "next";
import { getNews } from "@/data/news";
import { getSiteSettings, uiText } from "@/data/site";
import { HeroHeading, NewsBody, NewsHero } from "@/components/news/NewsHero";
import { NewsList } from "@/components/news/NewsList";

export const metadata: Metadata = {
  title: `News — ${getSiteSettings().brandName}`,
  description: uiText.newsSubtitle,
};

export default function NewsPage() {
  return (
    <>
      <NewsHero>
        <HeroHeading eyebrow={uiText.newsEyebrow} title={uiText.newsTitle} subtitle={uiText.newsSubtitle} />
      </NewsHero>
      <NewsBody>
        <div className="container-brewi pt-14 pb-28">
          <NewsList items={getNews()} />
        </div>
      </NewsBody>
    </>
  );
}
