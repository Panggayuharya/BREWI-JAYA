// Konten awal (sebelumnya statis di src/data/). Dipakai `pnpm db:seed` untuk mengisi database kosong.
// Foto memakai path di /public, jadi tidak perlu di-upload ulang ke Storage.
import type { GalleryCategory, MenuCategoryType, NewsCategory } from "@/types";

export const seedCategories: { name: string; slug: string; type: MenuCategoryType }[] = [
  { name: "Kopi", slug: "kopi", type: "kopi" },
  { name: "Non-Kopi", slug: "non-kopi", type: "non_kopi" },
  { name: "Makanan", slug: "makanan", type: "makanan" },
];

export const seedTags: { name: string; slug: string }[] = [
  { name: "Bold", slug: "bold" },
  { name: "Sweet", slug: "sweet" },
  { name: "Creamy", slug: "creamy" },
  { name: "Fruity", slug: "fruity" },
  { name: "Roasty", slug: "roasty" },
  { name: "Fresh", slug: "fresh" },
  { name: "Citrus", slug: "citrus" },
  { name: "Lokal", slug: "lokal" },
];

interface MenuSeed {
  category: string;
  name: string;
  description: string;
  basePrice: number;
  photo?: string;
  isSignature?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  tags?: string[];
}

// TODO: ganti data asli (nama menu, deskripsi, harga). Foto minuman sudah asli dari pemilik (cutout transparan).
export const seedMenu: MenuSeed[] = [
  { category: "kopi", name: "Kopi Susu Brewi", description: "Espresso, susu segar, dan gula aren dengan foam lembut di atasnya.", basePrice: 22000, isSignature: true, isBestSeller: true, tags: ["creamy", "sweet"], photo: "kopi-susu-brewi.webp" },
  { category: "kopi", name: "Lemon Cream Coffee", description: "Kopi hitam dingin, cream cheese foam, dan irisan lemon segar.", basePrice: 26000, isSignature: true, isBestSeller: true, isNew: true, tags: ["bold", "citrus"], photo: "lemon-cream-coffee.webp" },
  { category: "kopi", name: "Kopi Aren Latte", description: "Espresso di atas susu segar dengan gula aren di dasar gelas.", basePrice: 24000, tags: ["creamy", "lokal"], photo: "kopi-aren-latte.webp" },
  { category: "kopi", name: "Iced Caramel Latte", description: "Latte dingin dengan saus karamel dan espresso yang pekat.", basePrice: 27000, isNew: true, tags: ["sweet", "creamy"], photo: "iced-caramel-latte.webp" },
  { category: "non-kopi", name: "Susu Kacang Hijau", description: "Susu creamy dengan kacang hijau lembut, manis dan mengenyangkan.", basePrice: 20000, tags: ["creamy", "lokal"], photo: "susu-kacang-hijau.webp" },
  { category: "non-kopi", name: "Strawberry Milk", description: "Susu segar dengan saus stroberi buatan sendiri.", basePrice: 24000, isBestSeller: true, tags: ["fruity", "sweet"], photo: "strawberry-milk.webp" },
  { category: "non-kopi", name: "Pandan Aren Milk", description: "Susu segar, sirup pandan, dan gula aren di dasar gelas.", basePrice: 23000, isNew: true, tags: ["sweet", "lokal"], photo: "pandan-aren-milk.webp" },
  { category: "makanan", name: "Croissant Butter", description: "Renyah di luar, lembut di dalam.", basePrice: 25000, isSignature: true, isBestSeller: true },
  { category: "makanan", name: "Nasi Goreng Brewi", description: "Nasi goreng kampung dengan telur mata sapi.", basePrice: 32000, isBestSeller: true },
  { category: "makanan", name: "Roti Bakar Cokelat", description: "Roti tebal, cokelat lumer, keju parut.", basePrice: 22000 },
  { category: "makanan", name: "Kentang Goreng", description: "Kentang renyah dengan saus pilihan.", basePrice: 20000 },
  { category: "makanan", name: "Mie Nyemek", description: "Mie pedas berkuah kental ala Brewi.", basePrice: 28000, isNew: true },
  { category: "makanan", name: "Pisang Goreng Keju", description: "Pisang madu, keju, dan susu kental manis.", basePrice: 18000 },
];

export const seedMenuBook: { imageUrl: string; alt: string }[] = [
  { imageUrl: "/menu-book/beverage.webp", alt: "Buku menu BREWi JAYA: Beverage" },
  { imageUrl: "/menu-book/food.webp", alt: "Buku menu BREWi JAYA: Food" },
  { imageUrl: "/menu-book/menu-1.webp", alt: "Buku menu BREWi JAYA: Menu lengkap" },
  { imageUrl: "/menu-book/menu-2.webp", alt: "Buku menu BREWi JAYA: Menu lengkap (varian)" },
];

// Foto suasana asli dari pemilik. Potret (800×1000) tampil di baris atas, landscape (1000×800) di baris bawah.
const PORTRAIT = { width: 800, height: 1000 };
const LANDSCAPE = { width: 1000, height: 800 };
export const seedGallery: { mediaUrl: string; caption: string; category: GalleryCategory; width: number; height: number }[] = [
  { mediaUrl: "/place/area-indoor.webp", caption: "Area indoor", category: "interior", ...PORTRAIT },
  { mediaUrl: "/gallery/barista-espresso.webp", caption: "Barista menyiapkan espresso", category: "kopi", ...PORTRAIT },
  { mediaUrl: "/place/bar-espresso.webp", caption: "Espresso segar dari bar", category: "kopi", ...PORTRAIT },
  { mediaUrl: "/place/pelayanan.webp", caption: "Pelayanan ramah", category: "customer", ...PORTRAIT },
  { mediaUrl: "/gallery/espresso-shot.webp", caption: "Shot espresso di atas susu", category: "kopi", ...PORTRAIT },
  { mediaUrl: "/place/detail-lampu.webp", caption: "Detail kecil yang hangat", category: "interior", ...PORTRAIT },
  { mediaUrl: "/gallery/mesin-espresso-grinder.webp", caption: "Mesin espresso & grinder", category: "kopi", ...PORTRAIT },
  { mediaUrl: "/place/outdoor-rest-area.webp", caption: "Area outdoor", category: "interior", ...PORTRAIT },
  { mediaUrl: "/gallery/barista-di-bar.webp", caption: "Di balik bar", category: "kopi", ...PORTRAIT },
  { mediaUrl: "/place/barista-interior.webp", caption: "Barista & ruang dalam", category: "kopi", ...LANDSCAPE },
  { mediaUrl: "/place/area-rooftop.webp", caption: "Rooftop dengan pemandangan", category: "interior", ...LANDSCAPE },
  { mediaUrl: "/gallery/peresmian.webp", caption: "Peresmian BREWi JAYA", category: "event", ...LANDSCAPE },
  { mediaUrl: "/place/ruang-meeting.webp", caption: "Ngobrol lama di meja panjang", category: "customer", ...LANDSCAPE },
  { mediaUrl: "/place/pemandangan-sawah.webp", caption: "Pemandangan sawah & kereta lewat", category: "event", ...LANDSCAPE },
  { mediaUrl: "/place/tampak-depan.webp", caption: "Tampak depan BREWi JAYA", category: "event", ...LANDSCAPE },
];

interface NewsSeed {
  slug: string;
  category: NewsCategory;
  title: string;
  excerpt: string;
  body: string[];
  imageUrl: string;
  imageIsCutout: boolean;
  publishedAt: string;
}

// TODO: ganti data asli (judul, tanggal, isi, dan foto berita dari pemilik).
export const seedNews: NewsSeed[] = [
  {
    slug: "iced-caramel-latte-resmi-hadir",
    category: "menu_baru",
    title: "Iced Caramel Latte Resmi Hadir di Brewi",
    excerpt: "Espresso, susu segar, dan saus karamel buatan sendiri. Menu baru untuk yang suka manis tapi tetap ngopi.",
    body: [
      "Setelah beberapa minggu diuji coba bareng pelanggan setia, Iced Caramel Latte akhirnya masuk menu tetap BREWi JAYA.",
      "Kami memakai saus karamel yang dimasak sendiri di dapur Brewi, jadi manisnya lebih lembut dan tidak menutupi rasa espresso.",
      "Sudah bisa dipesan di semua outlet mulai hari ini. Tersedia dalam versi dingin, dan bisa minta less sugar ke barista.",
    ],
    imageUrl: "/menu/iced-caramel-latte.webp",
    imageIsCutout: true,
    publishedAt: "2026-09-20",
  },
  {
    slug: "promo-beli-2-kopi-susu",
    category: "promo",
    title: "Beli 2 Kopi Susu Brewi, Hemat Rp 8.000",
    excerpt: "Ajak teman nongkrong: setiap pembelian dua Kopi Susu Brewi dapat potongan langsung di kasir.",
    body: [
      "Kopi Susu Brewi jadi menu paling sering dipesan, jadi kami bikin alasan tambahan untuk ngajak teman mampir.",
      "Setiap pembelian dua Kopi Susu Brewi dalam satu transaksi langsung dapat potongan Rp 8.000. Tidak perlu kode promo, cukup pesan di kasir.",
      "Promo berlaku setiap Senin sampai Kamis selama bulan ini di semua outlet, selama persediaan masih ada.",
    ],
    imageUrl: "/menu/kopi-susu-brewi.webp",
    imageIsCutout: true,
    publishedAt: "2026-09-15",
  },
  {
    slug: "live-acoustic-sabtu-malam",
    category: "event",
    title: "Live Acoustic Setiap Sabtu Malam",
    excerpt: "Musik akustik pelan di rooftop, mulai pukul 19.00. Datang lebih awal kalau mau dapat meja dekat panggung.",
    body: [
      "Mulai bulan ini, rooftop BREWi JAYA diisi musik akustik setiap Sabtu malam.",
      "Musisi lokal tampil mulai pukul 19.00 sampai 21.30 dengan lagu-lagu santai yang pas buat ngobrol lama.",
      "Tidak ada biaya masuk. Untuk rombongan, sebaiknya reservasi meja dulu lewat WhatsApp outlet.",
    ],
    imageUrl: "/place/area-rooftop.webp",
    imageIsCutout: false,
    publishedAt: "2026-09-10",
  },
  {
    slug: "pandan-aren-milk-menu-non-kopi-baru",
    category: "menu_baru",
    title: "Pandan Aren Milk, Pilihan Non-Kopi yang Baru",
    excerpt: "Susu segar, sirup pandan, dan gula aren. Wangi, manisnya pas, dan cocok untuk yang tidak minum kopi.",
    body: [
      "Buat kamu yang datang tanpa niat ngopi, sekarang ada Pandan Aren Milk di daftar menu non-kopi.",
      "Perpaduan pandan dan gula aren bikin rasanya akrab, seperti jajanan manis rumahan, tapi tetap segar karena disajikan dingin.",
      "Tersedia di semua outlet mulai minggu ini.",
    ],
    imageUrl: "/menu/pandan-aren-milk.webp",
    imageIsCutout: true,
    publishedAt: "2026-09-05",
  },
  {
    slug: "workshop-manual-brew-untuk-pemula",
    category: "event",
    title: "Workshop Manual Brew untuk Pemula",
    excerpt: "Belajar seduh V60 langsung dari barista Brewi. Kuota terbatas, sudah termasuk dua cangkir kopi.",
    body: [
      "Penasaran cara menyeduh kopi yang enak di rumah? Barista Brewi akan membagikan dasar-dasar manual brew dengan V60.",
      "Materinya meliputi memilih biji kopi, takaran, suhu air, dan teknik menuang. Semua peralatan disediakan di lokasi.",
      "Kuota terbatas untuk 12 peserta. Daftar lewat WhatsApp outlet untuk mengamankan tempat.",
    ],
    imageUrl: "/place/bar-espresso.webp",
    imageIsCutout: false,
    publishedAt: "2026-08-28",
  },
  {
    slug: "diskon-pelajar-dan-mahasiswa",
    category: "promo",
    title: "Diskon 15% untuk Pelajar dan Mahasiswa",
    excerpt: "Nugas di Brewi jadi lebih hemat. Tunjukkan kartu pelajar atau KTM di kasir, berlaku setiap hari kerja.",
    body: [
      "Wi-Fi kencang dan colokan di mana-mana memang bikin Brewi jadi tempat favorit buat nugas.",
      "Sekarang pelajar dan mahasiswa dapat diskon 15% untuk semua minuman dengan menunjukkan kartu pelajar atau KTM yang masih berlaku.",
      "Berlaku Senin sampai Jumat, pukul 10.00 sampai 17.00, dan tidak bisa digabung dengan promo lain.",
    ],
    imageUrl: "/place/area-indoor.webp",
    imageIsCutout: false,
    publishedAt: "2026-08-20",
  },
];
