"use client";

import { useEffect, useRef, useState } from "react";

const BLEED = 96;
const SPEED = 0.15;

/**
 * Shifts its children vertically by a fraction of how far the section has
 * scrolled from viewport-center, so the background drifts slower than the
 * foreground content stacked on top of it. `BLEED` over-extends the child
 * top/bottom so that drift never uncovers empty space at the section edges.
 */
export function ParallaxBackground({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const raw = (elementCenter - viewportCenter) * SPEED;
      setOffset(Math.max(-BLEED, Math.min(BLEED, raw)));
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-x-0"
        style={{ top: -BLEED, bottom: -BLEED, transform: `translateY(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
