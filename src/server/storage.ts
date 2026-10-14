import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { createStorageApi, readStorageConfig, type StorageApi } from "@/lib/storage-api";
import { IMAGE_PRESETS, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, type ImagePreset } from "@/lib/upload-rules";

let api: StorageApi | null = null;
const storage = () => (api ??= createStorageApi(readStorageConfig()));

/** Error yang pesannya aman ditampilkan ke admin. */
export class UploadError extends Error {}

// Format dicek dari isi file (bukan nama/MIME kiriman browser). AVIF terbaca sebagai "heif".
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "heif"]);
// ±40 megapiksel: tolak "decompression bomb" (file kecil yang mengembang jadi gambar raksasa)
const MAX_INPUT_PIXELS = 40_000_000;

/** File dari FormData; null bila input file dibiarkan kosong. */
export function readImageFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

/**
 * Validasi + olah ulang foto lalu simpan ke Supabase Storage.
 * Selalu di-encode ulang ke WebP: metadata (EXIF/GPS) terbuang, file "polyglot" tidak lolos,
 * ukuran diperkecil sesuai preset, dan transparansi (PNG cutout) tetap terjaga.
 */
export async function uploadImage(file: File, preset: ImagePreset) {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`Ukuran foto maksimal ${MAX_UPLOAD_MB} MB.`);
  const { folder, maxSide } = IMAGE_PRESETS[preset];
  const { data, info } = await toWebp(Buffer.from(await file.arrayBuffer()), maxSide);
  const path = `${folder}/${randomUUID()}.webp`;
  await storage().upload(path, data, "image/webp");
  return { url: storage().publicUrl(path), width: info.width, height: info.height };
}

async function toWebp(input: Buffer, maxSide: number) {
  try {
    const image = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });
    const { format } = await image.metadata();
    if (!format || !ALLOWED_FORMATS.has(format)) throw new UploadError("Format foto harus JPG, PNG, WebP, atau AVIF.");
    return await image
      .autoOrient()
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    if (err instanceof UploadError) throw err;
    throw new UploadError("File bukan gambar yang valid, atau resolusinya terlalu besar.");
  }
}

/**
 * Hapus foto lama dari Storage. Foto bawaan di /public dan URL asing diabaikan.
 * Gagal menghapus hanya dicatat di log (file yatim lebih baik daripada aksi admin gagal).
 */
export async function deleteImages(...urls: (string | null | undefined)[]) {
  const paths = urls.flatMap((url) => {
    const path = url ? storage().pathFromUrl(url) : null;
    return path ? [path] : [];
  });
  if (paths.length === 0) return;
  try {
    await storage().remove(paths);
  } catch (err) {
    console.error("[storage] gagal menghapus", paths, err);
  }
}

export type UploadedImage = Awaited<ReturnType<typeof uploadImage>>;

/**
 * Upload foto (bila ada) lalu jalankan `save` (biasanya insert/update DB).
 * Bila `save` gagal, foto yang baru di-upload dihapus lagi supaya tidak jadi file yatim.
 */
export async function saveWithImage<T>(
  file: File | null,
  preset: ImagePreset,
  save: (image: UploadedImage | null) => Promise<T>,
): Promise<T> {
  const image = file ? await uploadImage(file, preset) : null;
  try {
    return await save(image);
  } catch (err) {
    await deleteImages(image?.url);
    throw err;
  }
}
