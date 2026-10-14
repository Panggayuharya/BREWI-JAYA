import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// 'unsafe-inline' untuk script: Next.js menyisipkan script inline (RSC payload) di halaman statis;
// CSP berbasis nonce mewajibkan semua halaman dirender dinamis.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 hanya menerima kualitas yang terdaftar; 90 dipakai MediaImage supaya foto lebih tajam
    qualities: [75, 90],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
