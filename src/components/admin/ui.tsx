// Komponen & kelas dasar dashboard admin: datar, padat, mudah dibaca. Tanpa hook → bisa dipakai di server & client.
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";
const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-warm hover:bg-deep",
  secondary: "border border-ink/15 bg-warm text-ink hover:border-ink/35",
  ghost: "text-ink/70 hover:bg-ink/6 hover:text-ink",
  danger: "text-red-700 hover:bg-red-50",
};
const buttonSizes: Record<ButtonSize, string> = {
  md: "min-h-10 px-4 text-sm",
  sm: "min-h-8 px-2.5 text-[13px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${extra}`;
}

export const inputClass =
  "block w-full rounded-lg border border-ink/15 bg-warm px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent-deep";
export const labelClass = "text-[13px] font-semibold text-ink/80";
export const hintClass = "text-xs leading-relaxed text-ink/55";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-5">
      <div className="flex max-w-2xl flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-ink">{title}</h1>
        {description && <p className="text-sm text-ink/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-ink/10 bg-warm ${className}`}>{children}</section>;
}

export function CardTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/8 px-4 py-3 sm:px-5">
      <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
      {aside}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "warn" | "muted" }) {
  const tones = {
    neutral: "bg-ink/6 text-ink/75",
    accent: "bg-accent/25 text-ink",
    warn: "bg-amber-100 text-amber-900",
    muted: "bg-ink/4 text-ink/45",
  };
  return <span className={`inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-ink/50">{children}</p>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink">
      <span aria-hidden>←</span> {children}
    </Link>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  /** Biasanya <FieldError name="…" /> */
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

/** Checkbox dengan label di kanan. */
export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 shrink-0 accent-ink" />
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {hint && <span className={hintClass}>{hint}</span>}
      </span>
    </label>
  );
}
