import type { NavLink, PageName, PageSection, SiteSettings } from "@/types";

// TODO: ganti data asli (logo final, link sosial media, email)
const siteSettings: SiteSettings = {
  id: 1,
  brandName: "BREWi JAYA",
  tagline: "Kopi lokal dan menu andalan untuk nongkrong.",
  logoUrl: "/brand/logo.avif", // versi gambar; di halaman logo digambar sebagai SVG oleh <BrandLogo />
  instagramUrl: "https://instagram.com/",
  tiktokUrl: "https://tiktok.com/",
  email: "halo@brewijaya.id",
  updatedAt: "2026-09-24T00:00:00Z",
};

const pageSections: PageSection[] = [
  {
    id: 1,
    page: "home",
    sectionKey: "hero",
    title: "BREWi JAYA",
    subtitle: "Coffee & Eatery",
    // Deskripsi di bawah judul Home
    body: "-",
    mediaUrl: "", // foto latar Home: lihat heroBackdrop
    mediaType: "image",
    ctaLabel: "More info",
    ctaLink: "#tentang",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 4,
    page: "tentang",
    sectionKey: "about",
    subtitle: "",
    title: "Tempat Buat Lama-Lama",
    // TODO: sesuaikan dengan cerita asli dari pemilik
    body: "BREWi JAYA adalah rumah untuk kopi lokal pilihan yang diseduh barista kami, hidangan rumahan, dan ruang yang hangat. Datang untuk kerja, ngobrol bareng teman, atau sekadar melepas penat. Sekali mampir, biasanya betah lama-lama.",
    mediaUrl: "",
    mediaType: "image",
    ctaLabel: "Lihat Menu",
    ctaLink: "#menu",
    sortOrder: 2,
    isActive: true,
  },
  // TODO: ganti data asli (konten Reservasi menyusul dari pemilik)
  {
    id: 5,
    page: "reservasi",
    sectionKey: "intro",
    title: "Reservasi Tempat",
    subtitle: "Pilih outlet, lalu chat admin kami lewat WhatsApp. Tanpa formulir, langsung ngobrol.",
    body: "",
    mediaUrl: "",
    mediaType: "image",
    ctaLabel: "Chat via WhatsApp",
    ctaLink: "",
    sortOrder: 1,
    isActive: true,
  },
];

/** Latar Home: tiga foto yang dibaurkan (tengah = foto utama; kiri & kanan = pendamping, hanya desktop). */
export const heroBackdrop = {
  center: "/place/hero-tim.webp",
  left: "/place/hero-espresso.webp",
  right: "/place/hero-barista.webp",
};

export const navLinks: NavLink[] = [
  { id: "home", label: "Home" },
  { id: "tentang", label: "Tentang" },
  { id: "menu", label: "Menu" },
  { id: "gallery", label: "Gallery" },
  { id: "news", label: "News" },
  { id: "lokasi", label: "Lokasi" },
  { id: "reservasi", label: "Reservasi" },
];

/**
 * Section Menu di beranda: hanya informasi singkat (menu lengkap ada di buku menu /menu).
 * `drink` = foto cup transparan (PNG/WebP tanpa latar) di folder public.
 */
export const menuShowcase = {
  title: "Kopi & Makanan Brewi",
  description:
    "Dari kopi susu gula aren sampai makanan hangat untuk teman nongkrong. Semua dibuat segar setiap hari dengan bahan pilihan.",
  bigWord: "MENU",
  drink: "/menu/kopi-susu-brewi.webp",
  highlights: [
    {
      title: "Kopi & Non-Kopi",
      text: "Biji kopi lokal yang di-roasting dengan teliti lalu diseduh langsung oleh barista kami, dari espresso yang pekat sampai kopi susu gula aren yang lembut. Untuk yang ingin tanpa kafein, ada perpaduan susu segar, buah, dan pandan yang ringan dan menyegarkan.",
    },
    {
      title: "Makanan Hangat",
      text: "Mulai dari camilan renyah sampai makanan berat yang mengenyangkan. Dimasak saat dipesan, pas untuk menemani ngopi, kerja, atau ngobrol bersama teman.",
    },
  ],
  /** Tombol ajakan di bawah deskripsi section Menu → buku menu (flipbook) di /menu */
  cta: {
    title: "Lihat detail menu",
    text: "Buka buku menu lengkap beserta harga",
  },
};

export const uiText = {
  brandWordmark: "BREWi JAYA",
  brandSubline: "Coffee & Eatery",
  introHint: "Scroll untuk mulai",
  scrollHint: "Scroll",
  menuEyebrow: "Our Menu",
  galleryTitle: "Suasana di Brewi",
  locationEyebrow: "Lokasi",
  locationTitle: "LOKASI BREWI",
  openingHours: "Jam buka",
  everyDay: "Setiap hari",
  newsEyebrow: "News",
  newsTitle: "Kabar dari Brewi",
  newsOther: "Berita lainnya",
  newsBack: "Kembali ke beranda",
  menuBookTitle: "Buku Menu",
  menuBookHint: "Ketuk halaman, geser, atau pakai tombol panah untuk membalik halaman.",
  menuBack: "Kembali ke Beranda",
  openNow: "Buka sekarang",
  closed: "Tutup",
  closesAt: "Tutup",
  openMaps: "Buka di Google Maps",
  chatOutlet: "Chat outlet ini",
  photoSoon: "Foto menyusul",
  placeFull: "Tempat sedang penuh",
  placeDetailOpen: "Lihat cerita foto",
  copyright: "Hak cipta dilindungi.",
} as const;

export function getSiteSettings(): SiteSettings {
  return siteSettings;
}

export function getPageSection(page: PageName, key: string): PageSection | undefined {
  return pageSections.find((s) => s.page === page && s.sectionKey === key && s.isActive);
}

/**
 * Isi section Tentang di luar judul & deskripsi utama (yang ada di pageSections "tentang/about").
 * Foto diambil dari public/gallery & public/place.
 * TODO: angka di `stats` dan `footnotes` masih contoh, sesuaikan dengan data asli dari pemilik.
 */
export const aboutContent = {
  eyebrow: "Tentang BREWi JAYA",
  stats: [
    { value: "20+", label: "Pilihan menu kopi & makanan" },
    { value: "4.8", label: "Rating ulasan Google*" },
    { value: "7", label: "Hari buka dalam seminggu" },
    { value: "100%", label: "Biji kopi lokal" },
  ],
  /**
   * Kolase foto tengah: atas & bawah (mendatar, di depan), tengah (tegak, di belakang) + kartu biru.
   * Tiap slot berganti foto bergiliran; tambah/ganti foto cukup di daftar slot masing-masing.
   */
  collage: {
    top: [
      { title: "Area Indoor", imageUrl: "/place/area-indoor.webp" },
      { title: "Area Rooftop", imageUrl: "/place/area-rooftop.webp" },
      { title: "Tampak Depan", imageUrl: "/place/tampak-depan.webp" },
    ],
    middle: [
      { title: "Barista di Bar", imageUrl: "/gallery/barista-di-bar.webp" },
      { title: "Tim BREWi JAYA", imageUrl: "/gallery/tim-brewi.webp" },
      { title: "Pelayanan di Kasir", imageUrl: "/gallery/pelayanan-kasir.webp" },
    ],
    bottom: [
      { title: "Ngobrol Santai", imageUrl: "/gallery/pelanggan-ngobrol.webp" },
      { title: "Ruang Meeting", imageUrl: "/place/ruang-meeting.webp" },
      { title: "Sofa & Rak Buku", imageUrl: "/gallery/sofa-dan-rak.webp" },
    ],
    badge: "Diseduh dengan sepenuh hati",
  },
  side: {
    title: "Rasa Lokal, Suasana Hangat, Pelayanan Sepenuh Hati",
    body: "Setiap cangkir diseduh dari biji kopi lokal pilihan, disajikan bersama hidangan rumahan di ruang yang nyaman untuk siapa saja.",
    points: ["Kopi lokal pilihan", "Ruang nyaman & luas", "Hidangan rumahan", "Cocok untuk kerja & kumpul"],
    footnotes: ["* Berdasarkan ulasan pengunjung di Google Maps", "* Buka setiap hari, cek jam buka di section Lokasi"],
  },
  banner: {
    eyebrow: "Suasana BREWi",
    title: "Tempat ngopi yang bikin betah",
    body: "Dari pagi yang tenang sampai malam yang ramai, selalu ada sudut yang pas untuk menikmati kopi bersama orang terdekat.",
    ctaLabel: "Reservasi Tempat",
    ctaLink: "#reservasi",
    imageUrl: "/place/area-rooftop.webp",
  },
  why: {
    eyebrow: "Kenapa BREWi",
    title: "Tempat yang Pas untuk Ngopi, Kerja, dan Kumpul",
    photos: [
      { title: "Espresso Shot", imageUrl: "/gallery/espresso-shot.webp" },
      { title: "Suasana Pengunjung", imageUrl: "/gallery/suasana-pengunjung.webp" },
    ],
    /** Kartu putih kecil di atas kolase foto */
    cardItems: [
      { title: "Kopi Lokal", text: "Diseduh barista kami setiap hari." },
      { title: "Ruang Nyaman", text: "Indoor, rooftop, dan ruang meeting." },
    ],
    features: [
      {
        icon: "coffee",
        title: "Racikan barista",
        text: "Espresso sampai kopi susu gula aren, diseduh langsung saat dipesan.",
      },
      {
        icon: "space",
        title: "Ruang untuk semua",
        text: "Area indoor yang tenang, rooftop yang santai, dan ruang meeting untuk kerja tim.",
      },
      {
        icon: "people",
        title: "Pelayanan ramah",
        text: "Tim kami siap membantu, dari memilih menu sampai menyiapkan tempat reservasi.",
      },
    ],
  },
} as const;
