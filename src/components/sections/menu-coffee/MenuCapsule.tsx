"use client";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { MenuItem } from "@/types";
import { MediaImage } from "@/components/ui/MediaImage";

interface MenuCapsuleProps {
  items: MenuItem[];
  /** Langkah putaran (boleh > n atau < 0); item aktif = step mod n */
  step: number;
  onSelect: (index: number) => void;
}

/**
 * Offset terkecil yang dipakai: -3 = slot keluar tersembunyi di bawah layar. Dua menu sebelumnya (-2, -1) di tepi
 * kiri bawah lingkaran, dua menu berikutnya (+1, +2) di tepi kanan atas; sisanya (+3) menunggu tersembunyi.
 * Jadi terlihat 2 bawah + 2 atas. Karena menu paling bawah keluar dulu lewat slot -3 (memudar sambil turun),
 * item yang "memutar" ke ujung atas selalu sedang tersembunyi → tidak ada thumbnail yang hilang mendadak.
 */
const MIN_OFFSET = -3;

/** Offset melingkar dalam rentang [MIN_OFFSET, MIN_OFFSET + n - 1] supaya tiap item punya slot unik. */
export function circularOffset(i: number, active: number, n: number) {
  let d = (((i - active) % n) + n) % n;
  if (d > n - 1 + MIN_OFFSET) d -= n;
  return d;
}

type Slot = { style: CSSProperties; visible: boolean };

/**
 * Semua layar (HP sama dengan desktop): thumbnail tepat di garis tepi lingkaran. Sudut dalam derajat
 * (0° = kanan, 90° = bawah, 180° = kiri, 270° = atas). Geometri ada di .menu-stage (globals.css).
 * Putaran: muncul dari atas (272°, tersembunyi) → 261° → 249° → masuk ke tengah → kiri bawah (203°) → 191°.
 * Jarak antar thumbnail 12° di atas dan di bawah, jadi atas & bawah sama rapinya dan tidak menempel ke cup utama.
 */
const ANGLES: Record<number, { deg: number; visible: boolean }> = {
  [-3]: { deg: 176, visible: false }, // keluar (di bawah layar)
  [-2]: { deg: 191, visible: true },
  [-1]: { deg: 203, visible: true },
  1: { deg: 249, visible: true },
  2: { deg: 261, visible: true },
  3: { deg: 272, visible: false }, // antre, muncul di putaran berikutnya
  4: { deg: 278, visible: false }, // masuk (di luar kanan atas)
};

function onCircle(deg: number, visible: boolean): Slot {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad).toFixed(4);
  const sin = Math.sin(rad).toFixed(4);
  return {
    visible,
    style: {
      left: `calc(var(--bx) + var(--br) * ${cos} - var(--tw) / 2)`,
      // --bry: jari-jari vertikal (di HP lingkaran berupa elips, lihat .menu-stage)
      top: `calc(var(--by) + var(--bry) * ${sin} - var(--th) / 2)`,
      width: "var(--tw)",
      height: "var(--th)",
    },
  };
}

const SLOTS: Record<number, Slot> = Object.fromEntries(
  Object.entries(ANGLES).map(([k, a]) => [k, onCircle(a.deg, a.visible)]),
);
/** Slot cadangan untuk offset di luar ANGLES: tersembunyi di luar kanan atas. */
const HIDDEN_SLOT = SLOTS[4];

const CURRENT_STYLE: CSSProperties = {
  left: "var(--cap-x)",
  top: "var(--cap-y)",
  width: "var(--cap-w)",
  height: "var(--cap-h)",
};

// Pegas tanpa pantulan (bounce 0) dengan durasi visual tetap: gerak putaran mengalir halus, tidak memantul,
// dan selesai jauh sebelum putaran berikutnya (2,5 detik).
const spring = { type: "spring", visualDuration: 0.9, bounce: 0 } as const;
const fade = { duration: 0.6, ease: [0.4, 0, 0.2, 1] } as const;

// Bayangan realistis untuk foto cup transparan (tanpa bingkai): dua lapis, coklat hangat (bukan hitam, supaya tidak kusam di atas ivory).
// Lapis 1 tipis & rapat = tepi cup terasa padat; lapis 2 lebar & lembut = cup sedikit terangkat dari latar.
const CUP_SHADOW =
  "filter-[drop-shadow(0_3px_4px_rgb(62_42_32/0.28))_drop-shadow(0_26px_34px_rgb(62_42_32/0.32))]";

/**
 * Panggung Menu Kopi: cup utama + thumbnail. Menempati seluruh section (absolute inset-0)
 * supaya thumbnail bisa ditempatkan di tepi lingkaran navy. Wajib berada di dalam `.menu-stage`.
 */
export function MenuCapsule({ items, step, onSelect }: MenuCapsuleProps) {
  const n = items.length;
  const active = ((step % n) + n) % n;

  return (
    <motion.div
      onPanEnd={(_, info) => {
        if (info.offset.x < -50) onSelect((active + 1) % n);
        if (info.offset.x > 50) onSelect((active - 1 + n) % n);
      }}
      className="absolute inset-0 z-10 touch-pan-y"
    >
      {/* Cahaya biru aksen di belakang cup aktif + bayangan di "lantai" (dua lapis: bayangan lebar yang lembut
          dan bayangan kontak yang gelap tepat di dasar cup, seperti cup yang benar-benar berdiri di permukaan) */}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgb(143_178_245/0.26)_0%,transparent_65%)]"
        style={{
          left: "calc(var(--cap-x) - var(--cap-w) * 0.3)",
          top: "calc(var(--cap-y) + var(--cap-h) * 0.05)",
          width: "calc(var(--cap-w) * 1.6)",
          height: "calc(var(--cap-h) * 0.9)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-[50%] bg-coffee-dark/40 blur-2xl"
        style={{
          left: "calc(var(--cap-x) + var(--cap-w) * 0.02)",
          top: "calc(var(--cap-y) + var(--cap-h) * 0.9)",
          width: "calc(var(--cap-w) * 0.96)",
          height: "calc(var(--cap-h) * 0.08)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-[50%] bg-coffee-dark/70 blur-md"
        style={{
          left: "calc(var(--cap-x) + var(--cap-w) * 0.2)",
          top: "calc(var(--cap-y) + var(--cap-h) * 0.925)",
          width: "calc(var(--cap-w) * 0.6)",
          height: "calc(var(--cap-h) * 0.03)",
        }}
      />

      {items.map((item, i) => {
        const offset = circularOffset(i, active, n);
        // "lap" berubah saat item memutar dari ujung bawah ke ujung atas (offset -3 → n-4);
        // key baru → elemen muncul pelan di slot barunya, tidak terbang melintasi layar. Elemen lama dilepas
        // tanpa animasi keluar, tapi saat itu ia sudah tersembunyi di slot -3 jadi tidak terlihat hilang mendadak.
        // (Sengaja tanpa AnimatePresence: membuat animasi layout semua cup jauh lebih berat / patah-patah.)
        const lap = (offset - i + step) / n;
        const isCurrent = offset === 0;
        const slot = SLOTS[offset] ?? HIDDEN_SLOT;
        const hidden = !isCurrent && !slot.visible;
        const style = isCurrent ? CURRENT_STYLE : slot.style;
        // Foto transparan tampil tanpa bingkai; foto biasa (tanpa cutout) tetap dalam bingkai bulat.
        // Belum ada foto (mis. makanan) → kapsul navy bergaris biru aksen tipis, tanpa bingkai putih yang mencolok.
        const framed = !item.imageCutoutUrl;
        const hasPhoto = Boolean(item.imageCutoutUrl || item.imageUrl);

        return (
          <motion.button
            key={`${item.id}-${lap}`}
            type="button"
            layout
            initial={{ opacity: 0 }}
            transition={{ ...spring, opacity: fade }}
            // Klik thumbnail = pilih menu itu; klik cup utama = lanjut ke menu berikutnya
            onClick={() => onSelect(isCurrent ? (active + 1) % n : i)}
            tabIndex={hidden ? -1 : 0}
            aria-hidden={hidden}
            aria-label={isCurrent ? `${item.name} — menu berikutnya` : `Lihat ${item.name}`}
            animate={{ opacity: hidden ? 0 : isCurrent ? 1 : 0.9 }}
            whileHover={isCurrent || hidden ? undefined : { opacity: 1, scale: 1.08 }}
            style={{ ...style, ...(framed ? { borderRadius: 9999 } : {}), zIndex: isCurrent ? 20 : 10 }}
            className={`absolute cursor-pointer ${
              framed
                ? hasPhoto
                  ? `overflow-hidden bg-warm shadow-[0_14px_30px_-14px_rgb(0_0_0/0.7)] ring-1 ring-accent/40 ${isCurrent ? "p-1.5" : "p-1"}`
                  : "overflow-hidden bg-deep shadow-[0_14px_30px_-14px_rgb(0_0_0/0.7)] ring-1 ring-accent/35"
                : ""
            } ${hidden ? "pointer-events-none" : ""}`}
          >
            {/* Alas 3D: cup berdiri di atasnya, bagian atas cup keluar bingkai.
                Memudar saat cup ini menjadi cup utama. */}
            {!framed && (
              <motion.span
                aria-hidden
                initial={false}
                animate={{ opacity: isCurrent ? 0 : 1 }}
                transition={fade}
                className="pointer-events-none absolute inset-x-[-10%] top-[32%] bottom-[-6%] origin-bottom perspective-[260px]"
              >
                <span className="absolute inset-0 rounded-inner border border-accent/25 bg-[radial-gradient(ellipse_at_50%_100%,rgb(143_178_245/0.32)_0%,transparent_70%),linear-gradient(180deg,var(--color-navy-soft),var(--color-deep))] shadow-[inset_0_1px_0_rgb(243_245_249/0.14),0_16px_24px_-12px_rgb(7_19_49/0.45)] transform-[rotateX(6deg)]" />
                {/* Bayangan di dasar cup */}
                <span className="absolute inset-x-[22%] bottom-[7%] h-[7%] rounded-[50%] bg-black/45 blur-[3px]" />
              </motion.span>
            )}
            <motion.span
              layout
              transition={spring}
              style={framed ? { borderRadius: 9999 } : undefined}
              // will-change: foto + drop-shadow-nya jadi layer GPU sendiri, jadi bayangan tidak digambar ulang
              // di setiap frame animasi (tanpa ini transisi cup terasa patah-patah)
              className={`relative block h-full w-full will-change-transform ${framed ? "overflow-hidden" : ""}`}
            >
              <MediaImage
                src={item.imageCutoutUrl ?? item.imageUrl}
                alt={isCurrent ? item.name : ""}
                // Ukuran sama untuk cup utama & thumbnail: saat thumbnail jadi cup utama gambarnya tidak dimuat ulang (tanpa kedip)
                sizes="(min-width: 1024px) 360px, 40vw"
                label={isCurrent ? undefined : " "}
                fit={framed ? "cover" : "contain"}
                className={framed ? "" : CUP_SHADOW}
              />
            </motion.span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
