"use client";

import { useCart } from "@/components/cart/CartProvider";

/**
 * The cart, in the header's own voice.
 *
 * A word rather than an icon: the nav around it is 12px uppercase text —
 * MACHINES, GRINDERS, RESOURCES — and `CART (2)` sits in that row without
 * introducing an icon set the site doesn't otherwise have.
 *
 * `tone` is passed in rather than read from context because the header already
 * works out whether it is sitting on a photograph or on cream.
 */
export function CartButton({ tone }: { tone: "light" | "dark" }) {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      className={`cursor-pointer text-xs font-medium tracking-wide uppercase transition-opacity hover:opacity-70 ${
        tone === "light" ? "text-cream" : "text-espresso"
      }`}
    >
      Cart
      {count > 0 && <span className="ml-1 tabular-nums">({count})</span>}
    </button>
  );
}
