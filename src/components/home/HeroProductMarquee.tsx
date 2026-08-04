import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

/**
 * How wide one card is, plus the gap after it, in pixels — the step the strip
 * moves by. Kept in step with `w-[18rem]` and `mr-4` on the card below.
 */
const CARD_STEP_PX = 304;

/**
 * How fast the strip travels, in pixels per second. Slow enough to read a card
 * as it goes by, and the same speed whatever the catalog holds — the duration
 * below is worked out from the distance, not fixed.
 */
const SPEED_PX_PER_SECOND = 42;

/**
 * A strip of featured machines running along the bottom of the hero, looping
 * end to end.
 *
 * The loop is one CSS animation on the whole strip: the products are laid out
 * several times over, and the strip slides left by exactly one of those copies
 * before snapping back — which lands every card exactly where its twin was, so
 * the seam never shows. The copies behind the first are `inert`: they are the
 * same links twice over, and only the first set should be reachable.
 *
 * Nothing here is interactive beyond the links, so this stays a server
 * component — hovering pauses the strip in CSS, and a visitor who asked for
 * less motion gets a strip they can scroll by hand instead.
 */
export function HeroProductMarquee({ products }: { products: Product[] }) {
  // The hero reads fine without the strip if the catalog has no photographed
  // machines to put in it.
  if (products.length === 0) return null;

  // The animation slides the strip by one copy, so the copies left behind have
  // to cover the window on their own — two of them, for a strip of eight cards,
  // is around 4700px. A short catalog gets an extra copy to make up the width.
  const copies = products.length >= 6 ? 3 : 4;
  const duration = (products.length * CARD_STEP_PX) / SPEED_PX_PER_SECOND;

  return (
    <div
      // The hero is exactly one screen tall and clips what doesn't fit, and the
      // strip is the last thing in the column, so it is what spills when the
      // window is short: the headline above it is set in `vw`, so a wide, short
      // window spends the screen's height on type. Measured across widths, the
      // strip stops fitting below `340px + 20% of the window's width` — the
      // hero's padding, three lines of headline, the call to action, and the
      // strip itself, added up. A media query can only ask about height and
      // width separately, so it takes a step per width band to trace that line;
      // re-measure the steps if the hero's type or spacing change.
      className="group relative z-20 w-full [@media(max-height:600px)]:hidden [@media(min-width:1310px)_and_(max-height:650px)]:hidden [@media(min-width:1560px)_and_(max-height:700px)]:hidden [@media(min-width:1810px)_and_(max-height:750px)]:hidden [@media(min-width:2060px)_and_(max-height:860px)]:hidden [@media(min-width:2610px)_and_(max-height:1030px)]:hidden"
    >
      {/* The strip sits over whatever frame of the footage happens to be
          playing, so it brings its own soft floor of shade with it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 bottom-[-2.5rem] bg-gradient-to-t from-espresso/60 via-espresso/25 to-transparent"
      />

      <div className="relative overflow-hidden py-1 motion-reduce:overflow-x-auto">
        <div
          style={
            {
              "--marquee-duration": `${duration}s`,
              "--marquee-shift": `-${100 / copies}%`,
            } as React.CSSProperties
          }
          // `will-change` is what keeps the travel smooth: it hands the strip
          // to the compositor as a texture up front, so the cards are drawn
          // once and then moved — including between whole pixels. Without it
          // the text is re-rasterised on the main thread every frame and snaps
          // to the pixel grid, which at this speed reads as a stutter.
          className="flex w-max transform-gpu animate-[hero-marquee_var(--marquee-duration)_linear_infinite] will-change-transform group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:will-change-auto"
        >
          {Array.from({ length: copies }, (_, copy) =>
            products.map((product) => (
              <Link
                key={`${copy}-${product.id}`}
                href={`/products/${product.handle}`}
                inert={copy > 0}
                // A light blur rather than a deep one: the backdrop is a video
                // that changes every frame, so every pixel of blur is paid for
                // again on each one, and a wide radius is what makes the strip
                // stutter as it travels.
                className="mr-4 flex h-20 w-[18rem] shrink-0 items-center gap-4 overflow-hidden rounded-xl border border-cream/20 bg-cream/12 pr-4 backdrop-blur-sm transition-colors duration-300 hover:border-cream/45 hover:bg-cream/25"
              >
                {/* The photo keeps a solid panel of its own, flush to the end
                    of the card: the catalog shoots on white, and a product cut
                    out against the footage would read as a hole in the strip
                    rather than a machine. */}
                <div className="relative h-full w-20 shrink-0 bg-cream">
                  <SiteImage
                    src={product.images[0]?.url ?? null}
                    alt=""
                    label={product.title}
                    className="absolute inset-0"
                    fit="contain"
                    padding="p-2"
                    sizes="80px"
                  />
                </div>

                <div className="min-w-0 flex-1 py-2">
                  <p className="line-clamp-2 text-[0.8125rem] leading-tight font-medium text-cream">
                    {product.title}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-cream/65">
                    From {formatMoney(product.price)}
                  </p>
                </div>
              </Link>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
