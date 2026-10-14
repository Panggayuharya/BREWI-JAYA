# BREWI JAYA

Landing page coffee shop Brewi Jaya (Coffee & Eatery): Intro → Home → Tentang → Menu → Gallery → News → Lokasi → Reservasi, ditambah halaman `/menu` (buku menu flipbook) dan `/news`.

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · GSAP + ScrollTrigger (`@gsap/react`) · Lenis · motion · ogl (Aurora WebGL) · pnpm

## Perintah

```bash
pnpm install
pnpm dev          # development
pnpm lint
pnpm typecheck
pnpm build        # production build
pnpm start        # jalankan hasil build
```

## Struktur

```
src/
├── app/                 # route: / (landing), /menu, /news/[slug], /admin (dashboard)
├── components/
│   ├── admin/           # komponen dashboard admin
│   ├── layout/          # Navbar, MobileMenu, Footer, SiteEffects
│   ├── sections/        # section landing page + MenuFlipbook, NewsCard, NewsHero
│   ├── motion/          # SmoothScrollProvider (Lenis), StackPanel, Reveal, PhotoTintToggle
│   └── ui/              # Button, BrandLogo, JellyNav, JellyTabs, Aurora, MediaImage, dll.
├── data/                # konten statis (site, menu, news, outlets, gallery)
├── db/                  # koneksi & skema database (drizzle)
├── server/              # query, auth, upload (khusus server)
├── hooks/
├── lib/                 # gsap, jelly, easing, hours, whatsapp, format, utils, dll.
└── types/               # tipe data (mengikuti erd.md)
scripts/                 # migrasi, seed, buat admin, setup storage (pnpm db:*, admin:create, storage:setup)
drizzle/                 # file migrasi SQL
public/                  # foto (brand, gallery, menu, menu-book, place)
```

Konten (teks, harga, outlet, foto) cukup diubah di `src/data/`. Data yang masih placeholder ditandai `TODO`.
