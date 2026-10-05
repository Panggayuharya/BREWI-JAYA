/** Gabungkan class Tailwind secara kondisional (pengganti ringan `cn` dari shadcn, tanpa dependency). */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Posisi scroll dokumen untuk sebuah elemen, tetap benar saat elemen itu (atau induknya)
 * sedang di-pin GSAP (position: fixed). Pin-spacer tetap di alur halaman, jadi posisinya
 * dipakai sebagai patokan, ditambah jarak elemen dari elemen yang di-pin.
 */
export function documentTop(el: Element) {
  const spacer = el.closest(".pin-spacer");
  const pinned = spacer?.firstElementChild;
  if (spacer && pinned) {
    return spacer.getBoundingClientRect().top + window.scrollY + (el.getBoundingClientRect().top - pinned.getBoundingClientRect().top);
  }
  return el.getBoundingClientRect().top + window.scrollY;
}
