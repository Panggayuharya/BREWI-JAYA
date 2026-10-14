/** Pilihan durasi "tempat penuh" (jam). Setelah lewat, outlet otomatis tampil tersedia lagi. */
export const FULL_DURATIONS_HOURS = [1, 2, 4] as const;

/** "1 jam 35 menit" — sisa waktu sampai `until` (dibulatkan ke atas per menit). */
export function formatRemaining(until: Date, now: Date) {
  const minutes = Math.max(1, Math.ceil((until.getTime() - now.getTime()) / 60_000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h} jam`, m && `${m} menit`].filter(Boolean).join(" ");
}
