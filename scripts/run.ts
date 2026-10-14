/** Jalankan script async: error → pesan singkat + exit code 1; selesai → tutup proses (pool DB ikut tertutup). */
export function runScript(main: () => Promise<void>) {
  main()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
