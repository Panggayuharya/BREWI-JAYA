import { Navbar } from "@/components/layout/Navbar";
import { StackPanel } from "@/components/motion/StackPanel";
import { Intro } from "@/components/sections/Intro";
import { Home } from "@/components/sections/Home";
import { Place } from "@/components/sections/Place";
import { MenuCoffee } from "@/components/sections/MenuCoffee";
import { Gallery } from "@/components/sections/Gallery";
import { News } from "@/components/sections/News";
import { Location } from "@/components/sections/Location";
import { Reservation } from "@/components/sections/Reservation";

/**
 * Urutan section sesuai design.md 1.
 * Intro membungkus Home (Home terungkap dari balik intro, tanpa layar kosong).
 * Section yang di-pin (Intro+Home) bersaudara di level ini — tidak ada pin di dalam pin.
 * Menu Kopi, Non-Kopi, dan Makanan ada di satu section (MenuCoffee) yang berputar otomatis.
 * Overlapping: Tempat menimpa Home, Menu Kopi menimpa Tempat,
 * Galeri menimpa Menu, dan seterusnya dengan sudut atas membulat.
 * Hanya dua tempat yang memakai "tahan lalu timpa" (pinPrevious): Menu Kopi (Tempat ditahan)
 * dan News (Galeri ditahan) — sengaja tidak berurutan supaya scroll tidak terasa berat.
 */
export default function Page() {
  return (
    <>
      <Navbar />
      <main id="konten" tabIndex={-1} className="outline-none">
        <Intro>
          <Home />
        </Intro>
        <StackPanel className="bg-ink">
          <Place />
        </StackPanel>
        <StackPanel className="bg-ink" pinPrevious>
          <MenuCoffee />
        </StackPanel>
        <StackPanel className="bg-navy-soft">
          <Gallery />
        </StackPanel>
        <StackPanel className="bg-warm" pinPrevious>
          <News />
        </StackPanel>
        <StackPanel className="bg-cream">
          <Location />
        </StackPanel>
        <StackPanel className="bg-ink">
          <Reservation />
        </StackPanel>
      </main>
    </>
  );
}
