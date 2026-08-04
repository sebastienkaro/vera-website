import { storefrontUncached } from "@/lib/shopify";
import type { Cart, CartLine, Money } from "@/lib/types";

/**
 * The Shopify cart, over the Storefront API.
 *
 * A cart lives on Shopify, not here: this module holds its id and asks Shopify
 * to change it. Checkout is Shopify's too — `checkoutUrl` is a link out of this
 * app, so payment, shipping and tax never touch this codebase.
 *
 * Everything here goes through `storefrontUncached`: a cart belongs to one
 * visitor and changes the moment they touch it, so none of it may be cached.
 * See `src/lib/cart-actions.ts` for the Server Actions that call this and for
 * where the cart's id is kept.
 */

/**
 * The shape every query and mutation below asks for, so they all come back the
 * same and map through one function.
 *
 * `lines` is a `BaseCartLineConnection`, whose nodes may be plain cart lines or
 * components of a bundle; `merchandise` is only ever a `ProductVariant` for
 * this store, hence the inline fragment. Costs come from `cost` — the older
 * `estimatedCost` field is deprecated.
 */
const CART_FRAGMENT = `
  fragment CartParts on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url altText }
            product { title handle }
          }
        }
      }
    }
  }
`;

const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) { ...CartParts }
  }
  ${CART_FRAGMENT}
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartParts }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartParts }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartParts }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartParts }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

type ShopifyMoney = { amount: string; currencyCode: string };

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { amountPerQuantity: ShopifyMoney; totalAmount: ShopifyMoney };
      merchandise: {
        id: string;
        title: string;
        image: { url: string; altText: string | null } | null;
        product: { title: string; handle: string };
      };
    }[];
  };
};

type CartMutationPayload = {
  cart: ShopifyCart | null;
  userErrors: { field: string[] | null; message: string }[];
};

/** Shopify's placeholder variant name on products that have only one. */
const PLACEHOLDER_VARIANT_TITLE = "Default Title";

function toMoney(money: ShopifyMoney): Money {
  return { amount: Number.parseFloat(money.amount), currencyCode: money.currencyCode };
}

function toCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: toMoney(cart.cost.subtotalAmount),
    lines: cart.lines.nodes.map(
      (line): CartLine => ({
        id: line.id,
        merchandiseId: line.merchandise.id,
        productTitle: line.merchandise.product.title,
        productHandle: line.merchandise.product.handle,
        variantTitle:
          line.merchandise.title === PLACEHOLDER_VARIANT_TITLE ? null : line.merchandise.title,
        image: line.merchandise.image
          ? {
              url: line.merchandise.image.url,
              alt: line.merchandise.image.altText?.trim() || line.merchandise.product.title,
            }
          : null,
        quantity: line.quantity,
        price: toMoney(line.cost.amountPerQuantity),
        lineTotal: toMoney(line.cost.totalAmount),
      }),
    ),
  };
}

/**
 * Unwraps a mutation payload. A `userErrors` entry is Shopify refusing the
 * change — an unpurchasable variant, a quantity past what's in stock — and is
 * raised rather than swallowed, so the caller can tell the visitor instead of
 * silently doing nothing.
 */
function unwrap(payload: CartMutationPayload, action: string): Cart | null {
  if (payload.userErrors.length > 0) {
    throw new Error(
      `Shopify refused to ${action}: ${payload.userErrors.map((error) => error.message).join("; ")}`,
    );
  }
  return payload.cart ? toCart(payload.cart) : null;
}

/**
 * Reads a cart by id. Returns null when Shopify no longer has it — an id that
 * has expired, been checked out, or was never real — which is the caller's cue
 * to start a new one rather than an error.
 */
export async function fetchCart(id: string): Promise<Cart | null> {
  const data = await storefrontUncached<{ cart: ShopifyCart | null }>(CART_QUERY, { id });
  return data.cart ? toCart(data.cart) : null;
}

export async function createCart(merchandiseId: string, quantity: number): Promise<Cart | null> {
  const data = await storefrontUncached<{ cartCreate: CartMutationPayload }>(
    CART_CREATE_MUTATION,
    { lines: [{ merchandiseId, quantity }] },
  );
  return unwrap(data.cartCreate, "create the cart");
}

export async function addCartLine(
  cartId: string,
  merchandiseId: string,
  quantity: number,
): Promise<Cart | null> {
  const data = await storefrontUncached<{ cartLinesAdd: CartMutationPayload }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [{ merchandiseId, quantity }] },
  );
  return unwrap(data.cartLinesAdd, "add that to the cart");
}

export async function updateCartLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  const data = await storefrontUncached<{ cartLinesUpdate: CartMutationPayload }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  return unwrap(data.cartLinesUpdate, "change that quantity");
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart | null> {
  const data = await storefrontUncached<{ cartLinesRemove: CartMutationPayload }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
  );
  return unwrap(data.cartLinesRemove, "remove that from the cart");
}
