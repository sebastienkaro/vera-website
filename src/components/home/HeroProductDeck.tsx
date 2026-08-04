"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

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

/**
 * A stack of featured machines in the hero, cycling on a loop so each card
 * takes its turn at the front. Every card links to its product page; the ones
 * behind the front card are inert, since they are decoration until their turn
 * comes round.
 *
 * Each card is self-contained — photograph on top, then that machine's name
 * and price on the card itself — so nothing about the deck is written on the
 * hero photograph, and a card can be read as a card.
 *
 * The products come from Shopify (see `getHeroMachines`) — this component only
 * decides how they are shown.
 */
export function HeroProductDeck({ products }: { products: Product[] }) {
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
      // Below `sm` the hero has one column and the deck would sit on top of the
      // headline, so it is a desktop element only.
      //
      // The hero is exactly one screen tall and clips what doesn't fit, so the
      // cards are measured in `vh` between a floor and a ceiling: a short
      // window shrinks them rather than pushing the stack out of view.
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
      className="hidden w-[var(--card-w)] shrink-0 [--card-w:clamp(9rem,23vh,15rem)] [--deck-x:9%] [--deck-y:-4%] sm:block [@media(max-height:700px)]:hidden [@media(min-width:1400px)_and_(max-height:760px)]:hidden [@media(min-width:1700px)_and_(max-height:860px)]:hidden"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      {/* A card is its square photograph plus the caption band under it, so the
          stack is exactly that tall — fixed rather than measured, so every card
          is the same height whether its name runs to one line or two. */}
      <div className="relative h-[calc(var(--card-w)+4.5rem)]">
        {products.map((product, index) => {
          const depth = (index - front + products.length) % products.length;
          const isFront = depth === 0;
          const placement = depth < visibleDepths ? DEPTHS[depth] : PARKED;
          const image = product.images[0];

          return (
            <div
              key={product.id}
              style={{ ...placementStyle(placement), zIndex: products.length - depth }}
              className="absolute inset-0 overflow-hidden rounded-xl bg-cream shadow-[0_0.75rem_2.25rem_-0.4rem_rgba(20,12,6,0.65)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {/* Square, because the catalog's product shots are square — so
                  the photo fills the card's width without cropping anything
                  off it. */}
              <SiteImage
                src={image?.url ?? null}
                alt=""
                label={product.title}
                className="absolute inset-x-0 top-0 h-[var(--card-w)]"
                sizes="240px"
              />

              <div className="absolute inset-x-0 bottom-0 flex h-[4.5rem] items-center gap-2 px-3.5">
                {/* Hidden from assistive tech because the card's link (below)
                    is named with the same words — read out, the caption would
                    otherwise come round twice per card. */}
                <div aria-hidden className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[0.8125rem] leading-snug font-medium text-espresso">
                    {product.title}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] text-espresso/60">
                    From {formatMoney(product.price)}
                  </p>
                </div>

                {/* The deck's controls ride on the front card, so the stack
                    stands alone with nothing printed on the hero photo behind
                    it. They sit above the card's link (below) rather than
                    inside it — a button nested in a link is neither valid nor
                    clickable. */}
                {isFront && products.length > 1 && (
                  <div className="relative z-20 flex shrink-0 flex-col">
                    {products.map((dot, dotIndex) => (
                      <button
                        key={dot.id}
                        type="button"
                        onClick={() => {
                          setFront(dotIndex);
                          setTaken(true);
                        }}
                        aria-label={`Show ${dot.title}`}
                        aria-current={dotIndex === front}
                        // The dot is small, so the button is padded out to
                        // something a finger or a hurried cursor can hit.
                        className="group flex h-4 w-4 cursor-pointer items-center justify-center"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-colors ${
                            dotIndex === front
                              ? "bg-espresso"
                              : "bg-espresso/25 group-hover:bg-espresso/50"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* The whole card is the link. It carries no children, so it
                  needs a name of its own — the card's own caption, said out
                  loud. */}
              <Link
                href={`/products/${product.handle}`}
                inert={!isFront}
                aria-label={`${product.title} — from ${formatMoney(product.price)}`}
                className="absolute inset-0 z-10"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
