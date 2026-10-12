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
      // Tidak ada halaman daftar News; daftar berita ada di section News pada halaman utama.
      { source: "/news", destination: "/#news", permanent: false },
    ];
  },
};

export default nextConfig;
