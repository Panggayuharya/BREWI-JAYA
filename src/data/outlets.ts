import type { OpeningHour, Outlet, WhatsappContact } from "@/types";

const reservationTemplate = `Halo {contact_name}, saya mau reservasi di {outlet_name} 👋
Nama:
Tanggal:
Jam:
Jumlah orang:`;

/** `closedDays`: 0 = Minggu ... 6 = Sabtu */
function weekHours(outletId: number, open: string, close: string, closedDays: number[] = []): OpeningHour[] {
  return Array.from({ length: 7 }, (_, day) => ({
    id: outletId * 10 + day,
    outletId,
    dayOfWeek: day,
    openTime: open,
    closeTime: close,
    isClosed: closedDays.includes(day),
  }));
}

function contact(id: number, outletId: number, name: string, number: string): WhatsappContact {
  return {
    id,
    outletId,
    contactName: name,
    whatsappNumber: number,
    purpose: "reservasi",
    messageTemplate: reservationTemplate,
    isPrimary: true,
    isActive: true,
    sortOrder: 1,
  };
}

// Alamat, koordinat, dan jam buka dari Google Maps.
// TODO: ganti nomor WhatsApp dan foto outlet dengan data asli
const outlets: Outlet[] = [
  {
    id: 1,
    name: "BREWi JAYA Transmart",
    slug: "transmart",
    address: "Transmart, Jl. Veteran, Ketawanggede, Kec. Klojen",
    city: "Kota Malang",
    latitude: -7.9560941,
    longitude: 112.6180507,
    gmapsUrl: "https://share.google/zekirjCdOMOkTwz61",
    coverImageUrl: "/place/tampak-depan.webp",
    isActive: true,
    openingHours: weekHours(1, "09:00", "22:00"),
    whatsappContacts: [contact(1, 1, "Admin Reservasi Transmart", "6281234567890")],
  },
  {
    id: 2,
    name: "BREWi JAYA Express FIB",
    slug: "express-fib",
    address: "FIB Universitas Brawijaya, Ketawanggede, Kec. Lowokwaru",
    city: "Kota Malang",
    latitude: -7.951254,
    longitude: 112.6125334,
    gmapsUrl: "https://share.google/ODYB12Wzz7Vvy32Xw",
    coverImageUrl: "/place/bar-espresso.webp",
    isActive: true,
    openingHours: weekHours(2, "07:00", "17:00", [0, 6]),
    whatsappContacts: [contact(2, 2, "Admin Reservasi Express FIB", "6281234567891")],
  },
  {
    id: 3,
    name: "BREWi JAYA Rest Area KM 66 A",
    slug: "rest-area-km-66a",
    address: "Rest Area KM 66 A, Sumbersuko, Kec. Pandaan",
    city: "Kabupaten Pasuruan",
    latitude: -7.7430786,
    longitude: 112.7184237,
    gmapsUrl: "https://share.google/b4GFelIrwg2H0997Z",
    coverImageUrl: "/place/outdoor-rest-area.webp",
    isActive: true,
    openingHours: weekHours(3, "06:30", "22:00"),
    whatsappContacts: [contact(3, 3, "Admin Reservasi Rest Area", "6281234567892")],
  },
  // TODO: konfirmasi jam buka outlet IKN & Jakarta (belum tercantum di Google Maps)
  {
    id: 4,
    name: "BREWi JAYA IKN",
    slug: "ikn",
    address: "Rusun ASN 3 Tower 2, Nusantara",
    city: "Kabupaten Penajam Paser Utara",
    latitude: -0.9650725,
    longitude: 116.7122627,
    gmapsUrl: "https://maps.app.goo.gl/iN32cUTe47KWL6yRA",
    coverImageUrl: "/place/area-indoor.webp",
    isActive: true,
    openingHours: weekHours(4, "08:00", "22:00"),
    whatsappContacts: [contact(4, 4, "Admin Reservasi IKN", "6281234567893")],
  },
  {
    id: 5,
    name: "BREWi JAYA Jagorawi",
    slug: "jagorawi",
    address: "Tol Jagorawi, Pinang Ranti, Kec. Makasar",
    city: "Jakarta Timur",
    latitude: -6.2927129,
    longitude: 106.8805683,
    gmapsUrl: "https://maps.app.goo.gl/yfChRheXBrej1s618",
    coverImageUrl: "/place/barista-interior.webp",
    isActive: true,
    openingHours: weekHours(5, "08:00", "22:00"),
    whatsappContacts: [contact(5, 5, "Admin Reservasi Jagorawi", "6281234567894")],
  },
];

export function getOutlets(): Outlet[] {
  return outlets.filter((o) => o.isActive);
}

export function getReservationContacts(): { outlet: Outlet; contact: WhatsappContact }[] {
  return getOutlets().flatMap((outlet) =>
    outlet.whatsappContacts
      .filter((c) => c.isActive && c.purpose === "reservasi")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ outlet, contact: c })),
  );
}
