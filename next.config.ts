import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Halaman detail per menu (/menu/[slug]) sudah dihapus; tautan lama diarahkan ke buku menu (flipbook).
  async redirects() {
    // Slug tanpa titik saja, supaya file gambar di public/menu/*.webp tidak ikut teralihkan.
    return [
      { source: "/menu/:slug([^./]+)", destination: "/menu", permanent: true },
      // Halaman News terpisah sudah dihapus; berita cukup di section News pada halaman utama.
      { source: "/news", destination: "/#news", permanent: true },
      { source: "/news/:slug([^./]+)", destination: "/#news", permanent: true },
    ];
  },
};

export default nextConfig;
