#!/usr/bin/env node
/**
 * Proves the cart's GraphQL matches the store.
 *
 *     node scripts/cart-smoke.mjs
 *
 * Everything else about the cart can be checked without credentials — the
 * drawer, the optimistic count, the empty and error states. This cannot: the
 * only thing that shows `cartCreate` and its siblings still line up with the
 * schema for the API version the site pins is asking the real store. Run it
 * after changing anything in `src/lib/shopify-cart.ts`, and after a Storefront
 * API version bump.
 *
 * It creates a cart, adds a line, reads it back, changes the quantity, empties
 * it, and prints the checkout URL. Nothing is bought and no order is placed —
 * an abandoned cart costs nothing and Shopify drops it on its own.
 *
 * Reads the same `.env.local` the dev server does.
 */

import { readFileSync } from "node:fs";

const API_VERSION = "2026-04";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Fine — the variables may already be in the environment.
  }
}

loadEnv();

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
if (!domain || !token) {
  console.error(
    "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN.\n" +
      "Copy .env.example to .env.local and fill both in.",
  );
  process.exit(1);
}

async function graphql(query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }
  return body.data;
}

/** The same selection the site asks for, so this exercises the real shape. */
const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } }
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
`;

function check(step, payload) {
  if (payload.userErrors?.length) {
    throw new Error(`${step}: ${payload.userErrors.map((e) => e.message).join("; ")}`);
  }
  if (!payload.cart) throw new Error(`${step}: no cart came back`);
  return payload.cart;
}

async function main() {
  console.log(`Store    ${domain}`);
  console.log(`API      ${API_VERSION}\n`);

  // A real, purchasable variant, taken from the same collections the site
  // publishes from — so this fails loudly if the store has none.
  const { collection } = await graphql(
    `
      query FirstVariant {
        collection(handle: "machines") {
          products(first: 5) {
            nodes {
              title
              variants(first: 5) { nodes { id title availableForSale } }
            }
          }
        }
      }
    `,
  );

  const candidate = collection?.products.nodes
    .flatMap((product) =>
      product.variants.nodes.map((variant) => ({ product: product.title, ...variant })),
    )
    .find((variant) => variant.availableForSale);

  if (!candidate) {
    console.error("No purchasable variant found in the `machines` collection — nothing to test with.");
    process.exit(1);
  }
  console.log(`Using    ${candidate.product} — ${candidate.title}\n`);

  const created = check(
    "cartCreate",
    (
      await graphql(
        `mutation ($lines: [CartLineInput!]) {
          cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { lines: [{ merchandiseId: candidate.id, quantity: 1 }] },
      )
    ).cartCreate,
  );
  console.log(`cartCreate           ok — ${created.totalQuantity} item, ${created.cost.subtotalAmount.amount} ${created.cost.subtotalAmount.currencyCode}`);

  const added = check(
    "cartLinesAdd",
    (
      await graphql(
        `mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { cartId: created.id, lines: [{ merchandiseId: candidate.id, quantity: 1 }] },
      )
    ).cartLinesAdd,
  );
  console.log(`cartLinesAdd         ok — ${added.totalQuantity} items`);

  const { cart: read } = await graphql(`query ($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, {
    id: created.id,
  });
  if (!read) throw new Error("cart query: the cart just created reads back as null");
  const line = read.lines.nodes[0];
  console.log(
    `cart query           ok — ${line.merchandise.product.title} ×${line.quantity}, line ${line.cost.totalAmount.amount}`,
  );

  const updated = check(
    "cartLinesUpdate",
    (
      await graphql(
        `mutation ($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { cartId: created.id, lines: [{ id: line.id, quantity: 3 }] },
      )
    ).cartLinesUpdate,
  );
  console.log(`cartLinesUpdate      ok — ${updated.totalQuantity} items`);

  const emptied = check(
    "cartLinesRemove",
    (
      await graphql(
        `mutation ($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { cartId: created.id, lineIds: [line.id] },
      )
    ).cartLinesRemove,
  );
  console.log(`cartLinesRemove      ok — ${emptied.totalQuantity} items left`);

  // A stale id must read back as null rather than throw — the site relies on
  // that to start a new cart instead of breaking.
  const { cart: stale } = await graphql(`query ($id: ID!) { cart(id: $id) { id } }`, {
    id: "gid://shopify/Cart/does-not-exist",
  });
  console.log(`stale cart id        ${stale === null ? "ok — reads back as null" : "UNEXPECTED: returned a cart"}`);

  console.log(`\ncheckoutUrl          ${created.checkoutUrl}`);
  console.log("\nAll cart operations match the store's schema.");
}

main().catch((error) => {
  console.error(`\nFAILED: ${error.message}`);
  process.exit(1);
});
