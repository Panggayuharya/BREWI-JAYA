import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, Unbounded } from "next/font/google";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { PhotoTintToggle } from "@/components/motion/PhotoTintToggle";
import { getSiteSettings } from "@/data/site";
import "./globals.css";

// Hanya bobot yang dipakai: 300 (subjudul miring), 600 (semua judul)
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// Font tulisan brand "BREWi JAYA" (hanya bold)
const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-unbounded",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const site = getSiteSettings();

export const metadata: Metadata = {
  title: `${site.brandName} — Coffee & Eatery`,
  description: site.tagline,
};

export const viewport: Viewport = {
  themeColor: "#071331",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${jakarta.variable} ${unbounded.variable}`}>
      <body>
        {/* Link lompat untuk pengguna keyboard/screen reader: tersembunyi, muncul saat Tab pertama */}
        <a
          href="#konten"
          className="fixed top-3 left-3 z-70 -translate-y-24 rounded-pill bg-accent px-5 py-2.5 text-small font-semibold text-ink shadow-raised transition-transform duration-300 focus:translate-y-0"
        >
          Lewati ke konten
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <PhotoTintToggle />
      </body>
    </html>
  );
}
