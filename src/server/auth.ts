import "server-only";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { admins, adminSessions, loginAttempts } from "@/db/schema";

const isProd = process.env.NODE_ENV === "production";
// Prefix __Host-: cookie wajib Secure, Path=/, tanpa Domain → tidak bisa ditimpa subdomain lain
const COOKIE_NAME = isProd ? "__Host-brewi_admin" : "brewi_admin";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" } as const;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/* ── Sesi ─────────────────────────────────────────────────────────────────── */

export async function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await db.insert(adminSessions).values({ id: sha256(token), adminId, expiresAt });
  // Bersih-bersih sesi kedaluwarsa (tabel kecil, cukup saat login)
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  (await cookies()).set(COOKIE_NAME, token, { ...cookieOptions, expires: expiresAt });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await db.delete(adminSessions).where(eq(adminSessions.id, sha256(token)));
  store.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

/** Admin yang sedang login (sekali query per request berkat `cache`). */
export const getCurrentAdmin = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [admin] = await db
    .select({ id: admins.id, name: admins.name, email: admins.email, role: admins.role })
    .from(adminSessions)
    .innerJoin(admins, eq(admins.id, adminSessions.adminId))
    .where(and(eq(adminSessions.id, sha256(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  return admin ?? null;
});

export type CurrentAdmin = NonNullable<Awaited<ReturnType<typeof getCurrentAdmin>>>;

/** WAJIB dipanggil di awal setiap halaman & server action admin (otorisasi per endpoint). */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/* ── Rate limiting login ──────────────────────────────────────────────────── */

const WINDOW_MS = 15 * 60 * 1000;
export const LOCKOUT_MINUTES = WINDOW_MS / 60_000;

/** IP klien. Di Vercel `x-real-ip` diisi oleh platform (tidak bisa dipalsukan klien). */
async function clientIp() {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return isIP(ip) ? ip : "unknown"; // nilai header aneh/terlalu panjang tidak dipakai mentah
}

/**
 * Batas percobaan login per jendela 15 menit:
 * - per pasangan IP + email: 5 → tebak password dari satu perangkat dibatasi;
 * - per IP: 20 → satu sumber tidak bisa mencoba banyak email.
 * Sengaja TIDAK mengunci per email saja, supaya orang lain tidak bisa mengunci akun admin dari IP lain.
 * Key disimpan sebagai hash (IP & email tidak tersimpan mentah).
 */
export async function loginLimitKeys(email: string) {
  const ip = await clientIp();
  return [
    { key: sha256(`pair:${ip}:${email}`), max: 5 },
    { key: sha256(`ip:${ip}`), max: 20 },
  ];
}

/**
 * Catat percobaan SEBELUM password diperiksa (atomik, satu upsert) → request paralel tidak bisa
 * melewati batas. Mengembalikan true bila salah satu batas terlampaui.
 */
export async function registerLoginAttempt(limits: { key: string; max: number }[]) {
  const resetAt = new Date(Date.now() + WINDOW_MS);
  const expired = sql`${loginAttempts.resetAt} < now()`;
  const rows = await db
    .insert(loginAttempts)
    .values(limits.map(({ key }) => ({ key, count: 1, resetAt })))
    .onConflictDoUpdate({
      target: loginAttempts.key,
      set: {
        count: sql`case when ${expired} then 1 else ${loginAttempts.count} + 1 end`,
        resetAt: sql`case when ${expired} then excluded.reset_at else ${loginAttempts.resetAt} end`,
      },
    })
    .returning({ key: loginAttempts.key, count: loginAttempts.count });
  return rows.some((row) => row.count > (limits.find((l) => l.key === row.key)?.max ?? 0));
}

/** Login berhasil → hitungan pasangan IP+email dikosongkan. */
export async function clearLoginAttempts(keys: string[]) {
  await db.delete(loginAttempts).where(inArray(loginAttempts.key, keys));
}
