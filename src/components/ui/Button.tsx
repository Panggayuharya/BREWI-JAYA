import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

/**
 * - primary: navy + teks cream + garis aksen; hover aksen (dipakai di latar gelap maupun cream)
 * - outline-light: garis aksen di latar gelap
 * - outline-navy: garis navy di latar cream
 */
type Variant = "primary" | "outline-light" | "outline-navy";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-2.5 text-[15px] font-semibold tracking-[0.02em] transition-[color,background-color,border-color,box-shadow,scale] duration-300 ease-out-soft active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "border border-accent/50 bg-ink text-warm hover:border-accent hover:bg-accent hover:text-ink hover:shadow-[0_10px_24px_-12px_rgb(143_178_245/0.7)]",
  "outline-light": "border border-accent/60 text-warm hover:border-accent hover:bg-accent hover:text-ink",
  "outline-navy": "border border-ink/70 text-ink hover:border-accent hover:bg-accent hover:text-ink",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return <a className={buttonClass(variant, className)} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
