// Halaman buku menu (flipbook /menu). Katalog menu lengkap ada di database (lihat scripts/seed-data.ts).
import type { MenuBookPage } from "@/types";

export const menuBookPages: MenuBookPage[] = [
  { src: "/menu-book/beverage.webp", alt: "Buku menu BREWi JAYA: Beverage" },
  { src: "/menu-book/food.webp", alt: "Buku menu BREWi JAYA: Food" },
  { src: "/menu-book/menu-1.webp", alt: "Buku menu BREWi JAYA: Menu lengkap" },
  { src: "/menu-book/menu-2.webp", alt: "Buku menu BREWi JAYA: Menu lengkap (varian)" },
];
