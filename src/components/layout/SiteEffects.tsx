"use client";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { PhotoTintToggle } from "@/components/motion/PhotoTintToggle";
import { useIsAdminRoute } from "@/hooks/useIsAdminRoute";

/** Efek khusus situs publik (smooth scroll Lenis + tint foto). Dashboard /admin memakai scroll bawaan browser. */
export function SiteEffects({ children }: { children: React.ReactNode }) {
  if (useIsAdminRoute()) return children;
  return (
    <>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
      <PhotoTintToggle />
    </>
  );
}
