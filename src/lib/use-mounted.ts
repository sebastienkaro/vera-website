"use client";

import { useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}

/**
 * False on the server and on the first client render, true afterwards.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because it gives
 * React the server and client snapshots separately, so the first render matches
 * what was sent and there is no hydration mismatch to warn about.
 *
 * Used by anything that portals into `document.body`, which doesn't exist until
 * the browser has it.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
