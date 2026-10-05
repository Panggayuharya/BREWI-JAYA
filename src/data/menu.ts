import type { MenuCategory, MenuCategoryType, MenuItem, Tag } from "@/types";

const categories: MenuCategory[] = [
  { id: 1, name: "Kopi", slug: "kopi", type: "kopi", iconUrl: "", sortOrder: 1, isActive: true },
  { id: 2, name: "Non-Kopi", slug: "non-kopi", type: "non_kopi", iconUrl: "", sortOrder: 2, isActive: true },
  { id: 3, name: "Makanan", slug: "makanan", type: "makanan", iconUrl: "", sortOrder: 3, isActive: true },
];

const tags: Record<string, Tag> = {
  bold: { id: 1, name: "Bold", slug: "bold", colorHex: "#3A1F14" },
  sweet: { id: 2, name: "Sweet", slug: "sweet", colorHex: "#3A1F14" },
  creamy: { id: 3, name: "Creamy", slug: "creamy", colorHex: "#3A1F14" },
  fruity: { id: 4, name: "Fruity", slug: "fruity", colorHex: "#3A1F14" },
  roasty: { id: 5, name: "Roasty", slug: "roasty", colorHex: "#3A1F14" },
  fresh: { id: 6, name: "Fresh", slug: "fresh", colorHex: "#3A1F14" },
  citrus: { id: 7, name: "Citrus", slug: "citrus", colorHex: "#3A1F14" },
  local: { id: 8, name: "Lokal", slug: "lokal", colorHex: "#3A1F14" },
};

type ItemSeed = Pick<MenuItem, "name" | "description" | "basePrice"> &
  Partial<Pick<MenuItem, "isSignature" | "isBestSeller" | "isNew">> & {
    tagKeys?: string[];
    /** Nama file foto di public/menu (PNG/WebP transparan) */
    photo?: string;
  };

function seed(categoryId: number, startId: number, list: ItemSeed[]): MenuItem[] {
  return list.map((it, i) => ({
    id: startId + i,
    categoryId,
    name: it.name,
    slug: it.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: it.description,
    basePrice: it.basePrice,
    imageUrl: it.photo ? `/menu/${it.photo}` : "", // TODO: foto makanan menyusul
    imageCutoutUrl: it.photo ? `/menu/${it.photo}` : undefined,
    isSignature: it.isSignature ?? false,
    isBestSeller: it.isBestSeller ?? false,
    isNew: it.isNew ?? false,
    isAvailable: true,
    sortOrder: i + 1,
    tags: (it.tagKeys ?? []).map((k) => tags[k]),
  }));
}

// TODO: ganti data asli (nama menu, deskripsi, harga). Foto minuman sudah asli dari pemilik.
const items: MenuItem[] = [
  ...seed(1, 1, [
    { name: "Kopi Susu Brewi", description: "Espresso, susu segar, dan gula aren dengan foam lembut di atasnya.", basePrice: 22000, isSignature: true, isBestSeller: true, tagKeys: ["creamy", "sweet"], photo: "kopi-susu-brewi.webp" },
    { name: "Lemon Cream Coffee", description: "Kopi hitam dingin, cream cheese foam, dan irisan lemon segar.", basePrice: 26000, isSignature: true, isBestSeller: true, isNew: true, tagKeys: ["bold", "citrus"], photo: "lemon-cream-coffee.webp" },
    { name: "Kopi Aren Latte", description: "Espresso di atas susu segar dengan gula aren di dasar gelas.", basePrice: 24000, tagKeys: ["creamy", "local"], photo: "kopi-aren-latte.webp" },
    { name: "Iced Caramel Latte", description: "Latte dingin dengan saus karamel dan espresso yang pekat.", basePrice: 27000, isNew: true, tagKeys: ["sweet", "creamy"], photo: "iced-caramel-latte.webp" },
  ]),
  ...seed(2, 101, [
    { name: "Susu Kacang Hijau", description: "Susu creamy dengan kacang hijau lembut, manis dan mengenyangkan.", basePrice: 20000, tagKeys: ["creamy", "local"], photo: "susu-kacang-hijau.webp" },
    { name: "Strawberry Milk", description: "Susu segar dengan saus stroberi buatan sendiri.", basePrice: 24000, isBestSeller: true, tagKeys: ["fruity", "sweet"], photo: "strawberry-milk.webp" },
    { name: "Pandan Aren Milk", description: "Susu segar, sirup pandan, dan gula aren di dasar gelas.", basePrice: 23000, isNew: true, tagKeys: ["sweet", "local"], photo: "pandan-aren-milk.webp" },
  ]),
  ...seed(3, 201, [
    { name: "Croissant Butter", description: "Renyah di luar, lembut di dalam.", basePrice: 25000, isSignature: true, isBestSeller: true },
    { name: "Nasi Goreng Brewi", description: "Nasi goreng kampung dengan telur mata sapi.", basePrice: 32000, isBestSeller: true },
    { name: "Roti Bakar Cokelat", description: "Roti tebal, cokelat lumer, keju parut.", basePrice: 22000 },
    { name: "Kentang Goreng", description: "Kentang renyah dengan saus pilihan.", basePrice: 20000 },
    { name: "Mie Nyemek", description: "Mie pedas berkuah kental ala Brewi.", basePrice: 28000, isNew: true },
    { name: "Pisang Goreng Keju", description: "Pisang madu, keju, dan susu kental manis.", basePrice: 18000 },
  ]),
];

/** Halaman buku menu cetak (flipbook di halaman menu). File di public/menu-book, rasio A4 mendatar. */
export const menuBookPages: { src: string; alt: string }[] = [
  { src: "/menu-book/beverage.webp", alt: "Buku menu Brewi Jaya: Beverage" },
  { src: "/menu-book/food.webp", alt: "Buku menu Brewi Jaya: Food" },
  { src: "/menu-book/menu-1.webp", alt: "Buku menu Brewi Jaya: Menu lengkap" },
  { src: "/menu-book/menu-2.webp", alt: "Buku menu Brewi Jaya: Menu lengkap (varian)" },
];

export function getMenuCategories(): MenuCategory[] {
  return categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryById(id: number): MenuCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function getMenuByType(type: MenuCategoryType): MenuItem[] {
  const ids = categories.filter((c) => c.type === type && c.isActive).map((c) => c.id);
  return items
    .filter((it) => ids.includes(it.categoryId) && it.isAvailable)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSignatureItems(): MenuItem[] {
  return items.filter((it) => it.isSignature && it.isAvailable);
}

/** Semua menu yang tersedia (untuk halaman detail /menu/[slug]). */
export function getMenuItems(): MenuItem[] {
  return items.filter((it) => it.isAvailable);
}
