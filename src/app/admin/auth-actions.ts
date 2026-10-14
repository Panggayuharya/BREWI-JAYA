"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { admins } from "@/db/schema";
import type { FormState } from "@/lib/form-state";
import { verifyPassword } from "@/server/password";
import {
  clearLoginAttempts,
  createSession,
  destroySession,
  LOCKOUT_MINUTES,
  loginLimitKeys,
  registerLoginAttempt,
} from "@/server/auth";

const loginSchema = z.object({
  email: z.email().max(254).transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(256),
});

// Pesan sama untuk email salah maupun password salah → tidak membocorkan email yang terdaftar
const INVALID: FormState = { message: "Email atau password salah." };

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return INVALID;
  const { email, password } = parsed.data;

  const limits = await loginLimitKeys(email);
  if (await registerLoginAttempt(limits)) {
    return { message: `Terlalu banyak percobaan login. Coba lagi dalam ${LOCKOUT_MINUTES} menit.` };
  }

  const [admin] = await db
    .select({ id: admins.id, passwordHash: admins.passwordHash })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  if (!(await verifyPassword(admin?.passwordHash ?? null, password)) || !admin) return INVALID;

  await clearLoginAttempts([limits[0].key]);
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
