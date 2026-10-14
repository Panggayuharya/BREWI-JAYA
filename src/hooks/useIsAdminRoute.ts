"use client";
import { usePathname } from "next/navigation";

/** true di halaman /admin: dashboard tidak memakai efek situs publik (Lenis, tint foto, transisi halaman). */
export function useIsAdminRoute() {
  return usePathname()?.startsWith("/admin") ?? false;
}
