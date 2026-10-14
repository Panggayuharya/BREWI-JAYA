"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Status Tempat", icon: "status" },
  { href: "/admin/galeri", label: "Galeri", icon: "gallery" },
  { href: "/admin/menu", label: "Menu", icon: "menu" },
  { href: "/admin/buku-menu", label: "Buku Menu", icon: "book" },
  { href: "/admin/berita", label: "Berita", icon: "news" },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/** Navigasi dashboard: vertikal di sidebar (desktop), tab geser horizontal di HP. */
export function AdminNav({ layout }: { layout: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  const sidebar = layout === "sidebar";

  return (
    <nav aria-label="Menu admin" className={sidebar ? "flex flex-col gap-0.5" : "no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4"}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              sidebar
                ? `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-warm/10 text-warm" : "text-cream/65 hover:bg-warm/5 hover:text-warm"
                  }`
                : `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold whitespace-nowrap ${
                    active ? "bg-warm text-ink" : "text-cream/75"
                  }`
            }
          >
            {sidebar && active && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
            <Icon name={item.icon} className={sidebar ? "size-4.5" : "size-4"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
