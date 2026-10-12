import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/** Kerangka halaman News: navbar yang sama dengan landing page + footer. */
export default function NewsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main id="konten" tabIndex={-1} className="bg-warm text-ink outline-none">{children}</main>
      <Footer />
    </>
  );
}
