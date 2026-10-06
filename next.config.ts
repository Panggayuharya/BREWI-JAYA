import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Halaman detail per menu (/menu/[slug]) sudah dihapus; tautan lama diarahkan ke buku menu (flipbook).
  async redirects() {
    return [{ source: "/menu/:slug", destination: "/menu", permanent: true }];
  },
};

export default nextConfig;
