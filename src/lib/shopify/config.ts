/**
 * Shopify Storefront API configuration, read from the environment.
 *
 * The site runs with or without these set: when `SHOPIFY_STORE_DOMAIN` and
 * `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are both present the catalog comes from
 * Shopify, otherwise `@/lib/products` falls back to the local mock catalog so
 * `next dev` and `next build` still work on a fresh clone.
 */

/**
 * Shopify ships a new API version quarterly and supports each one for a year.
 * This is the version `@shopify/hydrogen-react` targets, which is the closest
 * thing to a "known good" marker Shopify publishes to npm. Override it with
 * `SHOPIFY_STOREFRONT_API_VERSION` when you move the store forward.
 */
export const DEFAULT_API_VERSION = "2026-04";

/** Where product specs live if the store hasn't overridden it. */
export const DEFAULT_SPECS_METAFIELD = "custom.specs";

export type MetafieldIdentifier = {
  namespace: string;
  key: string;
};

export type ShopifyConfig = {
  domain: string;
  accessToken: string;
  apiVersion: string;
  endpoint: string;
  /** Metafield holding the spec table shown on the product page. */
  specsMetafield: MetafieldIdentifier;
};

/** Accepts `vera.myshopify.com` or `https://vera.myshopify.com/` alike. */
function normalizeDomain(value: string): string {
  return value.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/** Parses a `namespace.key` pair, e.g. `custom.specs`. */
function parseMetafieldIdentifier(value: string, fallback: string): MetafieldIdentifier {
  const source = value.trim() || fallback;
  const separator = source.indexOf(".");
  if (separator <= 0 || separator === source.length - 1) {
    throw new Error(
      `Invalid metafield identifier "${source}". Expected "namespace.key", e.g. "${fallback}".`,
    );
  }
  return {
    namespace: source.slice(0, separator),
    key: source.slice(separator + 1),
  };
}

/**
 * Returns the Shopify config, or `null` when the store credentials aren't set.
 * Callers treat `null` as "not connected yet" rather than as an error.
 */
export function getShopifyConfig(): ShopifyConfig | null {
  const domain = normalizeDomain(process.env.SHOPIFY_STORE_DOMAIN ?? "");
  const accessToken = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "").trim();

  if (!domain || !accessToken) return null;

  const apiVersion = (process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "").trim() || DEFAULT_API_VERSION;

  return {
    domain,
    accessToken,
    apiVersion,
    endpoint: `https://${domain}/api/${apiVersion}/graphql.json`,
    specsMetafield: parseMetafieldIdentifier(
      process.env.SHOPIFY_SPECS_METAFIELD ?? "",
      DEFAULT_SPECS_METAFIELD,
    ),
  };
}

export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}

/**
 * How long a cached Storefront response is served before Next revalidates it
 * in the background. Product edits also arrive immediately over the webhook in
 * `src/app/api/shopify/revalidate/route.ts`; this is the safety net for stores
 * that haven't set the webhook up.
 */
export function getRevalidateSeconds(): number {
  const raw = (process.env.SHOPIFY_REVALIDATE_SECONDS ?? "").trim();
  if (!raw) return 3600;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3600;
}

/** Cache tags used to revalidate Storefront responses on demand. */
export const TAGS = {
  products: "shopify:products",
  product: (handle: string) => `shopify:product:${handle}`,
} as const;
