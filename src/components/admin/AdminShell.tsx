import Link from "next/link";
import type { CurrentAdmin } from "@/server/auth";
import { logout } from "@/app/admin/auth-actions";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AdminNav } from "./AdminNav";
import { Icon } from "./icons";

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <BrandLogo size="sm" />
      <span className="flex flex-col leading-tight">
        <span className="font-brand text-sm font-bold tracking-[0.12em] text-warm">BREWi JAYA</span>
        <span className="text-[11px] font-medium tracking-wide text-accent">Dashboard admin</span>
      </span>
    </Link>
  );
}

function SessionActions({ admin, compact = false }: { admin: CurrentAdmin; compact?: boolean }) {
  return (
    <div className={compact ? "flex items-center gap-1" : "flex flex-col gap-1"}>
      {!compact && (
        <p className="truncate px-3 pb-2 text-xs text-cream/55">
          Masuk sebagai <span className="font-semibold text-cream/85">{admin.name}</span>
        </p>
      )}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/65 hover:bg-warm/5 hover:text-warm"
      >
        <Icon name="external" />
        <span className={compact ? "sr-only" : ""}>Lihat situs</span>
      </a>
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/65 hover:bg-warm/5 hover:text-warm"
        >
          <Icon name="logout" />
          <span className={compact ? "sr-only" : ""}>Keluar</span>
        </button>
      </form>
    </div>
  );
}

/** Kerangka dashboard: sidebar navy (desktop) / header + tab (HP), konten di latar cream. */
export function AdminShell({ admin, children }: { admin: CurrentAdmin; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      {/* Kolom navy setinggi halaman; isi sidebar menempel (sticky) saat konten di-scroll */}
      <div className="hidden bg-ink lg:block">
        <aside className="sticky top-0 flex h-dvh flex-col justify-between px-3 py-5">
          <div className="flex flex-col gap-8">
            <div className="px-2">
              <Brand />
            </div>
            <AdminNav layout="sidebar" />
          </div>
          <SessionActions admin={admin} />
        </aside>
      </div>

      <header className="sticky top-0 z-30 flex flex-col gap-2 bg-ink px-4 pt-3 pb-2.5 lg:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <SessionActions admin={admin} compact />
        </div>
        <AdminNav layout="tabs" />
      </header>

      <main id="konten" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 outline-none sm:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
