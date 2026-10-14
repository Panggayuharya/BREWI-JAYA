"use server";
import { z } from "zod";
import { db } from "@/db";
import { outletStatus } from "@/db/schema";
import { getOutlets } from "@/data/outlets";
import { FULL_DURATIONS_HOURS } from "@/lib/outlet-status";
import { requireAdmin } from "@/server/auth";
import { revalidateSite } from "@/server/admin-utils";

const statusSchema = z.object({
  slug: z.string().refine((slug) => getOutlets().some((o) => o.slug === slug), "Outlet tidak dikenal."),
  // 0 = tersedia lagi; selain itu hanya durasi yang disediakan
  hours: z.coerce.number().refine((h) => h === 0 || (FULL_DURATIONS_HOURS as readonly number[]).includes(h)),
});

/** Tandai outlet penuh selama N jam, atau tersedia lagi (hours = 0). */
export async function setOutletFull(formData: FormData) {
  const admin = await requireAdmin();
  const { slug, hours } = statusSchema.parse({ slug: formData.get("slug"), hours: formData.get("hours") });
  const fullUntil = hours === 0 ? null : new Date(Date.now() + hours * 60 * 60 * 1000);

  await db
    .insert(outletStatus)
    .values({ outletSlug: slug, fullUntil, updatedBy: admin.id })
    .onConflictDoUpdate({
      target: outletStatus.outletSlug,
      set: { fullUntil, updatedBy: admin.id, updatedAt: new Date() },
    });
  revalidateSite();
}
