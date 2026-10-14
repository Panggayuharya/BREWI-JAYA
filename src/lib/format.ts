const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number) {
  return rupiah.format(value).replace(/\s/g, " ");
}

const longDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "2026-09-20" → "20 September 2026" */
export function formatDate(iso: string) {
  return longDate.format(new Date(`${iso}T00:00:00Z`));
}

