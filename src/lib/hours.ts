import type { OpeningHour } from "@/types";
import { uiText } from "@/data/site";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getTodayHours(hours: OpeningHour[], date = new Date()) {
  return hours.find((h) => h.dayOfWeek === date.getDay());
}

export function isOpenNow(hours: OpeningHour[], date = new Date()) {
  const today = getTodayHours(hours, date);
  if (!today || today.isClosed) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  const open = toMinutes(today.openTime);
  const close = toMinutes(today.closeTime);
  // mendukung jam tutup lewat tengah malam
  return close > open ? now >= open && now < close : now >= open || now < close;
}

function sortByWeekFromMonday(hours: OpeningHour[]) {
  return [...hours].sort((a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7));
}

/**
 * Ringkas jam buka seminggu (mulai Senin) jadi rentang hari berjam sama,
 * mis. [{ days: "Senin – Jumat", hours: "07:00 – 17:00" }, { days: "Sabtu – Minggu", hours: null }].
 * `hours` null = tutup.
 */
export function groupHoursByDays(hours: OpeningHour[]) {
  const groups: { days: string; hours: string | null; dayOfWeeks: number[] }[] = [];
  for (const h of sortByWeekFromMonday(hours)) {
    const value = h.isClosed ? null : `${h.openTime} – ${h.closeTime}`;
    const last = groups.at(-1);
    if (last && last.hours === value) last.dayOfWeeks.push(h.dayOfWeek);
    else groups.push({ days: "", hours: value, dayOfWeeks: [h.dayOfWeek] });
  }
  for (const g of groups) {
    const first = DAY_NAMES[g.dayOfWeeks[0]];
    const last = DAY_NAMES[g.dayOfWeeks[g.dayOfWeeks.length - 1]];
    g.days = g.dayOfWeeks.length === 7 ? uiText.everyDay : g.dayOfWeeks.length === 1 ? first : `${first} – ${last}`;
  }
  return groups;
}
