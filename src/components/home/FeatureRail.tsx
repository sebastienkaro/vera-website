"use client";

import { useEffect, useRef, useState } from "react";
import { SiteImage } from "@/components/SiteImage";
import { Editable } from "@/components/edit/Editable";
import { EditableImage } from "@/components/edit/EditableImage";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export type RailItem = {
  // Where this card lives in the content, e.g. `whyVera.blocks.0`, so its text
  // and photo can be edited in place.
  path: string;
  // Already resolved by the caller — see `resolveRef` in `lib/content`. `null`
  // means "no file there", and `SiteImage` shows the placeholder.
  src: string | null;
  alt: string;
  label: string;
  heading: string;
  body: string;
};

/**
 * How each card is sized and how far it sits off the centre line, cycled by
 * position so the row reads as an editorial spread rather than a run of
 * identical tiles. Widths are in `vh` rather than `rem` so that a card — whose
 * height follows from its width and aspect — always fits the pinned viewport,
 * however short that viewport is.
 *
 * Written out as whole class strings because Tailwind only generates the
 * utilities it can see spelled out in the source.
 */
const CARD_LAYOUTS = [
  { card: "w-[87vh] max-w-[80vw]", image: "aspect-[3/2]", shift: "-translate-y-[3vh]" },
  { card: "w-[88vh] max-w-[80vw]", image: "aspect-[4/3]", shift: "translate-y-[4vh]" },
  { card: "w-[78vh] max-w-[80vw]", image: "aspect-[3/2]", shift: "-translate-y-[2vh]" },
];

/** What a card looks like on a phone, where every card is sized the same. */
const MOBILE_LAYOUT = { card: "w-[78vw]", image: "aspect-[3/2]", shift: "" };

/**
 * The "why Vera" cards, read as one horizontal row driven by vertical scroll:
 * the section pins to the viewport and the row slides left by exactly as far
 * as it overflows, so the last card lands as the section releases.
 *
 * The rail only hijacks scrolling where that makes sense. On a phone — and for
 * anyone who has asked for reduced motion — it falls back to a row you swipe
 * yourself, with no pinning and no transform.
 */
export function FeatureRail({ items }: { items: RailItem[] }) {
  const spacer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // Mirrors `distance` for the scroll handler, which needs the current value
  // without being torn down and rebuilt every time the measurement changes.
  const overflow = useRef(0);
  const [distance, setDistance] = useState(0);
  const [offset, setOffset] = useState(0);

  const wideEnough = useMediaQuery("(min-width: 640px)");
  const reducedMotion = usePrefersReducedMotion();
  const pinned = wideEnough && !reducedMotion;

  useEffect(() => {
    // Nothing to measure or move while the row is scrolled by hand. Whatever
    // the last measurement was is left alone: the branch below renders none of
    // it, and re-pinning measures again from scratch.
    if (!pinned) return;

    let frame = 0;

    // How far the row sticks out past the right edge of the window — the whole
    // distance it has to travel, and the extra scrolling the spacer has to buy
    // to cover it.
    function measure() {
      const el = track.current;
      if (!el) return;
      overflow.current = Math.max(0, el.scrollWidth - window.innerWidth);
      setDistance(overflow.current);
      update();
    }

    // `-top` is how far the section has scrolled past the top of the window,
    // which is exactly how far the sticky row has been held in place.
    function update() {
      const box = spacer.current;
      if (!box) return;
      const scrolled = -box.getBoundingClientRect().top;
      setOffset(Math.max(0, Math.min(scrolled, overflow.current)));
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    measure();

    // The row's width changes with the window, but also once more on its own
    // when the webfont swaps in and the captions re-wrap.
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const cards = items.map((item, i) => (
    <RailCard
      key={i}
      item={item}
      index={i}
      layout={pinned ? CARD_LAYOUTS[i % CARD_LAYOUTS.length] : MOBILE_LAYOUT}
    />
  ));

  if (!pinned) {
    return (
      <div className="flex snap-x snap-mandatory gap-10 overflow-x-auto px-8 pb-16 sm:px-12">
        {cards}
      </div>
    );
  }

  return (
    <div ref={spacer} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          ref={track}
          className="flex items-center gap-16 px-8 will-change-transform sm:px-12"
          style={{ transform: `translate3d(${-offset}px, 0, 0)` }}
        >
          {cards}
        </div>
      </div>
    </div>
  );
}

function RailCard({
  item,
  index,
  layout,
}: {
  item: RailItem;
  index: number;
  // `card` fixes the width — the photo fills it and the caption wraps inside
  // it, so a card is never wider than its own picture. `image` is the photo's
  // aspect, which is what decides the card's height.
  layout: { card: string; image: string; shift: string };
}) {
  return (
    <figure className={`flex flex-none snap-start flex-col ${layout.card} ${layout.shift}`}>
      <EditableImage
        path={`${item.path}.background`}
        previewClassName={`relative w-full object-cover ${layout.image}`}
      >
        <SiteImage
          src={item.src}
          alt={item.alt}
          label={item.label}
          className={`relative w-full ${layout.image}`}
          sizes="(min-width: 640px) 77vh, 78vw"
        />
      </EditableImage>

      <figcaption className="mt-6 flex max-w-lg items-start gap-6">
        {/* Set like the section eyebrows elsewhere on the page — small, tight
            and semibold — with the line box matched to the heading beside it so
            the two sit on the same line. */}
        <span className="text-xs leading-7 font-semibold tracking-[-0.02em] text-taupe sm:leading-8">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="text-xl font-medium text-espresso sm:text-2xl">
            <Editable path={`${item.path}.heading`}>{item.heading}</Editable>
          </h3>
          <p className="mt-2 text-base text-espresso/70">
            <Editable path={`${item.path}.body`}>{item.body}</Editable>
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
