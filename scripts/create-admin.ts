// pnpm admin:create --email owner@brewi.id --name "Nama" [--role owner|staff]
// Password diketik di terminal (tidak tampil); bila email sudah ada → password & role diperbarui, sesi lama dicabut.
import "./load-env";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { admins, adminSessions } from "@/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/server/password";
import { runScript } from "./run";

/** Baca input tanpa menampilkan karakter (untuk password). */
function askHidden(question: string) {
  return new Promise<string>((resolve) => {
    let muted = false;
    const output = new Writable({
      write(chunk, _enc, cb) {
        if (!muted) process.stdout.write(chunk);
        cb();
      },
    });
    const rl = createInterface({ input: process.stdin, output, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

const argsSchema = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  name: z.string().trim().min(1).max(100),
  role: z.enum(["owner", "staff"]).default("owner"),
});

runScript(async () => {
  const { values } = parseArgs({
    options: { email: { type: "string" }, name: { type: "string" }, role: { type: "string" } },
  });
  const args = argsSchema.safeParse(values);
  if (!args.success) throw new Error('Pakai: pnpm admin:create --email nama@domain.id --name "Nama" [--role owner|staff]');

  // ADMIN_PASSWORD hanya untuk otomatisasi (CI); pemakaian biasa: ketik di prompt
  const password = process.env.ADMIN_PASSWORD ?? (await askHidden(`Password (min. ${MIN_PASSWORD_LENGTH} karakter): `));
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);

  const passwordHash = await hashPassword(password);
  const { email, name, role } = args.data;
  const [admin] = await db
    .insert(admins)
    .values({ email, name, role, passwordHash })
    .onConflictDoUpdate({ target: admins.email, set: { name, role, passwordHash } })
    .returning({ id: admins.id });
  // Password diganti → semua sesi lama akun ini dicabut
  await db.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
  console.log(`Admin ${email} (${role}) siap dipakai.`);
});
