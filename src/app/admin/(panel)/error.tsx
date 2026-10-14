"use client";
import { buttonClass } from "@/components/admin/ui";

/** Error tak terduga di dashboard: tampilkan pesan umum (detail hanya di log server). */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-red-900">Terjadi kesalahan</h1>
        <p className="text-sm text-red-800">Perubahan mungkin belum tersimpan. Coba lagi, atau muat ulang halaman.</p>
      </div>
      <button type="button" onClick={reset} className={buttonClass("primary")}>
        Coba lagi
      </button>
    </div>
  );
}
