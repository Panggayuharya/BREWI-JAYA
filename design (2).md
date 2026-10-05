# DESIGN — BREWI JAYA ☕

Dokumen desain untuk landing page **Brewi Jaya**, coffee shop dengan target Gen Z. Fokus utama: **scroll motion, overlapping section, dan objek yang bergerak saat di-scroll**, tetap nyaman di HP maupun laptop.

Referensi visual:

1. **Home** mengikuti referensi 1 (layout gelap di kiri, blok kuning melengkung di kanan, piring besar di dalam lingkaran). Piring diganti **logo Brewi**.
2. **Menu Kopi** mengikuti referensi 2 (teks menu di kiri, foto berbentuk kapsul di kanan dengan thumbnail bulat di sepanjang busur, blok warna melengkung di belakang).

---

## 1. Urutan Halaman dan Alur Scroll

Satu halaman panjang (one page scroll). Navbar melakukan smooth scroll ke tiap section.

| Urutan | Section | Pola animasi utama | Pin (layar ditahan)? |
|---|---|---|---|
| 0 | **Intro** | Logo masuk + kilap cahaya, cup naik lalu membesar membuka Home | Ya, ±250vh |
| 1 | **Home** | Parallax, logo berputar pelan, objek melayang | Tidak |
| 2 | **Tentang** | Overlapping / stacking section, text reveal | Ya, per kartu |
| 3 | **Menu Kopi** | Item berganti mengikuti scroll, thumbnail berputar di busur | Ya, ±60vh per item |
| 4 | **Menu Makanan** | Horizontal scroll: foto geser ke kanan, setelah mentok baru lanjut ke bawah | Ya, sepanjang lebar track |
| 5 | **Gallery** | Dua baris foto berjalan otomatis berlawanan arah, bisa digeser | Tidak |
| 6 | **Lokasi** | Pilih outlet, peta dan detail berganti | Tidak |
| 7 | **Reservasi** | Halaman biasa (detail menyusul) | Tidak |
| 8 | **Footer** | Menyatu dengan Reservasi | Tidak |

Setiap section setelah Home masuk dengan **menimpa section sebelumnya** (overlapping): section baru naik dengan sudut atas membulat, section lama sedikit mengecil dan meredup di belakangnya.

---

## 2. Design Tokens

### 2.1 Warna

| Token | Hex | Dipakai untuk |
|---|---|---|
| `--charcoal` | `#1C1C21` | Background Home, navbar gelap, section gelap |
| `--charcoal-soft` | `#2A2A31` | Kartu di atas background gelap, gradasi Home |
| `--brewi-yellow` | `#FFBF1F` | Aksen utama: blok melengkung Home, tombol, angka, tab aktif |
| `--espresso` | `#3A1F14` | Teks di atas kuning, garis, harga |
| `--cream` | `#F7F8F6` | Background terang (Menu, Gallery, Lokasi) |
| `--brewi-green` | `#0F8A5F` | Blok melengkung Menu Kopi, chip aktif, angka urutan |
| `--latte` | `#EFE3D3` | Chip rasa (flavor tag), kartu makanan |
| `--muted` | `#6B6B70` | Teks sekunder |

Aturan pemakaian: kuning adalah warna brand dan muncul di setiap section minimal sekali (tombol, angka, atau garis). Hijau hanya dipakai di section Menu agar terasa seperti "halaman produk" sendiri, sesuai referensi 2.

### 2.2 Tipografi

| Peran | Font | Contoh pemakaian |
|---|---|---|
| Display serif | **Fraunces** (700–800) | Nama menu ("Signature Espresso"), harga, judul besar Tentang |
| Heading sans | **Plus Jakarta Sans** (700–800) | "Our Signature Dishes", judul section |
| Body | **Plus Jakarta Sans** (400–500) | Deskripsi, navbar, tombol |

Skala ukuran (desktop / mobile):

| Level | Desktop | Mobile |
|---|---|---|
| Hero title | 88px | 44px |
| Menu item name | 72px | 40px |
| Section title | 56px | 34px |
| Subtitle | 22px | 18px |
| Body | 17px | 16px |
| Small / chip | 13px | 12px |

Gunakan `clamp()` agar ukuran mengalir mulus di antara breakpoint, contoh: `font-size: clamp(44px, 6.5vw, 88px)`.

### 2.3 Radius, Border, Shadow

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--r-pill` | 999px | Tombol, chip, tab |
| `--r-card` | 24px | Kartu makanan, kartu outlet |
| `--r-section` | 40px | Sudut atas section yang menimpa (overlapping) |
| `--r-capsule` | 999px | Foto kapsul di Menu |
| `--ring` | 2px solid white | Bingkai foto kapsul dan thumbnail |
| `--shadow-lift` | `0 24px 60px rgba(0,0,0,.18)` | Kapsul, lingkaran logo Home, section yang menimpa |

### 2.4 Spacing dan Grid

- Container maksimum 1280px, padding samping `clamp(20px, 5vw, 72px)`.
- Desktop: grid 12 kolom, gap 24px. Mobile: 1 kolom.
- Jarak antar blok dalam section: 24 / 40 / 64px.

### 2.5 Breakpoint

| Nama | Lebar | Catatan |
|---|---|---|
| `sm` | < 640px | HP |
| `md` | 640–1023px | Tablet / HP landscape |
| `lg` | ≥ 1024px | Laptop |
| `xl` | ≥ 1440px | Monitor besar |

---

## 3. Intro (Opening Sequence)

Tujuan: momen pertama yang paling diingat. Semua dikendalikan scroll setelah logo selesai muncul.

### 3.1 Tahap otomatis (tanpa scroll)

| Waktu | Kejadian |
|---|---|
| 0.0–0.9s | Layar `--charcoal`. Logo Brewi muncul di tengah: opacity 0→1, scale 0.85→1, blur 12px→0. Easing `power3.out`. |
| 0.9–1.8s | **Kilap cahaya**: garis cahaya diagonal (gradasi putih transparan, lebar ±30% logo) menyapu logo dari kiri ke kanan. Dibuat dengan `mask-image` atau pseudo-element `::after` yang bergeser. |
| 1.8s+ | Teks kecil "Scroll untuk mulai" muncul di bawah dengan panah yang bergerak naik turun pelan. Kilap cahaya berulang tiap 4 detik selama belum di-scroll. |

### 3.2 Tahap scroll (section di-pin ±250vh)

| Progress scroll | Kejadian |
|---|---|
| 0–25% | **Cup kopi naik dari bawah layar** (translateY 100vh → 0) ke tengah, dengan sedikit rotasi (−8° → 0°). Uap tipis muncul di atas cup. |
| 25–35% | Logo Brewi mulai **bergerak ke pojok kiri atas** dan mengecil menjadi ukuran logo navbar. Gunakan teknik FLIP (GSAP Flip atau `layoutId` Framer Motion) supaya perpindahannya mulus dan mendarat tepat di posisi logo navbar. |
| 35–75% | **Cup membesar** (scale 1 → ±14) hingga menutupi layar. Bersamaan, Home terungkap lewat `clip-path: circle()` yang membesar dari tengah cup. |
| 75–100% | **Cup keluar dengan halus**: opacity 1 → 0 sambil terus membesar sedikit, blur 0 → 8px. Navbar muncul (fade + slide dari atas). Pin dilepas, Home sudah tampil penuh. |

Catatan teknis:

- Semua animasi hanya memakai `transform`, `opacity`, `filter`, dan `clip-path` agar tetap 60fps.
- Scroll dibuat halus dengan **Lenis**, dan animasi disambungkan ke scroll dengan **GSAP ScrollTrigger** (`scrub: 1`).
- Pengunjung yang kembali dalam sesi yang sama (cek `sessionStorage`) langsung melihat Home tanpa intro.
- Jika `prefers-reduced-motion` aktif, intro diganti fade sederhana 0.4 detik.

### 3.3 Wireframe

```
 Tahap otomatis            Scroll 0-25%             Scroll 35-75%            Selesai
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│                  │    │ [logo]──────►    │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │[logo] nav  nav ☰ │
│     ✦ BREWI ✦    │    │      BREWI       │    │▓▓▓   ( cup )  ▓▓▓│    │ BREWI JAYA   (●) │
│   (kilap lewat)  │    │       ┌─┐        │    │▓▓  membesar,   ▓▓│    │ Our "Signature   │
│                  │    │       │ │ ▲      │    │▓▓  Home muncul ▓▓│    │ Dishes"          │
│  scroll untuk    │    │       └─┘ naik   │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │ [More info]      │
│     mulai ↓      │    │                  │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 4. Navbar

- Kiri: logo Brewi (tujuan akhir animasi logo dari intro).
- Tengah: Home, Tentang, Menu, Gallery, Lokasi, Reservasi. Link aktif diberi garis bawah kuning yang **bergeser mulus** ke link lain saat section berganti.
- Kanan: ikon cari (opsional) dan tombol ☰ (mobile).
- Saat berada di atas section terang, navbar berganti ke latar cream semi transparan dengan blur, teks espresso.
- Scroll ke bawah: navbar menyembunyikan diri (slide up). Scroll ke atas: muncul kembali.
- Mobile: tombol ☰ membuka panel layar penuh berwarna `--charcoal`, link muncul bergantian (stagger 60ms).

---

## 5. Home (mengikuti referensi 1)

### 5.1 Layout desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [logo]     Home  Tentang  Menu  Gallery  Lokasi  Reservasi   ╭─────────  │
│                                                          ╭───╯  🔍  ☰   │
│                                                     ╭────╯ ┌─────┐     ┃f│
│  BREWI JAYA              (italic kecil, kuning)    │  ╭──────────╮  │   ┃t│
│  Our “Signature                                     │ │  ◯ LOGO   │ │   ┃ig│
│  Dishes”                 (heading besar, putih)     │ │  BREWI    │ │   ┃wa│
│  Kopi lokal dan menu andalan untuk nongkrong.       │  ╰──────────╯  │  kuning
│  [ More info ]                                      ╰────╮ ring tipis│
│                                                          ╰───╮       │
│  ◀ [foto] Kopi Susu   [foto] Croissant ▶           ● Best Barista  8  │
│       deskripsi         deskripsi                  ● Menu          38 │
└──────────────────────────────────────────────────────────────────────────┘
      background charcoal (gradasi ke kiri)            blok kuning melengkung
```

### 5.2 Elemen

| Elemen | Detail |
|---|---|
| Background kiri | Gradasi `--charcoal` → `--charcoal-soft` dari kanan ke kiri, seperti referensi |
| Blok kuning | Bentuk melengkung (SVG path) di sisi kanan, sisi kirinya membentuk lekukan S di belakang lingkaran logo |
| Lingkaran logo | Lingkaran putih besar (diameter ±42% lebar layar desktop) berisi **logo Brewi**, dengan satu cincin tipis putih di luar yang tidak konsentris sempurna, seperti referensi |
| Teks kecil | "BREWI JAYA", italic, kuning, 22px |
| Heading | Our “Signature Dishes”, 88px, putih, tebal |
| Subjudul | Satu kalimat pendek, 18px, putih 80% |
| Tombol | "More info", outline putih pill, hover terisi kuning. Mengarah ke section Menu |
| Slider signature | Kiri bawah: 2 kartu kecil (foto persegi + nama + deskripsi pendek) dengan tombol panah kuning kiri/kanan |
| Statistik | Kanan bawah di atas kuning: "Best Barista 8" dan "Menu 38" dalam kotak angka berbingkai espresso. Angka dianimasikan naik (count up) saat pertama terlihat |
| Sosial media | Bar vertikal putih menempel di tepi kanan: Instagram, TikTok, WhatsApp, Google Maps |

### 5.3 Motion Home

| Pemicu | Animasi |
|---|---|
| Home pertama terlihat (setelah intro) | Teks masuk per baris dari bawah (split text, stagger 80ms). Lingkaran logo masuk dengan scale 0.9 → 1 |
| Scroll turun | Lingkaran logo **berputar pelan** (0° → 25°) dan bergeser naik lebih lambat dari teks (parallax). Cincin tipis berputar berlawanan arah |
| Scroll turun | Blok kuning bergeser ke kanan ±40px, teks kiri bergeser naik lebih cepat |
| Objek melayang | Biji kopi dan daun kecil (PNG transparan) tersebar di sekitar lingkaran, masing-masing bergerak dengan kecepatan parallax berbeda saat di-scroll |
| Mouse bergerak (desktop) | Lingkaran logo sedikit mengikuti kursor (tilt ±6°) |
| Hover kartu slider | Foto membesar 1.05 |

### 5.4 Mobile

Susunan vertikal: teks di atas, lingkaran logo di bawah dengan blok kuning berubah menjadi bentuk setengah lingkaran di bagian bawah layar. Slider signature menjadi carousel geser dengan jari. Statistik tampil sejajar di bawah lingkaran. Bar sosial media pindah ke footer.

---

## 6. Tentang

Bebas menyesuaikan, dengan syarat ada **overlapping section** dan **scroll animation**.

### 6.1 Konsep: tiga kartu cerita yang bertumpuk

Section Tentang berisi tiga kartu besar setinggi layar. Saat di-scroll, kartu berikutnya naik dan **menimpa** kartu sebelumnya. Kartu yang tertimpa mengecil (scale 1 → 0.92) dan meredup, sehingga terlihat seperti tumpukan.

| Kartu | Warna latar | Isi |
|---|---|---|
| 1. Cerita | `--cream` | Judul serif besar, paragraf cerita Brewi Jaya, foto pendiri / kedai |
| 2. Biji kopi | `--brewi-yellow` | Asal biji kopi, proses sangrai, foto biji kopi |
| 3. Tempat | `--charcoal` | Suasana kedai (Wi-Fi, colokan, jam buka panjang), foto interior |

```
┌──────────────────────────────┐
│ kartu 1 (mengecil, redup)    │
│  ┌────────────────────────────┐
│  │ kartu 2 naik menimpa  ▲    │
│  │  Judul        [ foto ]     │
│  │  paragraf                  │
└──┤                            │
   └────────────────────────────┘
```

### 6.2 Motion Tentang

- **Text reveal**: paragraf muncul kata demi kata, dari abu-abu ke warna penuh sesuai progress scroll (seperti komponen Scroll Reveal di React Bits).
- **Foto**: masuk dengan `clip-path` yang membuka dari bawah ke atas, lalu bergerak parallax di dalam bingkainya.
- **Objek melayang**: biji kopi di kartu 2 jatuh pelan dan berputar mengikuti scroll.
- **Pita teks berjalan** di antara Tentang dan Menu: kalimat pendek ("kopi susu gula aren", "manual brew", "buka sampai malam") berjalan ke samping, arahnya ikut arah scroll.

---

## 7. Menu Kopi (mengikuti referensi 2)

### 7.1 Layout desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                     ●    │
│  ── Our Menu                                              ╭────╮  (thumb)│
│  [ Kopi ] [ Non-Kopi ] [ Makanan ]                   ╭────┤    │─╮       │
│                                                      │    │foto│ │ hijau │
│  01 / 05 ── Kopi                                     │    │kap-│ │       │
│  Signature                (serif, espresso)  (thumb) │    │sul │ │       │
│  Espresso                 (serif, hijau)             │    │    │ │       │
│  [Dark chocolate] [Bold] [Roasty]                    │    ╰────╯ │       │
│  Double shot, dark chocolate finish.          (thumb)╰───────────╯       │
│  Rp 22.000                                                               │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Elemen

| Elemen | Detail |
|---|---|
| Eyebrow | Garis pendek + "Our Menu", hijau, 13px |
| Tab kategori | Chip pill: Kopi, Non-Kopi, Makanan. Tab aktif berlatar hijau muda dengan border hijau |
| Penanda urutan | "01 / 05 ── Kopi", angka hijau |
| Nama menu | Dua baris serif besar: baris pertama espresso, baris kedua hijau (seperti referensi) |
| Chip rasa | Latar `--latte`, teks coklat, huruf kapital kecil. Diambil dari tabel `tags` |
| Deskripsi | Maksimal 2 baris, `--muted` |
| Harga | Serif, 32px, espresso |
| Blok hijau | Bentuk melengkung besar di kanan bawah, dengan garis putus-putus tipis melengkung di dalamnya |
| Foto kapsul | Foto utama berbentuk kapsul vertikal (radius penuh), bingkai putih 6px, shadow |
| Thumbnail | 3–4 foto bulat kecil berbingkai putih, tersusun di sepanjang **busur** di sekitar kapsul. Menampilkan item sebelum dan sesudahnya |

### 7.3 Motion Menu Kopi

Section ini **di-pin**. Setiap ±60vh scroll, item berikutnya tampil. Setelah item terakhir, pin dilepas dan halaman lanjut ke Menu Makanan.

| Pemicu | Animasi |
|---|---|
| Item berganti | Thumbnail **berputar di sepanjang busur**: thumbnail item berikutnya membesar dan terbang masuk ke kapsul, foto lama di kapsul mengecil keluar menjadi thumbnail |
| Item berganti | Nama menu keluar ke atas dan nama baru masuk dari bawah per baris (split text, mask). Chip rasa muncul bergantian (stagger 50ms). Harga dianimasikan (count up) |
| Item berganti | Penanda "01 / 05" berganti dengan efek angka bergulir |
| Scroll terus | Blok hijau berputar sangat pelan, garis putus-putus bergeser |
| Klik thumbnail / tab | Scroll otomatis ke posisi item atau kategori tersebut |
| Objek melayang | Es batu dan biji kopi kecil melayang di sekitar kapsul dengan parallax |

### 7.4 Mobile

Susunan vertikal: tab di atas (bisa digeser horizontal), foto kapsul di tengah dengan thumbnail berjajar di bawahnya dalam satu baris, lalu teks menu di bawah. Pin tetap dipakai tapi jarak scroll per item dipendekkan menjadi ±45vh. Pengguna juga bisa **swipe** kiri/kanan di foto kapsul untuk ganti item.

---

## 8. Menu Makanan (horizontal scroll)

Lanjutan langsung dari Menu Kopi. Section ini menimpa Menu Kopi (overlapping), lalu di-pin.

### 8.1 Perilaku

1. Saat section ini memenuhi layar, scroll vertikal **diubah menjadi gerakan horizontal**: deretan kartu makanan bergeser ke kiri sehingga terlihat seperti foto bergerak ke kanan.
2. Setelah kartu terakhir **mentok di kanan**, pin dilepas dan halaman baru bisa lanjut scroll ke bawah.
3. Panjang pin dihitung otomatis: `lebar track − lebar layar`.

```
 layar ditahan, scroll ke bawah = kartu bergeser ke samping
┌────────────────────────────────────────────┐
│ Makanan                     ▬▬▬▬▬░░░░░ 40%  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌───── │ ◄── bergeser
│ │ foto │ │ foto │ │ foto │ │ foto │ │ foto │
│ │      │ │      │ │      │ │      │ │      │
│ │Nama  │ │Nama  │ │Nama  │ │Nama  │ │Nama  │
│ │Rp    │ │Rp    │ │Rp    │ │Rp    │ │Rp    │
│ └──────┘ └──────┘ └──────┘ └──────┘ └───── │
└────────────────────────────────────────────┘
```

### 8.2 Kartu makanan

- Rasio 3:4, radius `--r-card`, latar `--latte`.
- Foto di bagian atas, nama serif, deskripsi 1 baris, harga, chip badge ("Best seller", "Baru").
- Satu kartu pertama berupa kartu judul besar "Makanan" berwarna hijau.

### 8.3 Motion

- Selama bergeser, tiap foto di dalam kartu bergerak parallax ke arah berlawanan (±30px), sehingga terasa berlapis.
- Kartu sedikit miring (skew ±3°) mengikuti kecepatan scroll, lalu kembali lurus saat berhenti.
- Progress bar di kanan atas menunjukkan posisi.
- Mobile: tetap horizontal pin, lebar kartu 75% layar agar kartu berikutnya terlihat mengintip.

---

## 9. Gallery

### 9.1 Perilaku

- Dua baris foto: **baris atas bergerak otomatis ke kiri, baris bawah ke kanan**, terus-menerus (infinite loop).
- **Bisa digeser sendiri**: drag dengan mouse atau swipe dengan jari. Setelah dilepas, gerakan melambat dengan inersia lalu kembali ke kecepatan otomatis.
- Hover (desktop) di satu baris: baris itu melambat.
- Kecepatan otomatis bertambah sesuai kecepatan scroll halaman, dan arahnya ikut berbalik saat pengguna scroll ke atas.
- Klik foto: membuka lightbox layar penuh dengan tombol geser kiri/kanan.

```
┌──────────────────────────────────────────────┐
│ Suasana di Brewi                              │
│ ◄◄  [foto] [foto] [foto] [foto] [foto] [fo    │  baris atas ke kiri
│   to] [foto] [foto] [foto] [foto] [foto]  ►►  │  baris bawah ke kanan
└──────────────────────────────────────────────┘
```

### 9.2 Detail visual

- Baris atas rasio 4:5, baris bawah rasio 5:4, agar ritmenya berbeda.
- Radius 20px, gap 16px.
- Tiap foto punya caption kecil di pojok bawah yang muncul saat hover (desktop) atau selalu tampil (mobile).
- Section Gallery masuk dengan menimpa Menu Makanan.

### 9.3 Implementasi

Konten tiap baris diduplikasi agar loop tidak terputus. Gerakan otomatis dan drag digabung dalam satu nilai posisi (misalnya `useMotionValue` Framer Motion atau loop `requestAnimationFrame`), lalu di-wrap dengan modulo lebar satu salinan. Alternatif siap pakai: Embla Carousel dengan plugin Auto Scroll.

---

## 10. Lokasi (multi outlet)

### 10.1 Layout

```
 Desktop                                        Mobile
┌──────────────────────────────────────────┐   ┌──────────────────────┐
│ Mampir ke Brewi                           │   │ Mampir ke Brewi      │
│ ┌──────────────┐ ┌──────────────────────┐ │   │ [Outlet A][Outlet B]►│
│ │▣ Outlet A    │ │                      │ │   │ ┌──────────────────┐ │
│ │  Buka · 23.00│ │        PETA          │ │   │ │      PETA        │ │
│ ├──────────────┤ │          📍          │ │   │ │        📍        │ │
│ │  Outlet B    │ │                      │ │   │ └──────────────────┘ │
│ ├──────────────┤ │                      │ │   │ Alamat, jam buka     │
│ │  Outlet C    │ └──────────────────────┘ │   │ [Maps] [WhatsApp]    │
│ └──────────────┘  alamat, jam, tombol     │   └──────────────────────┘
└──────────────────────────────────────────┘
```

### 10.2 Elemen

| Elemen | Detail |
|---|---|
| Daftar outlet | Desktop: kartu vertikal di kiri. Mobile: chip horizontal yang bisa digeser |
| Kartu outlet | Nama, kota, status "Buka sekarang" (hijau) atau "Tutup" (abu), jam tutup hari ini |
| Peta | Embed Google Maps atau Leaflet, berpindah ke koordinat outlet terpilih |
| Detail | Alamat lengkap, jam buka 7 hari (hari ini disorot kuning), foto outlet |
| Tombol | "Buka di Google Maps" dan "Chat outlet ini" (WhatsApp dari tabel `whatsapp_contacts`) |

Data diambil dari tabel `outlets`, `opening_hours`, dan `whatsapp_contacts` di ERD. Outlet terpilih disimpan di URL (`?outlet=slug`) supaya bisa dibagikan.

### 10.3 Motion

- Ganti outlet: indikator kuning **bergeser** dari kartu lama ke kartu baru. Peta crossfade, pin jatuh dari atas dengan pantulan kecil. Detail teks berganti dengan fade + slide 12px.
- Section masuk: kartu outlet muncul bergantian (stagger 80ms).
- Section ini menimpa Gallery (overlapping).

---

## 11. Reservasi

Untuk tahap ini dibuat sebagai **halaman biasa** di posisi paling akhir, detail akan disesuaikan lewat prompt berikutnya.

Kerangka sementara:

- Judul besar dan satu kalimat penjelasan.
- Kartu kontak WhatsApp per outlet (nama kontak, jam online, tombol "Chat via WhatsApp" dengan pesan template).
- Footer di bawahnya: logo, link sosial media, hak cipta.

Motion minimal: section menimpa Lokasi, tombol WhatsApp punya efek magnet ringan saat didekati kursor (desktop).

---

## 12. Sistem Motion Global

### 12.1 Jenis animasi

| Jenis | Dipakai di | Keterangan |
|---|---|---|
| Pin + scrub | Intro, Tentang, Menu Kopi, Menu Makanan | Animasi mengikuti posisi scroll, bukan waktu |
| Overlapping section | Semua section setelah Home | Section baru naik menimpa, sudut atas radius 40px, section lama scale 0.94 dan gelap 40% |
| Parallax | Home, Tentang, Menu | Elemen bergerak dengan kecepatan berbeda |
| Objek melayang | Home, Tentang, Menu | Biji kopi, daun, es batu, uap. Tiap objek punya kecepatan dan rotasi sendiri terhadap scroll |
| Split text | Heading semua section | Teks masuk per baris atau per kata dari balik mask |
| Text reveal | Paragraf Tentang | Warna teks terisi kata demi kata sesuai scroll |
| Marquee | Gallery, pita teks | Bergerak otomatis, dipengaruhi kecepatan dan arah scroll |
| Count up | Statistik Home, harga | Angka naik saat terlihat |
| Micro interaction | Tombol, tab, kartu | Hover, tekan, magnet |

### 12.2 Durasi dan easing

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--dur-fast` | 180ms | Hover, tekan tombol |
| `--dur-base` | 400ms | Ganti tab, ganti outlet |
| `--dur-slow` | 800ms | Masuknya heading, logo intro |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Hampir semua animasi masuk |
| `--ease-inout` | `cubic-bezier(.65,0,.35,1)` | Perpindahan besar (logo ke navbar) |
| Scrub | `scrub: 1` | Semua animasi berbasis scroll, agar ada sedikit jeda halus |

### 12.3 Pustaka yang disarankan

| Kebutuhan | Pustaka |
|---|---|
| Smooth scroll | Lenis |
| Pin, scrub, horizontal scroll | GSAP + ScrollTrigger |
| Perpindahan logo ke navbar | GSAP Flip atau Framer Motion `layoutId` |
| Animasi komponen, drag gallery | Framer Motion |
| Komponen siap pakai | React Bits |

Komponen React Bits yang cocok:

| Komponen React Bits | Dipakai di |
|---|---|
| Shiny Text / Glare Hover | Kilap cahaya logo intro |
| Split Text / Blur Text | Heading Home, nama menu |
| Scroll Reveal / Scroll Float | Paragraf Tentang |
| Scroll Stack | Kartu Tentang yang bertumpuk |
| Scroll Velocity | Pita teks berjalan |
| Count Up | Statistik Home, harga menu |
| Magnet | Tombol More info, tombol WhatsApp |

---

## 13. Responsif

| Bagian | Laptop | HP |
|---|---|---|
| Intro | Cup membesar ke scale ±14 | Cup membesar ke scale ±9, durasi pin 180vh |
| Home | Dua kolom, lingkaran di kanan | Satu kolom, lingkaran di bawah teks |
| Tentang | Teks dan foto berdampingan | Foto di atas teks, kartu tetap bertumpuk |
| Menu Kopi | Teks kiri, kapsul kanan, thumbnail di busur | Kapsul di atas, thumbnail berjajar, swipe aktif |
| Menu Makanan | Kartu 320px | Kartu 75vw |
| Gallery | Drag dengan mouse | Swipe dengan jari |
| Lokasi | Daftar kiri, peta kanan | Chip di atas, peta, lalu detail |
| Objek melayang | Semua tampil | Dikurangi setengahnya agar ringan |

Aturan tambahan: tinggi layar memakai `100svh` agar tidak loncat saat address bar HP muncul/hilang, area tap minimal 44px, dan tidak ada scroll horizontal pada `body`.

---

## 14. Performa dan Aksesibilitas

- Animasi hanya pada `transform`, `opacity`, `filter`, dan `clip-path`. Hindari animasi `width`, `height`, `top`, `left`.
- Foto dalam format WebP/AVIF, lazy load, ukuran disesuaikan (`srcset`). Foto kapsul Menu disiapkan versi 800px dan 1200px.
- Objek melayang memakai PNG/WebP transparan kecil (< 60KB) atau SVG.
- `prefers-reduced-motion`: intro diganti fade, pin horizontal diganti daftar yang bisa digeser biasa, marquee berhenti, parallax dimatikan.
- Kontras teks minimal 4.5:1 (teks espresso di atas kuning, putih di atas charcoal dan hijau).
- Semua kontrol bisa diakses keyboard, fokus terlihat jelas (outline kuning 3px).
- Target Lighthouse: Performance ≥ 85 di mobile.

---

## 15. Aset yang Perlu Disiapkan

| Aset | Format | Keterangan |
|---|---|---|
| Logo Brewi | SVG | Versi penuh (intro, Home) dan versi kecil (navbar) |
| Cup kopi intro | PNG transparan / SVG | Tampak depan, resolusi tinggi karena akan diperbesar |
| Foto menu kopi dan non-kopi | JPG/WebP, rasio 2:3 | Untuk kapsul, latar gelap seperti referensi 2 |
| Foto menu makanan | JPG/WebP, rasio 3:4 | Untuk kartu horizontal |
| Foto gallery | JPG/WebP | Minimal 14 foto (7 per baris) |
| Foto tiap outlet | JPG/WebP | Untuk kartu Lokasi |
| Objek melayang | PNG transparan | Biji kopi, daun, es batu, uap |
| Ikon sosial media | SVG | Instagram, TikTok, WhatsApp, Google Maps |

---

## 16. Keterkaitan dengan ERD

| Section | Tabel |
|---|---|
| Home | `page_sections` (hero), `menu_items` (is_signature), `site_settings` |
| Tentang | `page_sections` (page = tentang) |
| Menu Kopi / Non-Kopi | `menu_categories`, `menu_items`, `tags`, `menu_item_tags` |
| Menu Makanan | `menu_categories` (type = makanan), `menu_items` |
| Gallery | `gallery_items` |
| Lokasi | `outlets`, `opening_hours`, `whatsapp_contacts` |
| Reservasi | `whatsapp_contacts`, `page_sections` (page = reservasi) |

Catatan: karena ada tab **Non-Kopi**, kolom `menu_categories.type` di ERD sebaiknya diperluas menjadi `kopi | non_kopi | makanan`.
