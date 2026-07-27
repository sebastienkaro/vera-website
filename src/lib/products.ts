import { getFeaturedShopifyProducts, getShopifyProducts } from "@/lib/shopify";
import { FEATURED_LIMIT, type Product } from "@/lib/types";

/**
 * The app's view of the catalog. Everything here is backed by the Shopify
 * Storefront API — see `src/lib/shopify.ts` for the transport, the collection
 * membership that decides what gets published, and the caching.
 */

export async function getProducts(): Promise<Product[]> {
  return getShopifyProducts();
}

/**
 * The subset shown in the homepage collection grid: products with a photo of
 * their own, up to `FEATURED_LIMIT` per category so each filter tab has a full
 * grid to draw from. The grid renders at most `FEATURED_LIMIT` at a time.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return getFeaturedShopifyProducts(FEATURED_LIMIT);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const products = await getShopifyProducts();
  return products.find((product) => product.handle === handle);
}

/**
 * Products to show alongside `product`. The catalog runs to a few hundred
 * items, so this is narrowed to the same category and capped rather than
 * being "every other product".
 */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getShopifyProducts();
  return products
    .filter((item) => item.category === product.category && item.handle !== product.handle)
    .slice(0, limit);
}
