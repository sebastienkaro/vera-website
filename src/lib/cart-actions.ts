"use server";

import { cookies } from "next/headers";
import { shopifyConfigured } from "@/lib/shopify";
import {
  addCartLine,
  createCart,
  fetchCart,
  removeCartLines,
  updateCartLineQuantity,
} from "@/lib/shopify-cart";
import type { Cart, CartResult } from "@/lib/types";

/**
 * Everything the browser is allowed to do to a cart.
 *
 * The Storefront token is server-only — deliberately not prefixed with
 * `NEXT_PUBLIC_`, so it never reaches the bundle (see `.env.example`) — which
 * means the browser cannot talk to Shopify itself. These four functions are the
 * entire surface, and each returns the cart it ended up with so the client
 * re-renders from one source of truth instead of patching its own copy.
 *
 * Two rules hold this together, and both matter:
 *
 * 1. **The cart's id is read from an httpOnly cookie and never accepted as an
 *    argument.** That is the whole authorization model — a caller can only ever
 *    reach the cart their own browser holds.
 * 2. **Server Actions are reachable by direct POST**, not only through this
 *    site's buttons, so every argument below is validated here rather than
 *    trusted, and nothing Shopify says is passed back verbatim: its messages
 *    can name the store or the API version, so they are logged and replaced.
 */

/**
 * Where a visitor's cart id is kept. Only the id — the cart itself lives on
 * Shopify. `httpOnly` because nothing in the browser needs to read it, and a
 * cart id is a capability: anyone holding it can see and change that cart.
 *
 * `sameSite: "lax"` rather than `"strict"` on purpose. A visitor comes back
 * from Shopify's hosted checkout by top-level navigation, and `strict` would
 * withhold the cookie on that hop — their cart would look emptied.
 */
const CART_COOKIE = "vera_cart";

/**
 * Shopify drops an idle cart after about ten days. Holding the cookie a little
 * longer costs nothing: an id it no longer knows simply reads back as no cart.
 */
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

/** More than anyone buys of one thing here, and a ceiling on a hostile caller. */
const MAX_QUANTITY = 99;

/** Shown instead of Shopify's own wording, which isn't ours to forward. */
const GENERIC_ERROR = "Something went wrong with the cart. Please try again.";
const UNAVAILABLE_ERROR = "The cart is unavailable right now.";

/**
 * Shopify ids arrive as `gid://shopify/ProductVariant/123`. Checking the shape
 * keeps a caller from pointing these actions at some other kind of object.
 */
function isGid(value: unknown, type: string): value is string {
  return typeof value === "string" && value.startsWith(`gid://shopify/${type}/`);
}

function toQuantity(value: unknown, { min }: { min: number }): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(MAX_QUANTITY, Math.max(min, Math.floor(value)));
}

async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

async function writeCartId(id: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

async function clearCartId(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

/**
 * Runs one cart operation with the failure handling every one of them needs:
 * an unconfigured store, and anything Shopify throws — a refused line, a
 * network blip — turned into a sentence the drawer can show, with the real
 * error left in the server log where it belongs.
 */
async function attempt(operation: () => Promise<Cart | null>): Promise<CartResult> {
  if (!shopifyConfigured()) {
    console.error("Cart unavailable: Shopify Storefront credentials are not configured.");
    return { cart: null, error: UNAVAILABLE_ERROR };
  }

  try {
    return { cart: await operation(), error: null };
  } catch (error) {
    console.error("Cart operation failed", error);
    return { cart: null, error: GENERIC_ERROR };
  }
}

/**
 * The visitor's cart, or no cart if they haven't started one.
 *
 * This is what the drawer calls once it reaches the browser. It is deliberately
 * an action rather than something read while rendering: reading a cookie during
 * render would opt every page into dynamic rendering, and the catalog pages are
 * prerendered.
 */
export async function getCart(): Promise<CartResult> {
  const id = await readCartId();
  if (!id) return { cart: null, error: null };

  return attempt(async () => {
    const cart = await fetchCart(id);
    // The id outlived the cart — expired, or already checked out. Forget it so
    // the next add starts cleanly.
    if (!cart) await clearCartId();
    return cart;
  });
}

/**
 * Adds a variant, starting a cart if there isn't one.
 *
 * A cookie can outlive the cart it points at: Shopify drops idle carts, and a
 * completed checkout retires one. Both come back as no cart, and both are
 * answered the same way — start a fresh cart, so the visitor sees an add that
 * simply worked.
 */
export async function addToCart(merchandiseId: unknown, quantity: unknown = 1): Promise<CartResult> {
  if (!isGid(merchandiseId, "ProductVariant")) return getCart();
  const amount = toQuantity(quantity, { min: 1 });

  return attempt(async () => {
    const existingId = await readCartId();
    if (existingId) {
      const cart = await addCartLine(existingId, merchandiseId, amount);
      if (cart) return cart;
    }

    const cart = await createCart(merchandiseId, amount);
    if (cart) await writeCartId(cart.id);
    return cart;
  });
}

/** Sets a line's quantity. Zero removes the line, which is Shopify's own rule. */
export async function updateCartLine(lineId: unknown, quantity: unknown): Promise<CartResult> {
  if (!isGid(lineId, "CartLine")) return getCart();

  return attempt(async () => {
    const id = await readCartId();
    if (!id) return null;

    const cart = await updateCartLineQuantity(id, lineId, toQuantity(quantity, { min: 0 }));
    if (!cart) await clearCartId();
    return cart;
  });
}

export async function removeCartLine(lineId: unknown): Promise<CartResult> {
  if (!isGid(lineId, "CartLine")) return getCart();

  return attempt(async () => {
    const id = await readCartId();
    if (!id) return null;

    const cart = await removeCartLines(id, [lineId]);
    if (!cart) await clearCartId();
    return cart;
  });
}
