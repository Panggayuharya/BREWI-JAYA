/** Sinyal sederhana dari Intro ke Navbar: navbar disembunyikan selama intro berjalan. */
export const INTRO_EVENT = "brewi:intro";

export function setIntroActive(active: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(INTRO_EVENT, { detail: active }));
}
