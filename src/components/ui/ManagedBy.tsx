import Image from "next/image";
import { managedBy } from "@/data/site";

const sizes = {
  sm: { h: 34, text: "text-[12px]" },
  md: { h: 48, text: "text-small" },
} as const;

/** "Managed by" + logo UB Coffee. Logo berlatar transparan dengan garis putih, aman di latar gelap & terang. */
export function ManagedBy({ size = "sm", className = "" }: { size?: keyof typeof sizes; className?: string }) {
  const { h, text } = sizes[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`font-semibold tracking-[0.2em] uppercase opacity-60 ${text}`}>{managedBy.label}</span>
      <Image
        src={managedBy.logoUrl}
        alt={managedBy.name}
        width={managedBy.logoWidth}
        height={managedBy.logoHeight}
        style={{ height: h, width: "auto" }}
        className="drop-shadow-[0_4px_10px_rgb(7_19_49/0.25)]"
      />
    </div>
  );
}
