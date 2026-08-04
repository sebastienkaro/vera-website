"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CartLineRow } from "@/components/cart/CartLineRow";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";

/**
 * The cart, as a panel over whatever the visitor was looking at.
 *
 * A drawer rather than a page on purpose: adding a machine to the cart is not a
 * reason to leave the shelf you were browsing. It portals to `document.body` —
 * the same approach as the header's mobile menu — so no page's stacking or
 * `overflow: hidden` can clip it.
 *
 * Mounted once, by `CartProvider`, so it can't be forgotten on a new page.
 */
export function CartDrawer() {
  const { cart, isOpen, close, hydrated, pending, error } = useCart();
  const mounted = useMounted();
  const closeButton = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    // Focus moves into the panel so the keyboard follows the eye, and so Escape
    // reaches the handler above without the visitor clicking first.
    closeButton.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  if (!mounted) return null;

  const lines = cart?.lines ?? [];

  return createPortal(
    <div
      // Above the sticky header (`z-50`) and the mobile menu's own portal
      // (`z-40`), both of which the drawer has to cover.
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-espresso/40 transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label="Cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-[0_0_3rem_rgba(20,12,6,0.35)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
          <h2 className="text-xs font-medium tracking-wide text-espresso uppercase">Your Cart</h2>
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="text-xs tracking-wide text-taupe uppercase transition-colors hover:text-espresso"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {error && (
            <p className="mt-6 border border-espresso/15 bg-sand px-4 py-3 text-sm text-espresso/80">
              {error}
            </p>
          )}

          {lines.length > 0 ? (
            <ul>
              {lines.map((line) => (
                <CartLineRow key={line.id} line={line} />
              ))}
            </ul>
          ) : (
            !error && (
              <div className="flex h-full flex-col items-center justify-center gap-6 py-16 text-center">
                <p className="text-sm text-espresso/60">
                  {hydrated ? "Your cart is empty." : "Loading your cart…"}
                </p>
                {hydrated && (
                  <Link
                    href="/machines"
                    onClick={close}
                    className="border border-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-colors hover:bg-espresso hover:text-cream"
                  >
                    Browse Machines
                  </Link>
                )}
              </div>
            )
          )}
        </div>

        {cart && lines.length > 0 && (
          <div className="border-t border-espresso/10 px-6 py-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium tracking-wide text-espresso uppercase">
                Subtotal
              </span>
              {/* Dimmed rather than recalculated while a change is in flight:
                  the total is Shopify's to work out, discounts and all. */}
              <span className={`text-lg tabular-nums text-espresso ${pending ? "opacity-40" : ""}`}>
                {formatMoney(cart.subtotal)}
              </span>
            </div>
            <p className="mt-2 text-xs text-espresso/60">
              Shipping and taxes calculated at checkout.
            </p>

            {/* A plain anchor: checkout is Shopify's, on another origin, so
                there is nothing here for `next/link` to prefetch or route. */}
            <a
              href={cart.checkoutUrl}
              className="mt-5 block bg-espresso px-6 py-3.5 text-center text-xs font-medium tracking-wide text-cream uppercase transition-opacity hover:opacity-90"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
