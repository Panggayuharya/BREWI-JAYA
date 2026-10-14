/**
 * Perkecil foto di browser sebelum di-upload (batas body request Vercel ±4,5 MB; foto HP sering 3–8 MB).
 * Server tetap memvalidasi & meng-encode ulang; ini hanya supaya upload cepat dan tidak mentok batas.
 */
const KEEP_ORIGINAL_BYTES = 1.5 * 1024 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File, maxSide: number): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // format tidak dikenali browser → biarkan server yang menilai
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= KEEP_ORIGINAL_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP menjaga transparansi (foto cutout). Browser yang belum bisa meng-encode WebP mengembalikan PNG:
  // dalam kasus itu foto biasa dikirim sebagai JPEG supaya tetap kecil.
  let blob = await toBlob(canvas, "image/webp", 0.9);
  const hasAlpha = file.type === "image/png" || file.type === "image/webp";
  if (blob?.type !== "image/webp" && !hasAlpha) blob = await toBlob(canvas, "image/jpeg", 0.9);
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type.split("/")[1];
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, { type: blob.type });
}
