// Tipe data mengikuti erd.md (snake_case di database, camelCase di TypeScript).

export interface SiteSettings {
  id: number;
  brandName: string;
  tagline: string;
  logoUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  email: string;
  updatedAt: string;
}

export type PageName = "home" | "tentang" | "reservasi";
export type MediaType = "image" | "video" | "lottie";

export interface PageSection {
  id: number;
  page: PageName;
  sectionKey: string;
  title: string;
  subtitle: string;
  body: string;
  mediaUrl: string;
  mediaType: MediaType;
  ctaLabel: string;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
}

export interface OpeningHour {
  id: number;
  outletId: number;
  /** 0 = Minggu ... 6 = Sabtu */
  dayOfWeek: number;
  /** Format "HH:mm" */
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export type WhatsappPurpose = "reservasi" | "umum";

export interface WhatsappContact {
  id: number;
  outletId: number;
  contactName: string;
  /** Format 62xxxxxxxxxx */
  whatsappNumber: string;
  purpose: WhatsappPurpose;
  messageTemplate: string;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
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
  isActive: boolean;
  openingHours: OpeningHour[];
  whatsappContacts: WhatsappContact[];
}

export type MenuCategoryType = "kopi" | "non_kopi" | "makanan";

export interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  type: MenuCategoryType;
  iconUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  colorHex: string;
}

export interface MenuVariant {
  id: number;
  menuItemId: number;
  groupName: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
}

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
  variants?: MenuVariant[];
}

export type GalleryCategory = "interior" | "kopi" | "makanan" | "event" | "customer";

export interface GalleryItem {
  id: number;
  outletId: number | null;
  title: string;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  category: GalleryCategory;
  width: number;
  height: number;
  isFeatured: boolean;
  sortOrder: number;
}

/** Data tampilan (bukan tabel ERD) */
export interface NavLink {
  id: string;
  label: string;
}

/** Foto suasana tempat untuk roda foto di section "Tempat Buat Lama-Lama". */
export interface PlacePhoto {
  title: string;
  imageUrl: string;
  /** Cerita singkat foto, tampil saat foto diklik */
  description: string;
}

export type NewsCategory = "promo" | "event" | "menu_baru";

export interface NewsItem {
  id: number;
  slug: string;
  category: NewsCategory;
  title: string;
  excerpt: string;
  /** Isi berita, satu string per paragraf */
  body: string[];
  imageUrl: string;
  /** true untuk foto produk transparan (cup menu) agar tidak terpotong */
  imageIsCutout: boolean;
  /** Format ISO "YYYY-MM-DD" */
  publishedAt: string;
  isActive: boolean;
}
