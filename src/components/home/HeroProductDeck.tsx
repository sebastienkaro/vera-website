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
 * `step` counts offsets rather than fixing a distance, because the deck is
 * sized off the viewport height (see `--deck-x` / `--deck-y` in the markup) so
 * that a short window shrinks it instead of pushing it out of the hero.
 */
const DEPTHS = [
  { step: 0, rotate: -3, scale: 1, opacity: 1 },
  { step: 1, rotate: 2, scale: 0.97, opacity: 1 },
  { step: 2, rotate: 7, scale: 0.94, opacity: 1 },
];

const PARKED = { step: 2.9, rotate: 11, scale: 0.92, opacity: 0 };

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
 * The cards carry nothing but the photograph — the name and price sit under
 * the stack, for the card in front — so the deck reads as a pile of prints
 * rather than a stack of spec sheets.
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
  const current = products[front];

  return (
    <div
      // The hero is exactly one screen tall and clips what doesn't fit, so the
      // deck is measured in `vh` between a floor and a ceiling: a short window
      // shrinks the cards rather than pushing the stack out of view.
      //
      // Past a point that stops being enough. The headline is sized in `vw`,
      // so a wide, short window spends the hero's height on type and leaves
      // the deck nothing — and the deck is the tallest thing in the bottom
      // band, so it is what spills. The three queries below are where
      // measurement put that edge, per width, and drop the deck rather than
      // show a card sliced off at the fold.
      // `--deck-x` / `--deck-y` are percentages so the fan scales with the
      // cards: a translate percentage resolves against the element's own size,
      // and the cards are sized off the viewport.
      className="w-[clamp(6rem,16vh,9.5rem)] shrink-0 [--deck-x:10%] [--deck-y:-4.5%] [@media(max-height:660px)]:hidden [@media(min-width:1400px)_and_(max-height:700px)]:hidden [@media(min-width:1700px)_and_(max-height:800px)]:hidden"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      {/* Cream on a photograph that is bright in places, so the label, the
          caption and the dots all carry a shadow to stay legible. */}
      {/* The label and the caption are wider than the cards and run on past
          them, rather than wrapping inside a stack only a few inches across. */}
      <p className="mb-3 hidden text-xs font-medium tracking-wide whitespace-nowrap text-cream uppercase [text-shadow:0_1px_12px_rgba(20,12,6,0.9)] sm:block">
        <Editable path="hero.featured.eyebrow">{eyebrow}</Editable>
      </p>

      {/* Square, because the catalog's product shots are square — so the photo
          fills the card edge to edge without cropping anything off it. */}
      <div className="relative aspect-square">
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
              // The card is all photograph, so the link needs a name of its own.
              aria-label={`${product.vendor} ${product.title}`}
              style={{ ...placementStyle(placement), zIndex: products.length - depth }}
              className="absolute inset-0 overflow-hidden rounded-xl bg-cream shadow-[0_0.6rem_1.75rem_-0.35rem_rgba(20,12,6,0.6)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <SiteImage
                src={image?.url ?? null}
                alt=""
                label={product.title}
                className="absolute inset-0"
                sizes="(min-width: 640px) 160px, 120px"
              />
            </Link>
          );
        })}
      </div>

      <div className="mt-2.5 w-[11rem] sm:w-[13rem] [text-shadow:0_1px_10px_rgba(20,12,6,0.85)]">
        <p className="truncate text-xs font-medium text-cream sm:text-[0.8125rem]">
          {current.title}
        </p>
        <p className="text-[0.6875rem] text-cream/70">From {formatMoney(current.price)}</p>
      </div>

      {products.length > 1 && (
        <div className="mt-2.5 flex gap-1.5">
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
              className={`h-[3px] w-4 cursor-pointer shadow-[0_1px_5px_rgba(20,12,6,0.8)] transition-colors sm:w-5 ${
                index === front ? "bg-cream" : "bg-cream/40 hover:bg-cream/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
