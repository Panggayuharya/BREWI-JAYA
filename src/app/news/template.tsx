/**
 * Membungkus tiap halaman News dalam satu elemen yang di-mount ulang saat pindah halaman (detail ↔ daftar).
 * NewsBody mem-pin NewsHero, dan GSAP memindahkan hero ke dalam .pin-spacer; tanpa pembungkus ini
 * React gagal melepas hero dari <main> ("removeChild ... not a child of this node").
 */
export default function NewsTemplate({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
