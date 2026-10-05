import { getSiteSettings } from "@/data/site";
import { getOutlets } from "@/data/outlets";
import { buildContactLink, getPrimaryContact } from "@/lib/whatsapp";

interface SocialLink {
  label: string;
  short: string;
  href: string;
}

export function getSocialLinks(): SocialLink[] {
  const site = getSiteSettings();
  const outlet = getOutlets()[0];
  const contact = outlet ? getPrimaryContact(outlet) : undefined;
  const links: SocialLink[] = [
    { label: "Instagram", short: "ig", href: site.instagramUrl },
    { label: "TikTok", short: "tt", href: site.tiktokUrl },
  ];
  if (outlet && contact) links.push({ label: "WhatsApp", short: "wa", href: buildContactLink(contact, outlet) });
  if (outlet) links.push({ label: "Google Maps", short: "map", href: outlet.gmapsUrl });
  return links;
}

/** Bar vertikal di tepi kanan Home (desktop). Ikon SVG menyusul. */
export function SocialBar({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-col gap-1 rounded-l-card bg-deep p-1.5 shadow-lift ${className}`}>
      {getSocialLinks().map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex size-11 items-center justify-center rounded-pill text-small font-bold uppercase text-warm transition-colors hover:bg-accent/20"
          >
            {/* TODO: ganti dengan ikon SVG */}
            {s.short}
          </a>
        </li>
      ))}
    </ul>
  );
}
