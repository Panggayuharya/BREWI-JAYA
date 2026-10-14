import { defineConfig } from "drizzle-kit";

// Baca .env.local seperti Next.js (tanpa dependency dotenv)
try {
  process.loadEnvFile(".env.local");
} catch {}

// Migrasi sebaiknya lewat koneksi session/direct (port 5432); aplikasi memakai transaction pooler (6543).
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL / DIRECT_URL belum di-set (lihat .env.example).");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
});
