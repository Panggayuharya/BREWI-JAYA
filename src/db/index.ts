import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum di-set (lihat .env.example).");

  // Satu pool per proses; di dev disimpan di globalThis supaya HMR tidak membuka koneksi baru terus.
  // prepare: false → wajib untuk Supabase transaction pooler (port 6543).
  const g = globalThis as unknown as { brewiSql?: postgres.Sql };
  const client = g.brewiSql ?? postgres(url, { prepare: false, max: 5, idle_timeout: 20 });
  if (process.env.NODE_ENV !== "production") g.brewiSql = client;

  return drizzle({ client, schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

let instance: Db | undefined;

/**
 * Koneksi dibuat saat pertama dipakai (bukan saat modul di-import), supaya `next build` tetap jalan
 * walau DATABASE_URL belum di-set: Next meng-import halaman admin saat build untuk membaca konfigurasinya.
 */
export const db = new Proxy({} as Db, {
  get(_, prop) {
    instance ??= createDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
