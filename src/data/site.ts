import type { NavLink, PageName, PageSection, PlacePhoto, SiteSettings } from "@/types";

// TODO: ganti data asli (logo final, link sosial media, email)
const siteSettings: SiteSettings = {
  id: 1,
  brandName: "Brewi Jaya",
  tagline: "Kopi lokal dan menu andalan untuk nongkrong.",
  logoUrl: "/brand/logo.avif", // logo juga tersedia sebagai komponen <BrandLogo />
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

/** Brewi Jaya dikelola oleh UB Coffee (logo di public/brand/ub-coffee.webp). */
export const managedBy = {
  label: "Managed by",
  name: "UB Coffee",
  logoUrl: "/brand/ub-coffee.webp",
  logoWidth: 400,
  logoHeight: 218,
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

export const ribbonWords: string[] = [
  "kopi susu gula aren",
  "manual brew",
  "buka sampai malam",
  "wi-fi kencang",
  "biji kopi lokal",
];

export const uiText = {
  brandWordmark: "BREWi JAYA",
  brandSubline: "Coffee & Eatery",
  introHint: "Scroll untuk mulai",
  menuEyebrow: "Our Menu",
  foodTitle: "Makanan",
  galleryTitle: "Suasana di Brewi",
  locationEyebrow: "Lokasi",
  locationTitle: "Mampir ke Brewi",
  openingHours: "Jam buka",
  everyDay: "Setiap hari",
  newsEyebrow: "News",
  newsTitle: "Kabar dari Brewi",
  newsSubtitle: "Promo, event, dan menu baru. Semua kabar terbaru dari Brewi Jaya ada di sini.",
  newsSeeAll: "Lihat semua berita",
  newsReadMore: "Baca selengkapnya",
  newsFilterAll: "Semua",
  newsEmpty: "Belum ada berita di kategori ini.",
  newsOther: "Berita lainnya",
  newsBack: "Kembali ke News",
  menuSeeDetail: "Lihat detail menu",
  menuSeeAll: "Lihat semua menu",
  menuBookTitle: "Buku Menu",
  menuBookHint: "Ketuk halaman, geser, atau pakai tombol panah untuk membalik halaman.",
  menuAllTitle: "Semua Menu Brewi",
  menuAllSubtitle: "Kopi, non-kopi, dan makanan. Pilih menu untuk melihat detail rasa, harga, dan cara pesan.",
  menuBack: "Kembali ke Beranda",
  menuOrder: "Pesan via WhatsApp",
  // {outlet_name} & {menu_name} diisi otomatis
  menuOrderTemplate: "Halo {outlet_name}, saya mau pesan {menu_name}. Apakah masih tersedia?",
  menuSeeLocation: "Lihat lokasi outlet",
  menuFlavor: "Rasa",
  menuCategory: "Kategori",
  menuPrice: "Harga",
  menuOther: "Menu lainnya",
  badgeSignature: "Signature",
  badgeBestSeller: "Best seller",
  badgeNew: "Baru",
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

export function getPageSections(page: PageName): PageSection[] {
  return pageSections
    .filter((s) => s.page === page && s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPageSection(page: PageName, key: string): PageSection | undefined {
  return getPageSections(page).find((s) => s.sectionKey === key);
}

// Foto suasana asli dari pemilik (public/gallery). Tambah/ganti foto cukup di daftar ini.
// Sebagian besar berbeda dari foto di Gallery; espresso-shot, area-indoor & ruang-meeting sengaja dipakai di keduanya.
// Urutan mengikuti slot StackSpread: slot 1, 2, 4, 7 lebih tinggi → foto portrait.
// `description` tampil di panel samping saat foto diklik.
const placePhotos: PlacePhoto[] = [
  {
    title: "Tim Brewi Jaya",
    imageUrl: "/gallery/tim-brewi.webp",
    description:
      "Orang-orang di balik bar. Barista dan kru Brewi Jaya yang menyeduh tiap cangkir, hafal pesanan langganan, dan selalu siap ngobrol soal biji kopi.",
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

/** Latar section Tempat. Isi `video` (mis. "/place/suasana.mp4") agar video maju-mundur mengikuti scroll. */
export const placeBackground = {
  image: "/gallery/booth-brewi-jaya.webp",
  video: "", // TODO: video suasana cafe menyusul
};

export function getPlacePhotos(): PlacePhoto[] {
  return placePhotos;
}
