"use client";
import { useMediaQuery } from "./useMediaQuery";

/** true untuk lebar < 1024px (sm + md di design.md) */
export function useIsMobile() {
  return useMediaQuery("(max-width: 1023px)");
}
