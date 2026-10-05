# CLAUDE.md — BREWI JAYA ☕

File ini dibaca otomatis oleh **Claude Code** setiap sesi. Aturan lengkap ada di dokumen yang diimpor di bawah; bagian selanjutnya hanya ringkasan hal yang paling sering dibutuhkan.

## Dokumen acuan

@agent.md
@design.md
@erd.md

Prioritas jika ada konflik: `design.md` untuk tampilan, `erd.md` untuk data, `agent.md` untuk teknis dan struktur kode.

## Proyek singkat

Landing page satu halaman untuk coffee shop **Brewi Jaya** (target Gen Z). Urutan section: Intro → Home → Tentang → Menu Kopi/Non-Kopi → Menu Makanan → Gallery → Lokasi → Reservasi. Fokus utama: scroll motion, overlapping section, objek bergerak saat scroll, dan harus mulus di HP maupun laptop.

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · GSAP + ScrollTrigger + Flip (`@gsap/react`) · Lenis · motion (`motion/react`) · React Bits (TS + Tailwind) · pnpm

## Perintah

```bash
pnpm dev          # development
pnpm lint         # wajib lolos
pnpm typecheck    # wajib lolos
pnpm build        # wajib lolos sebelum tugas dianggap selesai
```

## Aturan yang paling sering dilanggar (baca ulang sebelum menulis animasi)

- Semua animasi GSAP di dalam `useGSAP` dengan `scope` ref section. Plugin hanya diregistrasi di `src/lib/gsap.ts`.
- Lenis disinkronkan lewat `gsap.ticker`, bukan loop `requestAnimationFrame` sendiri.
- Hanya animasikan `transform`, `opacity`, `filter`, `clip-path`.
- Tidak ada pin di dalam pin. Section yang di-pin bersaudara di `page.tsx`.
- Tinggi layar pakai `100svh`. Nilai desktop vs mobile lewat `gsap.matchMedia()`.
- Setiap animasi punya perilaku `prefers-reduced-motion` (lihat `agent.md` 7.3).
- Warna, font, radius hanya dari token di `globals.css`. Teks konten hanya dari `src/data/`.
- Kode dan nama variabel bahasa Inggris, teks yang tampil ke pengunjung bahasa Indonesia.

## Cara kerja di Claude Code

1. **Rencanakan dulu.** Untuk tugas yang menyentuh lebih dari satu file, tulis rencana singkat (file yang akan dibuat/diubah dan alasannya) sebelum mengedit.
2. **Satu milestone per sesi.** Ikuti urutan di `agent.md` 12.1. Jangan loncat ke section lain sebelum yang sekarang lolos build.
3. **Perubahan sekecil mungkin.** Edit bagian yang relevan, jangan menulis ulang file utuh tanpa diminta.
4. **Verifikasi sendiri.** Setelah mengedit, jalankan `pnpm lint && pnpm typecheck && pnpm build` dan perbaiki error sebelum melapor selesai.
5. **Dependency baru** harus disebutkan beserta alasannya sebelum dipasang.
6. **Jika ragu** pada detail desain atau animasi yang berat di HP, jelaskan masalahnya, tawarkan 1–2 alternatif, lalu tunggu keputusan.
7. **Laporan akhir** tiap tugas: apa yang dikerjakan, file yang berubah, cara mengeceknya di browser, dan placeholder yang masih perlu diganti.

## Placeholder yang belum ada data aslinya

Tandai dengan `// TODO: ganti data asli`: nomor WhatsApp, alamat dan koordinat outlet, jam buka, harga, foto menu, foto gallery, foto outlet, logo final, dan konten halaman Reservasi (detail menyusul dari pemilik).

## Catatan

- Kolom `menu_categories.type` memakai `kopi | non_kopi | makanan`.
- Reservasi tidak memakai formulir; langsung ke WhatsApp lewat `buildWhatsappLink()` di `src/lib/whatsapp.ts`.
- Intro dilewati jika `sessionStorage.brewiIntroSeen === "1"`.
