// Hash password dengan Argon2id (parameter default @node-rs/argon2: m=19 MiB, t=2, p=1 — sesuai rekomendasi OWASP).
// Modul native: hanya bisa dipakai di server / script CLI.
import { hash, verify } from "@node-rs/argon2";

export const MIN_PASSWORD_LENGTH = 12;

export function hashPassword(password: string) {
  return hash(password);
}

/** Hash tiruan untuk email yang tidak terdaftar, supaya waktu respons login tidak membocorkan email mana yang ada. */
const DUMMY_HASH = "$argon2id$v=19$m=19456,t=2,p=1$JF/DGUNxxjGHFJ/zntkS6Q$PPubXDKdFkdfZcjKsX3KSlrII78weFhG16pkRP1f2vI";

export async function verifyPassword(passwordHash: string | null, password: string) {
  try {
    const ok = await verify(passwordHash ?? DUMMY_HASH, password);
    return passwordHash !== null && ok;
  } catch {
    return false;
  }
}
