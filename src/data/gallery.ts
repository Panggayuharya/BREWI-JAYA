import type { GalleryCategory, GalleryItem } from "@/types";

// Foto suasana asli dari pemilik. Baris atas 4:5 (foto portrait), baris bawah 5:4 (foto landscape).
type Row = "top" | "bottom";
const photos: { src: string; caption: string; category: GalleryCategory; row: Row }[] = [
  { src: "/place/area-indoor.webp", caption: "Area indoor", category: "interior", row: "top" },
  { src: "/gallery/barista-espresso.webp", caption: "Barista menyiapkan espresso", category: "kopi", row: "top" },
  { src: "/place/bar-espresso.webp", caption: "Espresso segar dari bar", category: "kopi", row: "top" },
  { src: "/place/pelayanan.webp", caption: "Pelayanan ramah", category: "customer", row: "top" },
  { src: "/gallery/espresso-shot.webp", caption: "Shot espresso di atas susu", category: "kopi", row: "top" },
  { src: "/place/detail-lampu.webp", caption: "Detail kecil yang hangat", category: "interior", row: "top" },
  { src: "/gallery/mesin-espresso-grinder.webp", caption: "Mesin espresso & grinder", category: "kopi", row: "top" },
  { src: "/place/outdoor-rest-area.webp", caption: "Area outdoor", category: "interior", row: "top" },
  { src: "/gallery/barista-di-bar.webp", caption: "Di balik bar", category: "kopi", row: "top" },
  { src: "/place/barista-interior.webp", caption: "Barista & ruang dalam", category: "kopi", row: "bottom" },
  { src: "/place/area-rooftop.webp", caption: "Rooftop dengan pemandangan", category: "interior", row: "bottom" },
  { src: "/gallery/peresmian.webp", caption: "Peresmian BREWi JAYA", category: "event", row: "bottom" },
  { src: "/place/ruang-meeting.webp", caption: "Ngobrol lama di meja panjang", category: "customer", row: "bottom" },
  { src: "/place/pemandangan-sawah.webp", caption: "Pemandangan sawah & kereta lewat", category: "event", row: "bottom" },
  { src: "/place/tampak-depan.webp", caption: "Tampak depan BREWi JAYA", category: "event", row: "bottom" },
];

const items: (GalleryItem & { row: Row })[] = photos.map((p, i) => ({
  id: i + 1,
  outletId: null,
  title: p.caption,
  caption: p.caption,
  mediaUrl: p.src,
  mediaType: "image",
  category: p.category,
  width: p.row === "top" ? 800 : 1000,
  height: p.row === "top" ? 1000 : 800,
  isFeatured: false,
  sortOrder: i + 1,
  row: p.row,
}));

const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
const rows: [GalleryItem[], GalleryItem[]] = [sorted.filter((g) => g.row === "top"), sorted.filter((g) => g.row === "bottom")];

export function getGalleryItems(): GalleryItem[] {
  return sorted;
}

/** Dua baris untuk marquee: baris atas (4:5) dan baris bawah (5:4). */
export function getGalleryRows(): [GalleryItem[], GalleryItem[]] {
  return rows;
}
