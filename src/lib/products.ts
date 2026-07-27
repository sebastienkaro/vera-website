import { cache } from "react";
import { getMockProduct, getMockProducts } from "@/lib/mock-products";
import { fetchShopifyProduct, fetchShopifyProducts } from "@/lib/shopify";
import { isShopifyConfigured } from "@/lib/shopify/config";
import type { Product } from "@/lib/types";

/**
 * The catalog, from Shopify when the store is connected and from the local
 * placeholder catalog otherwise. Components import from here and don't need to
 * know which is in play.
 *
 * Errors from Shopify are deliberately not caught: once a store is connected,
 * quietly serving placeholder prices in its place would be worse than a build
 * or request that fails loudly.
 *
 * Both functions are wrapped in `React.cache`, so a render pass that needs the
 * catalog in several places (the home grid, related products) pays for it once.
 */

let warnedAboutMockData = false;

function warnOnceAboutMockData() {
  if (warnedAboutMockData) return;
  warnedAboutMockData = true;
  console.warn(
    "[products] SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN are not set — " +
      "serving the placeholder catalog from src/lib/mock-products.ts. See README.md.",
  );
}

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isShopifyConfigured()) {
    warnOnceAboutMockData();
    return getMockProducts();
  }
  return fetchShopifyProducts();
});

export const getProduct = cache(async (handle: string): Promise<Product | undefined> => {
  if (!isShopifyConfigured()) {
    warnOnceAboutMockData();
    return getMockProduct(handle);
  }
  return fetchShopifyProduct(handle);
});
