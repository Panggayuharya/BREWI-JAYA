import { redirect } from "next/navigation";

/** Halaman detail per menu sudah dihapus; tautan lama diarahkan ke buku menu (flipbook) di /menu. */
export default function MenuSlugRedirect() {
  redirect("/menu");
}
