import type { AboutPhoto, NavLink, PageName, PageSection, SiteSettings } from "@/types";

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
    body: "Kopi lokal pilihan, racikan barista, dan hidangan rumahan dalam satu tempat yang hangat. Pas untuk nugas, ngobrol lama, atau sekadar melepas penat.",
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

export const uiText = {
  brandWordmark: "BREWi JAYA",
  brandSubline: "Coffee & Eatery",
  introHint: "Scroll untuk mulai",
  scrollHint: "Scroll",
  menuEyebrow: "Our Menu",
  galleryTitle: "Suasana di Brewi",
  aboutSecondaryCta: "Reservasi",
  locationEyebrow: "Lokasi",
  locationTitle: "LOKASI BREWI",
  openingHours: "Jam buka",
  everyDay: "Setiap hari",
  newsEyebrow: "News",
  newsTitle: "Kabar dari Brewi",
  newsClose: "Tutup",
  menuSeeDetail: "Lihat detail menu",
  menuBookTitle: "Buku Menu",
  menuBookHint: "Ketuk halaman, geser, atau pakai tombol panah untuk membalik halaman.",
  menuBack: "Kembali ke Beranda",
  openNow: "Buka sekarang",
  closed: "Tutup",
  closesAt: "Tutup",
  openMaps: "Buka di Google Maps",
  chatOutlet: "Chat outlet ini",
  photoSoon: "Foto menyusul",
  placeDetailOpen: "Lihat cerita foto",
  copyright: "Hak cipta dilindungi.",
} as const;

export function getSiteSettings(): SiteSettings {
  return siteSettings;
}

export function getPageSection(page: PageName, key: string): PageSection | undefined {
  return pageSections.find((s) => s.page === page && s.sectionKey === key && s.isActive);
}

// Foto suasana yang bergantian di section Tentang (public/gallery & public/place).
// Tambah/ganti foto cukup di daftar ini; `title` tampil sebagai keterangan foto.
const aboutPhotos: AboutPhoto[] = [
  { title: "Tim BREWi JAYA", imageUrl: "/gallery/tim-brewi.webp" },
  { title: "Satu Shot, Penuh Rasa", imageUrl: "/gallery/espresso-shot.webp" },
  { title: "Area Indoor", imageUrl: "/place/area-indoor.webp" },
  { title: "Pelayanan di Kasir", imageUrl: "/gallery/pelayanan-kasir.webp" },
  { title: "Ruang Meeting", imageUrl: "/place/ruang-meeting.webp" },
  { title: "Ngobrol Santai", imageUrl: "/gallery/pelanggan-ngobrol.webp" },
  { title: "Suasana Pengunjung", imageUrl: "/gallery/suasana-pengunjung.webp" },
  { title: "Sofa & Rak Buku", imageUrl: "/gallery/sofa-dan-rak.webp" },
];

export function getAboutPhotos(): AboutPhoto[] {
  return aboutPhotos;
}
