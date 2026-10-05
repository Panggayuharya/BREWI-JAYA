import type { NewsCategory, NewsItem } from "@/types";

export const newsCategoryLabels: Record<NewsCategory, string> = {
  promo: "Promo",
  event: "Event",
  menu_baru: "Menu Baru",
};

// TODO: ganti data asli (judul, tanggal, isi, dan foto berita dari pemilik). Foto sementara memakai asset yang sudah ada.
const news: NewsItem[] = [
  {
    id: 1,
    slug: "iced-caramel-latte-resmi-hadir",
    category: "menu_baru",
    title: "Iced Caramel Latte Resmi Hadir di Brewi",
    excerpt: "Espresso, susu segar, dan saus karamel buatan sendiri. Menu baru untuk yang suka manis tapi tetap ngopi.",
    body: [
      "Setelah beberapa minggu diuji coba bareng pelanggan setia, Iced Caramel Latte akhirnya masuk menu tetap Brewi Jaya.",
      "Kami memakai saus karamel yang dimasak sendiri di dapur Brewi, jadi manisnya lebih lembut dan tidak menutupi rasa espresso.",
      "Sudah bisa dipesan di semua outlet mulai hari ini. Tersedia dalam versi dingin, dan bisa minta less sugar ke barista.",
    ],
    imageUrl: "/menu/iced-caramel-latte.webp",
    imageIsCutout: true,
    publishedAt: "2026-09-20",
    isActive: true,
  },
  {
    id: 2,
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
    isActive: true,
  },
  {
    id: 3,
    slug: "live-acoustic-sabtu-malam",
    category: "event",
    title: "Live Acoustic Setiap Sabtu Malam",
    excerpt: "Musik akustik pelan di rooftop, mulai pukul 19.00. Datang lebih awal kalau mau dapat meja dekat panggung.",
    body: [
      "Mulai bulan ini, rooftop Brewi Jaya diisi musik akustik setiap Sabtu malam.",
      "Musisi lokal tampil mulai pukul 19.00 sampai 21.30 dengan lagu-lagu santai yang pas buat ngobrol lama.",
      "Tidak ada biaya masuk. Untuk rombongan, sebaiknya reservasi meja dulu lewat WhatsApp outlet.",
    ],
    imageUrl: "/place/area-rooftop.webp",
    imageIsCutout: false,
    publishedAt: "2026-09-10",
    isActive: true,
  },
  {
    id: 4,
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
    isActive: true,
  },
  {
    id: 5,
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
    isActive: true,
  },
  {
    id: 6,
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
    isActive: true,
  },
];

/** Semua berita aktif, terbaru lebih dulu. */
export function getNews(): NewsItem[] {
  return news.filter((n) => n.isActive).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getLatestNews(limit: number): NewsItem[] {
  return getNews().slice(0, limit);
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return getNews().find((n) => n.slug === slug);
}

/** Berita lain untuk bagian "Berita lainnya": kategori sama lebih dulu. */
export function getRelatedNews(item: NewsItem, limit: number): NewsItem[] {
  const others = getNews().filter((n) => n.id !== item.id);
  return [...others.filter((n) => n.category === item.category), ...others.filter((n) => n.category !== item.category)].slice(0, limit);
}
