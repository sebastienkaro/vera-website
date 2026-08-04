"use client";

import { useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

function subscribeNever() {
  return () => {};
}

function useMounted() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/**
 * The hero's moving background, played over the still photo rather than
 * instead of it.
 *
 * Nothing is rendered until the component is on the client and has checked the
 * visitor's motion preference. That costs the video a moment at the start of
 * the page, and buys two things: the still underneath is what the server sends
 * and what the browser paints first, and a visitor who asked for reduced
 * motion never downloads three megabytes of footage they didn't want. If the
 * video fails to load, or the file is missing, the still is simply what stays
 * on screen.
 */
export function HeroVideo({ src }: { src: string }) {
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  // Held back until there are frames to show, so the still is never replaced
  // by a black rectangle while the video buffers.
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!mounted || reducedMotion || failed) return null;

  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      // Decoration: the hero says what it needs to say in the headline, and
      // the footage is silent, so there is nothing here to announce.
      aria-hidden="true"
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      onError={() => setFailed(true)}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
