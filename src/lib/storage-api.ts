/**
 * Klien REST minimal untuk Supabase Storage (tanpa supabase-js). Memakai secret key → HANYA untuk server
 * (src/server/storage.ts) dan script CLI; jangan diimpor dari komponen client.
 */
export interface StorageConfig {
  url: string;
  key: string;
  bucket: string;
}

export function readStorageConfig(env: NodeJS.ProcessEnv = process.env): StorageConfig {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY belum di-set (lihat .env.example).");
  return { url, key, bucket: env.SUPABASE_BUCKET || "media" };
}

/** Kunci baru (sb_secret_…) cukup di header `apikey`; kunci lama (JWT service_role) juga butuh Authorization. */
function authHeaders(key: string): Record<string, string> {
  return key.startsWith("sb_") ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

export interface BucketOptions {
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

export function createStorageApi(cfg: StorageConfig) {
  const base = `${cfg.url}/storage/v1`;
  const publicPrefix = `${base}/object/public/${cfg.bucket}/`;

  async function request(path: string, init: RequestInit) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { ...authHeaders(cfg.key), ...init.headers },
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Storage ${init.method ?? "GET"} ${path} gagal (${res.status}): ${detail.slice(0, 300)}`);
    }
    return res;
  }

  const bucketBody = (opts: BucketOptions) =>
    JSON.stringify({
      id: cfg.bucket,
      name: cfg.bucket,
      public: true,
      file_size_limit: opts.fileSizeLimit,
      allowed_mime_types: opts.allowedMimeTypes,
    });

  return {
    publicUrl: (path: string) => publicPrefix + path,

    /** Path objek dari URL publik; null bila URL bukan file bucket ini (mis. foto bawaan di /public). */
    pathFromUrl: (url: string) => (url.startsWith(publicPrefix) ? url.slice(publicPrefix.length) : null),

    upload: (path: string, body: Uint8Array, contentType: string) =>
      request(`/object/${cfg.bucket}/${path}`, {
        method: "POST",
        body: new Blob([new Uint8Array(body)], { type: contentType }),
        // Nama file unik (UUID) → aman di-cache permanen
        headers: { "content-type": contentType, "cache-control": "max-age=31536000", "x-upsert": "false" },
      }),

    remove: (paths: string[]) =>
      request(`/object/${cfg.bucket}`, {
        method: "DELETE",
        body: JSON.stringify({ prefixes: paths }),
        headers: { "content-type": "application/json" },
      }),

    /** Buat bucket publik, atau perbarui batasannya bila sudah ada (idempoten). */
    async ensureBucket(opts: BucketOptions) {
      const exists = await fetch(`${base}/bucket/${cfg.bucket}`, { headers: authHeaders(cfg.key), cache: "no-store" });
      const headers = { "content-type": "application/json" };
      if (exists.ok) await request(`/bucket/${cfg.bucket}`, { method: "PUT", body: bucketBody(opts), headers });
      else await request("/bucket", { method: "POST", body: bucketBody(opts), headers });
      return exists.ok ? "updated" : "created";
    },
  };
}

export type StorageApi = ReturnType<typeof createStorageApi>;
