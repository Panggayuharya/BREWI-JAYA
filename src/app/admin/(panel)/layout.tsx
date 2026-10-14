import { requireAdmin } from "@/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";

/** Semua halaman dashboard (kecuali /admin/login). Tiap halaman & action tetap memanggil requireAdmin sendiri. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
