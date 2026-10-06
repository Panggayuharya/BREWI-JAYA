import type { Outlet, WhatsappContact } from "@/types";

function buildWhatsappLink(number: string, template: string, vars: Record<string, string>) {
  const text = template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildContactLink(contact: WhatsappContact, outlet: Outlet) {
  return buildWhatsappLink(contact.whatsappNumber, contact.messageTemplate, {
    contact_name: contact.contactName,
    outlet_name: outlet.name,
  });
}

/** Kontak utama outlet; undefined jika tidak ada kontak aktif (tombol disembunyikan). */
export function getPrimaryContact(outlet: Outlet): WhatsappContact | undefined {
  const active = outlet.whatsappContacts.filter((c) => c.isActive);
  return active.find((c) => c.isPrimary) ?? active[0];
}
