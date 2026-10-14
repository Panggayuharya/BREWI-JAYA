// Diimpor PALING ATAS di setiap script supaya env terbaca sebelum modul lain (mis. @/db) dievaluasi.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Tidak ada .env.local: pakai environment variable yang sudah ada (mis. di CI)
}
