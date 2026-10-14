// pnpm storage:setup → buat/perbarui bucket publik Supabase Storage untuk foto (hanya WebP, maks 5 MB).
import "./load-env";
import { createStorageApi, readStorageConfig } from "@/lib/storage-api";
import { runScript } from "./run";

runScript(async () => {
  const cfg = readStorageConfig();
  const result = await createStorageApi(cfg).ensureBucket({
    fileSizeLimit: 5 * 1024 * 1024,
    // Server selalu mengonversi upload ke WebP, jadi bucket cukup menerima WebP
    allowedMimeTypes: ["image/webp"],
  });
  console.log(`Bucket "${cfg.bucket}" ${result === "created" ? "dibuat" : "diperbarui"}.`);
});
