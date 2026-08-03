"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { Editable } from "@/components/edit/Editable";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

/** How long a card holds the front of the deck before the next one steps up. */
const ROTATE_MS = 4200;

/**
 * Where a card sits, by its depth in the deck: index 0 is the card at the
 * front, the rest are the ones peeking out behind it. Anything deeper than
 * this is parked (below), which is where the outgoing front card goes — the
 * deck always keeps one card out of sight so a card can travel back to the
 * bottom of the stack without flying across the others in view.
 *
 * `step` counts offsets rather than fixing a distance, because how far apart
 * the cards fan is a `--deck-x` / `--deck-y` pair set in the markup: the deck
 * is wide and short on phones, tall and narrow above that.
 */
const DEPTHS = [
  { step: 0, rotate: 0, scale: 1, opacity: 1 },
  { step: 1, rotate: 3, scale: 0.95, opacity: 1 },
  { step: 2, rotate: 6, scale: 0.9, opacity: 1 },
];

const PARKED = { step: 2.8, rotate: 9, scale: 0.86, opacity: 0 };

function placementStyle({ step, rotate, scale, opacity }: (typeof DEPTHS)[number]) {
  return {
    transform: `translate(calc(var(--deck-x) * ${step}), calc(var(--deck-y) * ${step})) rotate(${rotate}deg) scale(${scale})`,
    opacity,
  };
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    // The server has no opinion on the visitor's motion preference; assuming
    // "no preference" matches the markup the client renders on first paint.
    () => false,
  );
}

/**
 * A stack of featured machines in the hero, cycling on a loop so each card
 * takes its turn at the front. Every card links to its product page; the ones
 * behind the front card are inert, since they are decoration until their turn
 * comes round.
 *
 * The products come from Shopify (see `getHeroMachines`) — this component only
 * decides how they are shown.
 */
export function HeroProductDeck({ products, eyebrow }: { products: Product[]; eyebrow: string }) {
  const [front, setFront] = useState(0);
  // Held while the deck is under the pointer or has keyboard focus inside it,
  // so a card can't slide away mid-click or mid-read.
  const [held, setHeld] = useState(false);
  // Picking a card by hand hands the deck over: it stops rotating rather than
  // pulling the card the visitor chose back out from under them.
  const [taken, setTaken] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const rotating = products.length > 1 && !held && !taken && !reducedMotion;

  useEffect(() => {
    if (!rotating) return;
    // A timeout rather than an interval, keyed on the card in front, so a card
    // selected by hand still gets a full turn before the loop moves on.
    const timer = setTimeout(
      () => setFront((current) => (current + 1) % products.length),
      ROTATE_MS,
    );
    return () => clearTimeout(timer);
  }, [rotating, front, products.length]);

  // Nothing to show if the catalog has no photographed machines — the hero
  // reads fine without the deck.
  if (products.length === 0) return null;

  // The deepest card is always the parked one, so a two-card deck shows one
  // card at a time and a full deck shows three. A lone card has nowhere to
  // rotate to and simply stays at the front.
  const visibleDepths = Math.max(1, Math.min(products.length - 1, DEPTHS.length));

  return (
    <div
      // The hero is a fixed-height section, so on phones the deck lies down —
      // wide, short cards with the photo beside the name — and only stands up
      // into full tiles once there is height to spare.
      className="w-[13.5rem] shrink-0 [--deck-x:0.75rem] [--deck-y:-0.5rem] sm:w-60 sm:[--deck-x:1.25rem] sm:[--deck-y:-0.85rem]"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      {/* Cream on a photograph that is bright in places, so both the label and
          the dots below carry a shadow to stay legible wherever they land. */}
      <p className="mb-3 hidden text-xs font-medium tracking-wide text-cream uppercase [text-shadow:0_1px_12px_rgba(20,12,6,0.9)] sm:block">
        <Editable path="hero.featured.eyebrow">{eyebrow}</Editable>
      </p>

      {/* Fixed height because the cards are stacked on top of each other, so
          none of them is in the flow to give the stack its size. */}
      <div className="relative h-[5.5rem] sm:h-[18.5rem]">
        {products.map((product, index) => {
          const depth = (index - front + products.length) % products.length;
          const isFront = depth === 0;
          const placement = depth < visibleDepths ? DEPTHS[depth] : PARKED;
          const image = product.images[0];

          return (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              inert={!isFront}
              style={{ ...placementStyle(placement), zIndex: products.length - depth }}
              className="absolute inset-0 flex overflow-hidden bg-cream shadow-[0_1.5rem_3rem_-1rem_rgba(20,12,6,0.55)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_1.75rem_3.5rem_-1rem_rgba(20,12,6,0.65)] sm:flex-col"
            >
              <SiteImage
                // The card names the product right beside it, so the photo
                // adds nothing for a screen reader to read out again.
                src={image?.url ?? null}
                alt=""
                label={product.title}
                className="relative aspect-square h-full shrink-0 sm:aspect-[5/4] sm:h-auto sm:w-full"
                sizes="(min-width: 640px) 240px, 88px"
                fit="contain"
                padding="p-2 sm:p-4"
              />
              <div className="flex flex-1 flex-col justify-center gap-0.5 px-3 py-2 sm:px-4 sm:py-3">
                <p className="truncate text-[0.625rem] font-medium tracking-wide text-taupe uppercase">
                  {product.vendor}
                </p>
                <p className="line-clamp-2 text-xs leading-snug font-medium text-espresso sm:text-sm">
                  {product.title}
                </p>
                <p className="text-[0.6875rem] text-espresso/60 sm:text-xs">
                  From {formatMoney(product.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length > 1 && (
        <div className="mt-3 flex gap-1.5 sm:mt-4 sm:gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                setFront(index);
                setTaken(true);
              }}
              aria-label={`Show ${product.title}`}
              aria-current={index === front}
              className={`h-[3px] w-5 cursor-pointer shadow-[0_1px_5px_rgba(20,12,6,0.8)] transition-colors sm:w-6 ${
                index === front ? "bg-cream" : "bg-cream/40 hover:bg-cream/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
