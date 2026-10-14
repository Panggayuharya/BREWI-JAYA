/** "Kopi Susu Brewi!" → "kopi-susu-brewi" (huruf beraksen dinormalkan, maks `max` karakter). */
export function slugify(input: string, max = 100) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
