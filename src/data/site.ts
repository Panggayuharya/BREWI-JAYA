import type { NavLink, PageName, PageSection, PlacePhoto, SiteSettings } from "@/types";

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
    sectionKey: "place",
    title: "Tempat Buat Lama-Lama",
    // Sengaja kosong: section ini hanya menampilkan judul; cerita ada di deskripsi tiap foto (placePhotos)
    subtitle: "",
    body: "",
    mediaUrl: "",
    mediaType: "image",
    ctaLabel: "",
    ctaLink: "",
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
  locationEyebrow: "Lokasi",
  locationTitle: "LOKASI BREWI",
  openingHours: "Jam buka",
  everyDay: "Setiap hari",
  newsEyebrow: "News",
  newsTitle: "Kabar dari Brewi",
  newsSubtitle: "Promo, event, dan menu baru. Semua kabar terbaru dari BREWi JAYA ada di sini.",
  newsSeeAll: "Lihat semua berita",
  newsFilterAll: "Semua",
  newsEmpty: "Belum ada berita di kategori ini.",
  newsOther: "Berita lainnya",
  newsBack: "Kembali ke News",
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

// Foto suasana asli dari pemilik (public/gallery). Tambah/ganti foto cukup di daftar ini.
// Sebagian besar berbeda dari foto di Gallery; espresso-shot, area-indoor & ruang-meeting sengaja dipakai di keduanya.
// Maksimal 8 foto (jumlah slot StackSpread). `description` tampil di panel samping saat foto diklik.
const placePhotos: PlacePhoto[] = [
  {
    title: "Tim BREWi JAYA",
    imageUrl: "/gallery/tim-brewi.webp",
    description:
      "Orang-orang di balik bar. Barista dan kru BREWi JAYA yang menyeduh tiap cangkir, hafal pesanan langganan, dan selalu siap ngobrol soal biji kopi.",
  },
  {
    title: "Satu Shot, Penuh Rasa",
    imageUrl: "/gallery/espresso-shot.webp",
    description:
      "Espresso ditarik langsung di atas susu dingin. Setiap shot ditimbang dan diatur waktunya oleh barista, supaya rasa kopinya selalu seimbang dari gelas pertama sampai terakhir.",
  },
  {
    title: "Area Indoor",
    imageUrl: "/place/area-indoor.webp",
    description:
      "Jendela besar, cahaya alami, dan dinding kayu yang hangat. Pilih meja dekat jendela untuk kerja, menerima telepon penting, atau sekadar menikmati sore.",
  },
  {
    title: "Pelayanan di Kasir",
    imageUrl: "/gallery/pelayanan-kasir.webp",
    description:
      "Pesan, bayar, lalu duduk santai. Tim kasir siap membantu memilih menu, termasuk menyesuaikan racikan dengan selera kamu.",
  },
  {
    title: "Ruang Meeting",
    imageUrl: "/place/ruang-meeting.webp",
    description:
      "Sudut yang lebih tenang untuk diskusi serius. Meja untuk beberapa orang, kopi seduh manual di tengah meja, dan suasana yang bikin obrolan mengalir.",
  },
  {
    title: "Ngobrol Santai",
    imageUrl: "/gallery/pelanggan-ngobrol.webp",
    description:
      "Meja lega untuk ngobrol bareng teman, keluarga, atau rekan kerja. Cukup untuk rombongan kecil dan cocok untuk meeting santai.",
  },
  {
    title: "Suasana Pengunjung",
    imageUrl: "/gallery/suasana-pengunjung.webp",
    description:
      "Ramai tapi tetap nyaman. Dari kumpul komunitas sampai acara kantor, ruangan ini siap menampung momen kamu.",
  },
  {
    title: "Sofa & Rak Buku",
    imageUrl: "/gallery/sofa-dan-rak.webp",
    description:
      "Sofa dengan rak buku dan dekorasi di sekelilingnya. Sudut paling tenang untuk yang memang berniat lama-lama.",
  },
];

/** Foto latar section Tempat (digelapkan di belakang foto-foto yang menyebar). */
export const placeBackgroundImage = "/gallery/booth-brewi-jaya.webp";

export function getPlacePhotos(): PlacePhoto[] {
  return placePhotos;
}
