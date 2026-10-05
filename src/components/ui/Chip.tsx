const tones = {
  default: "border border-cream/15 bg-cream/5 text-warm",
  accent: "bg-accent text-ink",
  light: "bg-warm text-ink",
} as const;

export function Chip({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] shadow-[0_4px_12px_-6px_rgb(7_19_49/0.4)] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
