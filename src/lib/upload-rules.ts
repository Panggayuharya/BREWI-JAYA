// Aturan upload gambar, dipakai bersama oleh form admin (client) dan validasi server.

/** Batas Vercel untuk body request ±4,5 MB; foto dikompres di browser dulu sebelum dikirim. */
export const MAX_UPLOAD_MB = 4;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/avif";

/** `maxSide` = sisi terpanjang (px) hasil akhir yang disimpan (WebP). */
export const IMAGE_PRESETS = {
  gallery: { folder: "gallery", maxSide: 1600 },
  menu: { folder: "menu", maxSide: 1000 },
  menuBook: { folder: "menu-book", maxSide: 2400 },
  news: { folder: "news", maxSide: 1600 },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;
