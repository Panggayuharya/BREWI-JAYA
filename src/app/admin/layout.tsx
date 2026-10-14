import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard Admin — BREWi JAYA", template: "%s · Admin BREWi JAYA" },
  robots: { index: false, follow: false },
};

/** Semua halaman /admin: latar terang & teks navy (situs publik memakai latar navy). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-cream text-ink">{children}</div>;
}
