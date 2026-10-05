import type { Metadata } from "next";
import Link from "next/link";
import { menuBookPages } from "@/data/menu";
import { getSiteSettings, uiText } from "@/data/site";
import { NewsBody, NewsHero } from "@/components/news/NewsHero";
import { MenuFlipbook } from "@/components/menu/MenuFlipbook";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: `Menu — ${getSiteSettings().brandName}`,
  description: uiText.menuBookHint,
};

/** Tombol kembali ke section Menu di landing page; dipasang di atas judul dan di bawah flipbook. */
function BackToHome({ variant }: { variant: "outline-light" | "outline-navy" }) {
  return (
    <Link href="/#menu" className={buttonClass(variant, "group w-fit pl-5")}>
      <span aria-hidden className="text-lg leading-none transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      {uiText.menuBack}
    </Link>
  );
}

/** Halaman "Lihat detail menu": hanya buku menu cetak dalam bentuk flipbook. */
export default function MenuPage() {
  return (
    <>
      <NewsHero nav="menu" className="pb-[calc(var(--radius-section)+4.5rem)]">
        <BackToHome variant="outline-light" />
        <p className="eyebrow text-accent">{uiText.menuEyebrow}</p>
        <h1 className="font-display text-hero font-semibold tracking-[-0.02em]">{uiText.menuBookTitle}</h1>
        <p className="max-w-xl text-subtitle leading-relaxed text-cream/75">{uiText.menuBookHint}</p>
      </NewsHero>
      <NewsBody nav="menu">
        <div className="container-brewi pt-14 pb-28">
          <MenuFlipbook pages={menuBookPages} />
          <div className="mt-12 flex justify-center">
            <BackToHome variant="outline-navy" />
          </div>
        </div>
      </NewsBody>
    </>
  );
}
