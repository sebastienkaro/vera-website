"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the visitor has asked their system to keep motion to a minimum.
 * Anything on the site that moves on its own — the hero video, the rotating
 * card deck — reads this and holds still when it is true.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // The server has no opinion on the visitor's motion preference; assuming
    // "no preference" matches the markup the client renders on first paint.
    () => false,
  );
}
