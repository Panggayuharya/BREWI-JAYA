import "server-only";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { and, asc, eq, like, max, ne, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { z } from "zod";
import { db } from "@/db";
import type { FormState } from "@/lib/form-state";
import { UploadError } from "@/server/storage";

/* ── Validasi input form (zod) ────────────────────────────────────────────── */

/** Teks wajib (di-trim). */
export const requiredText = (max: number) =>
  z.string().trim().min(1, "Wajib diisi.").max(max, `Maksimal ${max} karakter.`);
/** Teks opsional (kosong → ""). */
export const optionalText = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`).default("");
/** Checkbox HTML: tercentang → "on", tidak → field tidak dikirim. */
export const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
export const positiveId = z.coerce.number().int().positive().max(2_147_483_647); // batas kolom integer Postgres
/** Arah tombol urutan: -1 naik, 1 turun. */
export const moveDir = z.coerce.number().pipe(z.union([z.literal(-1), z.literal(1)]));
/** Nilai saklar dari <ToggleButton>. */
export const toggleValue = z.enum(["true", "false"]).transform((v) => v === "true");

/** Param `[id]` dari URL → angka valid, atau halaman 404. */
export async function idFromParams(params: Promise<{ id: string }>) {
  const parsed = positiveId.safeParse((await params).id);
  if (!parsed.success) notFound();
  return parsed.data;
}

/** FormData → objek biasa (field file diabaikan; file dibaca terpisah lewat readImageFile). */
export function formObject(formData: FormData) {
  return Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string"));
}

export function invalid(error: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { message: "Periksa kembali isian yang ditandai.", errors };
}

const isUniqueViolation = (err: unknown): boolean =>
  typeof err === "object" && err !== null && ("code" in err && err.code === "23505" || isUniqueViolation((err as { cause?: unknown }).cause));

/** Error tak terduga → dicatat di log server, admin hanya melihat pesan umum (tanpa detail teknis). */
export function failed(err: unknown, uniqueField?: { name: string; message: string }): FormState {
  if (err instanceof UploadError) return { message: "Foto belum bisa disimpan.", errors: { image: err.message } };
  if (uniqueField && isUniqueViolation(err)) {
    return { message: uniqueField.message, errors: { [uniqueField.name]: uniqueField.message } };
  }
  console.error("[admin]", err);
  return { message: "Gagal menyimpan. Coba lagi beberapa saat lagi." };
}

/** Konten publik berubah → render ulang semua halaman situs (landing, /menu, /news/*). */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/* ── Slug unik ────────────────────────────────────────────────────────────── */

type Sluggable = PgTable & { id: AnyPgColumn; slug: AnyPgColumn };

/** `base`, atau `base-2`, `base-3`, … bila sudah dipakai baris lain. */
export async function uniqueSlug(table: Sluggable, base: string, excludeId?: number) {
  const rows = await db
    .select({ slug: table.slug })
    .from(table)
    .where(and(like(table.slug, `${base}%`), excludeId ? ne(table.id, excludeId) : undefined));
  const taken = new Set(rows.map((r) => String(r.slug)));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/* ── Urutan tampil (sort_order) ───────────────────────────────────────────── */

type Sortable = PgTable & { id: AnyPgColumn; sortOrder: AnyPgColumn };

/** sort_order berikutnya (paling akhir) dalam lingkup `scope` (mis. kategori yang sama). */
export async function nextSortOrder(table: Sortable, scope?: SQL) {
  const [row] = await db.select({ value: max(table.sortOrder) }).from(table).where(scope);
  return (Number(row?.value) || 0) + 1;
}

/**
 * Pindahkan baris satu posisi (dir -1 = naik, 1 = turun) di dalam kelompoknya (`scopeColumn`, mis. category_id).
 * Seluruh kelompok dinomori ulang 1..n dalam satu transaksi, jadi nilai sort_order yang kembar
 * (mis. dua baris ditambah bersamaan) ikut rapi dan tidak membuat tombol naik/turun macet.
 */
export async function moveRow(table: Sortable, id: number, dir: 1 | -1, scopeColumn?: AnyPgColumn) {
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ scope: scopeColumn ?? sql`null` })
      .from(table)
      .where(eq(table.id, id));
    if (!current) return;

    const rows = await tx
      .select({ id: table.id, sortOrder: table.sortOrder })
      .from(table)
      .where(scopeColumn ? eq(scopeColumn, current.scope) : undefined)
      .orderBy(asc(table.sortOrder), asc(table.id))
      .for("update");

    const from = rows.findIndex((r) => r.id === id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= rows.length) return;
    [rows[from], rows[to]] = [rows[to], rows[from]];

    const changed = rows.flatMap((r, i) => (Number(r.sortOrder) === i + 1 ? [] : [{ id: r.id, position: i + 1 }]));
    if (changed.length === 0) return;
    await tx.execute(sql`
      update ${table} set ${sql.identifier("sort_order")} = case ${table.id}
        ${sql.join(changed.map((c) => sql`when ${c.id} then ${c.position}::int`), sql` `)}
      end
      where ${table.id} in (${sql.join(changed.map((c) => sql`${c.id}`), sql`, `)})`);
  });
}
