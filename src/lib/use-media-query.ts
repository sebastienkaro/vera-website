"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Whether the window currently matches a CSS media query.
 *
 * For the handful of decisions a media query can't make on its own — a prop
 * rather than a class, or state that shouldn't be entered at all at a size
 * where its UI is hidden. Anything that is only a matter of styling belongs in
 * a Tailwind breakpoint instead.
 *
 * False on the server and on the first client render, like `useMounted`: the
 * server has no window to measure, and matching that on first paint is what
 * keeps hydration quiet.
 */
export function useMediaQuery(query: string): boolean {
  const [subscribe, getSnapshot] = useMemo(
    () => [
      (onChange: () => void) => {
        const list = window.matchMedia(query);
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
      },
      () => window.matchMedia(query).matches,
    ],
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
