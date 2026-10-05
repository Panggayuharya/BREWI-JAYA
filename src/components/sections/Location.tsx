"use client";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Outlet } from "@/types";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { getOutlets } from "@/data/outlets";
import { uiText } from "@/data/site";
import { getTodayHours, groupHoursByDays, isOpenNow } from "@/lib/hours";
import { buildContactLink, getPrimaryContact } from "@/lib/whatsapp";
import { useNow } from "@/hooks/useNow";
import { ButtonLink } from "@/components/ui/Button";
import { JellyTabs } from "@/components/ui/JellyTabs";
import { Reveal } from "@/components/motion/Reveal";

const URL_EVENT = "brewi:outlet";

/** Outlet terpilih disimpan di URL (?outlet=slug) agar bisa dibagikan. */
function useSelectedOutlet(outlets: Outlet[]) {
  const slug = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      window.addEventListener(URL_EVENT, onChange);
      return () => {
        window.removeEventListener("popstate", onChange);
        window.removeEventListener(URL_EVENT, onChange);
      };
    },
    () => new URLSearchParams(window.location.search).get("outlet"),
    () => null,
  );
  const select = useCallback((next: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("outlet", next);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(URL_EVENT));
  }, []);
  const selected = outlets.find((o) => o.slug === slug) ?? outlets[0];
  return [selected, select] as const;
}

/**
 * Lokasi (design.md 10): header seperti section lain, pilihan outlet di atas peta,
 * lalu peta + kartu info ringkas (status, alamat, jam buka per rentang hari, tombol).
 */
export function Location() {
  const ref = useRef<HTMLElement>(null);
  const outlets = getOutlets();
  const [outlet, select] = useSelectedOutlet(outlets);
  const now = useNow();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        gsap.from("[data-outlet-tabs]", {
          opacity: 0,
          y: 16,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: ref },
  );

  if (!outlet) return null;

  const contact = getPrimaryContact(outlet);
  const open = now ? isOpenNow(outlet.openingHours, now) : null;
  const closeTime = now ? getTodayHours(outlet.openingHours, now)?.closeTime : undefined;

  return (
    // Dibungkus StackPanel di page.tsx: naik menimpa News dengan sudut atas membulat
    <section ref={ref} id="lokasi" data-nav="lokasi" data-nav-theme="cream" className="relative bg-cream text-ink">
      <div data-stack-content className="relative bg-cream">
        {/* Peralihan halus dari section biru di atasnya */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-navy-soft/8 to-transparent" />
        <div className="container-brewi flex flex-col gap-8 pt-[calc(var(--nav-h)+2.5rem)] pb-28 lg:gap-10">
          <Reveal className="flex flex-col gap-4">
            <p className="eyebrow text-coffee">{uiText.locationEyebrow}</p>
            <h2 className="font-display text-section font-semibold tracking-[-0.02em]">{uiText.locationTitle}</h2>
          </Reveal>

          <div className="flex flex-col gap-4">
            {/* Pilihan outlet: di atas peta, efek jelly saat diklik, bisa digeser di HP */}
            <div data-outlet-tabs className="no-scrollbar -mx-(--container-pad) overflow-x-auto px-(--container-pad)">
              <JellyTabs
                ariaLabel="Pilih outlet"
                surface="light"
                items={outlets.map((o) => ({ value: o.slug, label: o.name }))}
                value={outlet.slug}
                onChange={select}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
              <div className="relative aspect-4/3 overflow-hidden rounded-card border border-ink/8 bg-warm shadow-soft sm:aspect-video lg:col-span-8 lg:aspect-auto lg:min-h-105">
                <AnimatePresence mode="wait">
                  <motion.iframe
                    key={outlet.id}
                    title={`Peta ${outlet.name}`}
                    src={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}&z=16&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={outlet.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5 rounded-card border border-ink/8 bg-warm p-5 shadow-soft sm:p-6 lg:col-span-4"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-2xl font-semibold text-ink">{outlet.name}</h3>
                    {open !== null && (
                      <span
                        className={`inline-flex items-center gap-2 text-small font-semibold ${open ? "text-coffee" : "text-ink/50"}`}
                      >
                        <span aria-hidden className={`size-1.5 rounded-full ${open ? "bg-accent" : "bg-ink/30"}`} />
                        {open ? `${uiText.openNow} · ${uiText.closesAt} ${closeTime ?? ""}` : uiText.closed}
                      </span>
                    )}
                    <p className="text-small leading-relaxed text-ink/75">
                      {outlet.address}, {outlet.city}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-ink/8 pt-4">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-ink/50 uppercase">{uiText.openingHours}</p>
                    <dl className="flex flex-col gap-1 text-[13px] text-ink/75">
                      {groupHoursByDays(outlet.openingHours).map((g) => {
                        const today = now !== null && g.dayOfWeeks.includes(now.getDay());
                        return (
                          <div key={g.days} className={`flex justify-between gap-4 ${today ? "font-semibold text-ink" : ""}`}>
                            <dt>{g.days}</dt>
                            <dd className="tabular-nums">{g.hours ?? uiText.closed}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3">
                    {contact && (
                      <ButtonLink href={buildContactLink(contact, outlet)} target="_blank" rel="noopener noreferrer" variant="primary">
                        {uiText.chatOutlet}
                      </ButtonLink>
                    )}
                    <ButtonLink href={outlet.gmapsUrl} target="_blank" rel="noopener noreferrer" variant="outline-navy">
                      {uiText.openMaps}
                    </ButtonLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
