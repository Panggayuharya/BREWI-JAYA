"use client";
import { useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { setOutletFull } from "@/app/admin/(panel)/actions";
import { useNow } from "@/hooks/useNow";
import { FULL_DURATIONS_HOURS, formatRemaining } from "@/lib/outlet-status";
import { buttonClass } from "./ui";

interface OutletStatusItem {
  slug: string;
  name: string;
  city: string;
  fullUntil: string | null;
}

function StatusButtons({ full }: { full: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-semibold text-ink/55">{full ? "Ubah durasi" : "Tandai penuh"}</span>
      {FULL_DURATIONS_HOURS.map((h) => (
        <button key={h} type="submit" name="hours" value={h} disabled={pending} className={buttonClass("secondary", "sm")}>
          {h} jam
        </button>
      ))}
      {full && (
        <button type="submit" name="hours" value="0" disabled={pending} className={buttonClass("primary", "sm", "sm:ml-auto")}>
          Sudah tersedia
        </button>
      )}
    </div>
  );
}

function OutletCard({ outlet }: { outlet: OutletStatusItem }) {
  const now = useNow();
  // Status langsung berubah saat tombol diklik (sebelum server selesai menyimpan)
  const [fullUntil, setOptimisticUntil] = useOptimistic(outlet.fullUntil);
  const until = fullUntil ? new Date(fullUntil) : null;
  // Sebelum jam browser terbaca (render server), percayai data server
  const full = until !== null && (now === null || until > now);

  async function submit(formData: FormData) {
    const hours = Number(formData.get("hours"));
    setOptimisticUntil(hours ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : null);
    await setOutletFull(formData);
  }

  return (
    <li
      className={`flex flex-col gap-4 rounded-xl border p-4 transition-colors duration-300 sm:p-5 ${
        full ? "border-amber-300 bg-amber-50" : "border-ink/10 bg-warm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{outlet.name}</p>
          <p className="text-xs text-ink/55">{outlet.city}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${
            full ? "bg-amber-200 text-amber-950" : "bg-emerald-100 text-emerald-900"
          }`}
        >
          <span aria-hidden className={`size-1.5 rounded-full ${full ? "bg-amber-700" : "bg-emerald-600"}`} />
          {full ? "Penuh" : "Tersedia"}
        </span>
      </div>
      <p className="min-h-5 text-sm text-ink/70" aria-live="polite">
        {full
          ? until && now && `Otomatis tersedia lagi dalam ${formatRemaining(until, now)}.`
          : "Pengunjung melihat outlet ini tersedia."}
      </p>
      <form action={submit}>
        <input type="hidden" name="slug" value={outlet.slug} />
        <StatusButtons full={full} />
      </form>
    </li>
  );
}

export function OutletStatusBoard({ outlets }: { outlets: OutletStatusItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {outlets.map((o) => (
        <OutletCard key={o.slug} outlet={o} />
      ))}
    </ul>
  );
}
