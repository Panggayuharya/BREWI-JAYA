import { getPageSection } from "@/data/site";
import { getReservationContacts } from "@/data/outlets";
import { buildContactLink } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";
import { Magnet } from "@/components/ui/Magnet";
import { Footer } from "@/components/layout/Footer";

/**
 * Reservasi (design.md 11) — kerangka sementara, detail menyusul dari pemilik.
 * Tanpa formulir: langsung ke WhatsApp. Jika tidak ada kontak aktif, kartu tidak tampil.
 */
export function Reservation() {
  const intro = getPageSection("reservasi", "intro");
  const contacts = getReservationContacts();

  return (
    // Dibungkus StackPanel di page.tsx: naik menimpa Lokasi dengan sudut atas membulat
    <section id="reservasi" data-nav="reservasi" data-nav-theme="light" className="relative bg-ink text-warm">
      <div data-stack-content className="bg-ink">
        <div className="container-brewi flex flex-col gap-10 pt-[calc(var(--nav-h)+3rem)] pb-24">
          <div className="flex max-w-2xl flex-col gap-5">
            <h2 className="font-display text-hero font-semibold tracking-[-0.02em] text-warm">{intro?.title}</h2>
            <p className="text-subtitle leading-relaxed text-cream/75">{intro?.subtitle}</p>
          </div>

          {contacts.length > 0 && (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contacts.map(({ outlet, contact }) => (
                <li key={contact.id} className="flex flex-col gap-5 rounded-card border border-cream/10 bg-deep p-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-small font-semibold tracking-[0.14em] text-accent uppercase">{outlet.name}</p>
                    <p className="font-display text-2xl font-semibold text-warm">{contact.contactName}</p>
                  </div>
                  <div>
                    <Magnet>
                      <ButtonLink href={buildContactLink(contact, outlet)} target="_blank" rel="noopener noreferrer" variant="outline-light">
                        {intro?.ctaLabel}
                      </ButtonLink>
                    </Magnet>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Footer />
      </div>
    </section>
  );
}
