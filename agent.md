# AGENT — BREWI JAYA ☕

Panduan untuk AI coding agent (Claude Code, Cursor, Copilot, dan sejenisnya) yang mengerjakan proyek ini. Baca file ini **sebelum menulis kode apa pun**.

---

## 1. Ringkasan Proyek

**Brewi Jaya** adalah landing page coffee shop dengan target Gen Z. Web harus interaktif, penuh scroll motion, overlapping section, dan objek yang bergerak saat di-scroll, serta berjalan mulus di **HP dan laptop**.

Fase 1 hanya landing page satu halaman dengan section: **Intro, Home, Tentang, Menu (Kopi, Non-Kopi, Makanan), Gallery, Lokasi, Reservasi**.

### Dokumen acuan (wajib dibaca)

| File | Isi | Kapan dipakai |
|---|---|---|
| `design.md` | Layout, warna, tipografi, urutan section, detail setiap animasi, aturan responsif | Setiap kali membuat atau mengubah tampilan dan animasi |
| `erd.md` | Struktur data (tabel, kolom, relasi) | Setiap kali membuat tipe data, data dummy, atau API |
| `agent.md` | Aturan teknis dan cara kerja (file ini) | Selalu |

Jika ada konflik: **`design.md` menang untuk urusan tampilan**, **`erd.md` menang untuk urusan data**, dan **`agent.md` menang untuk urusan teknis dan struktur kode**. Jika masih ragu, tanyakan ke pemilik proyek, jangan menebak.

---

## 2. Tech Stack

| Kebutuhan | Pilihan |
|---|---|
| Framework | Next.js (App Router), versi stabil terbaru |
| Bahasa | TypeScript, mode `strict` |
| Styling | Tailwind CSS v4 (token di `globals.css` lewat `@theme`) |
| Smooth scroll | `lenis` |
| Scroll animation | `gsap` + `ScrollTrigger` + `Flip`, dengan hook `useGSAP` dari `@gsap/react` |
| Animasi komponen dan drag | `motion` (Framer Motion, import dari `motion/react`) |
| Komponen animasi siap pakai | React Bits (varian **TypeScript + Tailwind**) |
| Carousel gallery (opsional) | Embla Carousel + plugin Auto Scroll |
| Peta | Google Maps embed (iframe) atau `react-leaflet` |
| Font | `next/font/google`: Fraunces dan Plus Jakarta Sans |
| Gambar | `next/image` |
| Data fase 1 | File TypeScript statis di `src/data/` yang bentuknya sama dengan tabel di `erd.md` |
| Data fase 2 | Database + ORM (Prisma), mengikuti `erd.md` |
| Package manager | `pnpm` |

Jangan menambah library animasi lain (misalnya AOS, anime.js, Locomotive Scroll) tanpa persetujuan. Semua kebutuhan sudah tercakup oleh stack di atas.

---

## 3. Perintah

```bash
pnpm install        # pasang dependency
pnpm dev            # jalankan di http://localhost:3000
pnpm build          # build produksi (wajib lolos sebelum dianggap selesai)
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
```

Setiap selesai satu tugas, jalankan `pnpm lint`, `pnpm typecheck`, dan `pnpm build`. Tugas belum selesai jika salah satu gagal.

---

## 4. Struktur Folder

```
src/
├── app/
│   ├── layout.tsx              # font, metadata, SmoothScrollProvider
│   ├── page.tsx                # menyusun semua section sesuai urutan di design.md
│   └── globals.css             # Tailwind + design tokens (@theme)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Intro.tsx           # logo + kilap + cup membuka Home
│   │   ├── Home.tsx
│   │   ├── About.tsx           # Tentang, kartu bertumpuk
│   │   ├── MenuCoffee.tsx      # Kopi & Non-Kopi, kapsul + busur thumbnail
│   │   ├── MenuFood.tsx        # Makanan, horizontal pin scroll
│   │   ├── Gallery.tsx         # dua baris marquee + drag
│   │   ├── Location.tsx        # multi outlet
│   │   └── Reservation.tsx
│   ├── ui/                     # Button, Chip, Tab, Card, SocialBar, dll.
│   ├── motion/                 # FloatingObject, ParallaxLayer, StackPanel, dll.
│   └── reactbits/              # komponen hasil salin dari React Bits (lihat bagian 8)
├── data/                       # data statis fase 1, bentuk mengikuti erd.md
│   ├── site.ts
│   ├── menu.ts
│   ├── gallery.ts
│   └── outlets.ts
├── hooks/
│   ├── useReducedMotion.ts
│   └── useIsMobile.ts
├── lib/
│   ├── gsap.ts                 # registrasi plugin GSAP (sekali saja)
│   ├── whatsapp.ts             # pembuat link wa.me
│   ├── hours.ts                # cek status buka/tutup outlet
│   └── format.ts               # format rupiah, dll.
├── types/
│   └── index.ts                # tipe TypeScript sesuai erd.md
public/
├── brand/                      # logo (svg), cup intro
├── menu/                       # foto menu
├── gallery/
├── outlets/
└── floating/                   # biji kopi, daun, es batu (png/webp transparan)
```

Aturan: satu section = satu file di `components/sections/`. Jika file section melebihi ±250 baris, pecah bagian-bagiannya ke subfolder, misalnya `sections/menu-coffee/CapsuleImage.tsx`.

---

## 5. Aturan Kode

- Nama file komponen `PascalCase.tsx`, hook `useCamelCase.ts`, utilitas `camelCase.ts`.
- Nama variabel, fungsi, dan komponen dalam **bahasa Inggris**. Teks yang tampil ke pengunjung dalam **bahasa Indonesia**, kecuali yang sudah ditentukan dalam bahasa Inggris di `design.md` (misalnya Our “Signature Dishes”, More info, Our Menu).
- Komponen yang memakai animasi, event, atau hook browser wajib diawali `"use client"`. Section statis tetap Server Component.
- Tidak ada warna, ukuran font, atau radius yang di-hardcode. Selalu pakai token dari `globals.css` (lihat bagian 6).
- Tidak ada teks konten yang di-hardcode di dalam komponen section. Ambil dari `src/data/`.
- Hindari `any`. Semua data memakai tipe dari `src/types/index.ts`.
- Gunakan `next/image` untuk semua foto, dengan `sizes` yang benar dan `priority` hanya untuk aset Intro dan Home.

---

## 6. Design Tokens

Nilai lengkap ada di `design.md` bagian 2. Tulis sebagai token Tailwind v4:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-charcoal: #1C1C21;
  --color-charcoal-soft: #2A2A31;
  --color-brewi-yellow: #FFBF1F;
  --color-espresso: #3A1F14;
  --color-cream: #F7F8F6;
  --color-brewi-green: #0F8A5F;
  --color-latte: #EFE3D3;
  --color-muted: #6B6B70;

  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;

  --radius-card: 24px;
  --radius-section: 40px;

  --ease-out-soft: cubic-bezier(.22, 1, .36, 1);
  --ease-inout-soft: cubic-bezier(.65, 0, .35, 1);
}
```

Pemakaian: `bg-charcoal`, `text-brewi-yellow`, `font-display`, `rounded-card`, dan seterusnya.

---

## 7. Aturan Animasi (paling penting)

### 7.1 Setup GSAP dan Lenis

Plugin GSAP diregistrasi **sekali** di `lib/gsap.ts`:

```ts
// src/lib/gsap.ts
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

export { gsap, ScrollTrigger, Flip, useGSAP };
```

Lenis disinkronkan dengan ticker GSAP agar ScrollTrigger dan smooth scroll tidak saling bertabrakan:

```tsx
// src/components/motion/SmoothScrollProvider.tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
```

Navigasi navbar memakai `lenis.scrollTo(target)` (simpan instance Lenis di context), bukan `scrollIntoView`.

### 7.2 Aturan wajib

1. **Semua animasi GSAP ditulis di dalam `useGSAP`** dengan `scope` berupa ref section, supaya otomatis dibersihkan saat komponen unmount.
2. Hanya animasikan `transform` (x, y, scale, rotate), `opacity`, `filter`, dan `clip-path`. Jangan animasikan `width`, `height`, `top`, `left`, atau `margin`.
3. Animasi berbasis scroll memakai `scrub: 1`. Animasi berbasis waktu memakai durasi dan easing dari `design.md` bagian 12.2.
4. Gunakan `gsap.matchMedia()` untuk membedakan nilai desktop dan mobile (misalnya scale cup intro 14 vs 9, jarak pin per item Menu 60vh vs 45vh).
5. Setelah gambar atau font selesai dimuat dan setelah layout berubah, panggil `ScrollTrigger.refresh()`.
6. **Jangan membuat pin di dalam pin.** Section yang di-pin (Intro, Tentang, Menu Kopi, Menu Makanan) harus bersaudara di level `page.tsx`.
7. Section di-pin dibuat berurutan dari atas ke bawah di DOM, dan ScrollTrigger dibuat sesuai urutan itu. Jika terpaksa tidak berurutan, gunakan `refreshPriority`.
8. Untuk horizontal scroll Menu Makanan, panjang pin dihitung dari `track.scrollWidth - window.innerWidth` dan dibungkus fungsi agar dihitung ulang saat resize (`end: () => "+=" + distance()`, `invalidateOnRefresh: true`).
9. Tinggi layar memakai `100svh`, bukan `100vh`.
10. Objek melayang memakai komponen `components/motion/FloatingObject.tsx` yang menerima `speed`, `rotate`, dan `hideOnMobile`. Jangan membuat logika parallax berulang di tiap section.

### 7.3 Reduced motion

Hook `useReducedMotion()` membaca `prefers-reduced-motion`. Jika aktif:

- Lenis tidak dijalankan.
- Intro diganti fade 0.4 detik tanpa pin.
- Tentang tampil sebagai kartu biasa berurutan, tanpa stacking.
- Menu Kopi tampil tanpa pin, item dipilih lewat klik thumbnail atau tab.
- Menu Makanan menjadi baris yang bisa digeser biasa (`overflow-x: auto`).
- Marquee Gallery berhenti, drag tetap aktif.
- Parallax dan objek melayang dimatikan.

### 7.4 Pemetaan animasi ke komponen

| Section | Teknik | Catatan |
|---|---|---|
| Intro | GSAP timeline + ScrollTrigger pin, `Flip` untuk logo ke navbar | Lewati intro jika `sessionStorage.brewiIntroSeen === "1"` |
| Home | Parallax GSAP, count up, tilt mengikuti kursor (desktop saja) | |
| Tentang | Pin + stacking (scale dan redup kartu lama) | Boleh memakai Scroll Stack dari React Bits |
| Menu Kopi | Pin dengan snap per item, thumbnail bergerak di busur | Hitung posisi busur dengan trigonometri, simpan di `lib/arc.ts` |
| Menu Makanan | Pin + translate X track | Progress bar ikut scroll |
| Gallery | `motion/react` (`useMotionValue`, `useAnimationFrame`, `drag`) | Posisi di-wrap modulo lebar satu salinan |
| Lokasi | `motion/react` `layoutId` untuk indikator outlet aktif, `AnimatePresence` untuk detail | |
| Overlapping antar section | Komponen `StackPanel` | Section baru naik menimpa, section lama scale 0.94 dan gelap 40% |

---

## 8. Aturan React Bits

- Pasang komponen React Bits dengan perintah instalasi yang tertera di halaman komponennya (tersedia lewat shadcn CLI atau jsrepo). Pilih varian **TypeScript + Tailwind**.
- Simpan hasilnya di `src/components/reactbits/`, satu komponen satu file.
- Jangan mengedit logika inti komponen React Bits. Jika perlu penyesuaian, buat wrapper di `components/ui/` atau `components/motion/`, dan beri komentar di bagian atas file asli jika memang harus diubah.
- Setiap komponen React Bits yang dipakai dicatat di tabel berikut (perbarui saat menambah):

| Komponen | Dipakai di | File |
|---|---|---|
| Shiny Text / Glare Hover | Intro (kilap logo) | `reactbits/ShinyText.tsx` |
| Split Text | Heading Home, nama menu | `reactbits/SplitText.tsx` |
| Scroll Reveal | Paragraf Tentang | `reactbits/ScrollReveal.tsx` |
| Scroll Stack | Kartu Tentang | `reactbits/ScrollStack.tsx` |
| Scroll Velocity | Pita teks berjalan | `reactbits/ScrollVelocity.tsx` |
| Count Up | Statistik Home, harga | `reactbits/CountUp.tsx` |
| Magnet | Tombol More info, tombol WhatsApp | `reactbits/Magnet.tsx` |

- Jika sebuah komponen React Bits memakai library yang bertabrakan dengan stack (misalnya membawa smooth scroll sendiri), jangan dipakai. Buat versi sendiri dengan GSAP.

---

## 9. Data dan Tipe

Tipe di `src/types/index.ts` **harus sama** dengan kolom di `erd.md` (nama kolom snake_case di database, camelCase di TypeScript). Contoh:

```ts
export type MenuCategoryType = "kopi" | "non_kopi" | "makanan";

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  imageCutoutUrl?: string;
  isSignature: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isAvailable: boolean;
  sortOrder: number;
  tags: Tag[];
}

export interface Outlet {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  gmapsUrl: string;
  coverImageUrl: string;
  openingHours: OpeningHour[];
  whatsappContacts: WhatsappContact[];
}
```

Link WhatsApp selalu dibuat lewat satu helper:

```ts
// src/lib/whatsapp.ts
export function buildWhatsappLink(number: string, template: string, vars: Record<string, string>) {
  const text = template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
```

Aturan data:

- Fase 1 memakai data statis di `src/data/`. Komponen **tidak boleh** tahu data berasal dari file atau database; ambil lewat fungsi di `src/data/` (misalnya `getMenuByType("kopi")`) supaya nanti cukup mengganti isinya ke query database.
- Nomor WhatsApp, alamat, dan harga yang belum diberikan pemilik ditulis sebagai placeholder yang jelas (misalnya `6281234567890`) dan diberi komentar `// TODO: ganti data asli`.

---

## 10. Responsif dan Aksesibilitas

Checklist yang harus lolos di setiap section:

- [ ] Dicek di lebar 375px, 768px, 1280px, dan 1440px.
- [ ] Tidak ada scroll horizontal pada `body`.
- [ ] Area sentuh minimal 44×44px.
- [ ] Teks memakai `clamp()` sesuai skala di `design.md`.
- [ ] Semua gambar punya `alt` bahasa Indonesia yang deskriptif (gambar dekoratif: `alt=""`).
- [ ] Semua tombol dan tab bisa dipakai dengan keyboard, fokus terlihat (outline kuning 3px).
- [ ] Kontras teks minimal 4.5:1.
- [ ] Berfungsi dengan `prefers-reduced-motion`.
- [ ] Navbar, tab menu, dan pilihan outlet memakai elemen semantik (`nav`, `button`, `aria-pressed` / `aria-selected`).

---

## 11. Performa

- Target Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
- Foto dalam WebP/AVIF, dikompres. Foto menu maksimal 1200px sisi terpanjang.
- Section di bawah lipatan pertama (Gallery, Lokasi, peta) dimuat dengan `next/dynamic` atau lazy load.
- Peta baru dimuat saat section Lokasi mendekati layar.
- Objek melayang di mobile dikurangi setengahnya.
- Jangan memasang listener `scroll` manual jika bisa memakai ScrollTrigger atau `useScroll` dari motion.

---

## 12. Cara Kerja Agent

### 12.1 Urutan pengerjaan

Kerjakan satu milestone sampai selesai dan lolos build sebelum lanjut:

1. **Setup**: proyek Next.js, Tailwind + token, font, `lib/gsap.ts`, `SmoothScrollProvider`, tipe, data dummy.
2. **Layout**: Navbar (desktop dan mobile), Footer, `StackPanel`, `FloatingObject`.
3. **Home** (tanpa intro dulu, agar layout stabil).
4. **Intro** (logo, kilap, cup membuka Home, logo ke navbar).
5. **Tentang**.
6. **Menu Kopi dan Non-Kopi**.
7. **Menu Makanan**.
8. **Gallery**.
9. **Lokasi**.
10. **Reservasi** (menunggu detail dari pemilik).
11. **Polishing**: reduced motion, audit responsif, audit performa.

### 12.2 Definisi selesai

Sebuah tugas dianggap selesai jika:

- Tampilan dan animasi sesuai `design.md`.
- `pnpm lint`, `pnpm typecheck`, dan `pnpm build` lolos.
- Checklist bagian 10 terpenuhi untuk section tersebut.
- Tidak ada error atau warning di console browser.
- Scroll bolak-balik (atas ke bawah lalu kembali ke atas) tidak menimbulkan loncatan atau animasi macet.

### 12.3 Yang tidak boleh dilakukan

- Mengubah urutan section, warna, atau font di luar yang tertulis di `design.md` tanpa persetujuan.
- Menambah fitur di luar fase 1 (login, order online, keranjang, formulir reservasi).
- Menambah dependency baru tanpa menyebutkan alasannya.
- Menyalin aset berhak cipta (logo brand lain, foto dari internet tanpa izin). Pakai placeholder sampai aset asli tersedia.
- Menghapus atau menulis ulang file besar tanpa diminta. Lakukan perubahan sekecil mungkin yang menyelesaikan tugas.

### 12.4 Saat ragu

Jika instruksi di `design.md` tidak jelas atau tidak mungkin diwujudkan (misalnya berat di HP), jelaskan masalahnya, tawarkan 1–2 alternatif, lalu tunggu keputusan pemilik proyek.

### 12.5 Commit

Gunakan format Conventional Commits dalam bahasa Inggris:

```
feat(menu): add capsule image transition
fix(intro): logo flip lands off-center on mobile
style(home): adjust yellow blob curve
perf(gallery): lazy load images
```
