const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number) {
  return rupiah.format(value).replace(/\s/g, " ");
}

export function padIndex(n: number) {
  return String(n).padStart(2, "0");
}

const longDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "2026-09-20" → "20 September 2026" */
export function formatDate(iso: string) {
  return longDate.format(new Date(`${iso}T00:00:00Z`));
}

/** Membagi nama menu jadi dua baris: "Kopi Susu Brewi" → ["Kopi Susu", "Brewi"]. */
export function splitName(name: string): [string, string] {
  const words = name.split(" ");
  if (words.length === 1) return [name, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
