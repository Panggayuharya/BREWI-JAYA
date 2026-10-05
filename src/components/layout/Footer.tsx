import { getSiteSettings, uiText } from "@/data/site";
import { getSocialLinks } from "@/components/ui/SocialBar";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ManagedBy } from "@/components/ui/ManagedBy";

export function Footer() {
  const site = getSiteSettings();
  return (
    <footer className="bg-ink text-warm">
      <div className="container-brewi flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <span className="flex flex-col leading-tight">
              <span className="font-brand text-xl font-bold tracking-[0.12em]">{uiText.brandWordmark}</span>
              <span className="font-display text-small font-light text-accent italic">{uiText.brandSubline}</span>
            </span>
          </div>
          <p className="text-body text-cream/70">{site.tagline}</p>
          <ManagedBy size="md" className="mt-4" />
        </div>
        <ul className="flex flex-wrap gap-2">
          {getSocialLinks().map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center rounded-pill border border-cream/20 px-4 text-small font-semibold text-cream/85 transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="container-brewi pb-8 text-small text-cream/45">
        © {new Date().getFullYear()} {site.brandName}. {uiText.copyright}
      </p>
    </footer>
  );
}
