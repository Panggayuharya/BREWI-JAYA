import { getPageSection, getPlacePhotos, placeBackgroundImage } from "@/data/site";
import { StackSpread } from "@/components/ui/StackSpread";

/**
 * Tentang — "Tempat Buat Lama-Lama": foto suasana tempat bertumpuk di tengah, lalu menyebar
 * di sekeliling judul saat di-scroll (StackSpread, memakai sticky — tanpa pin GSAP).
 * Hanya judul yang tampil; klik foto untuk membaca cerita singkatnya.
 */
export function Place() {
  const section = getPageSection("tentang", "place");
  const photos = getPlacePhotos().map((p) => ({ src: p.imageUrl, alt: p.title, description: p.description }));

  return (
    <StackSpread
      id="tentang"
      data-nav="tentang"
      data-nav-theme="light"
      items={photos}
      title={section?.title ?? ""}
      backgroundImage={placeBackgroundImage}
    />
  );
}
