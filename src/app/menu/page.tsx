import type { Metadata } from "next";
import { getSiteSettings, uiText } from "@/data/site";
import { BackButton, HeroHeading, NewsBody, NewsHero } from "@/components/sections/NewsHero";
import { MenuFlipbook } from "@/components/sections/MenuFlipbook";
import { getMenuBookPages } from "@/server/queries";

export const metadata: Metadata = {
  title: `Menu — ${getSiteSettings().brandName}`,
  description: uiText.menuBookHint,
};

/** Halaman "Lihat detail menu": hanya buku menu cetak dalam bentuk flipbook. */
export default async function MenuPage() {
  const pages = await getMenuBookPages();

  return (
    <>
      <NewsHero nav="menu">
        <BackButton href="/#menu" label={uiText.menuBack} variant="outline-light" />
        <HeroHeading eyebrow={uiText.menuEyebrow} title={uiText.menuBookTitle} subtitle={uiText.menuBookHint} />
      </NewsHero>
      <NewsBody nav="menu">
        <div className="container-brewi pt-14 pb-28">
          <MenuFlipbook pages={pages} />
          <div className="mt-12 flex justify-center">
            <BackButton href="/#menu" label={uiText.menuBack} variant="outline-navy" />
          </div>
        </div>
      </NewsBody>
    </>
  );
}
