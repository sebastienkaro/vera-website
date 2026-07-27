import { storefrontFetch } from "@/lib/shopify/client";
import { getShopifyConfig, TAGS, type ShopifyConfig } from "@/lib/shopify/config";
import { normalizeProduct } from "@/lib/shopify/normalize";
import { PRODUCT_QUERY, PRODUCTS_QUERY, SHOP_QUERY } from "@/lib/shopify/queries";
import type { ProductQueryResult, ProductsQueryResult, ShopQueryResult } from "@/lib/shopify/types";
import type { Product } from "@/lib/types";

export { ShopifyError } from "@/lib/shopify/client";
export { getShopifyConfig, isShopifyConfigured, TAGS } from "@/lib/shopify/config";

/** Storefront API caps `first` at 250. */
const PAGE_SIZE = 250;

/** Guards against an unbounded loop if `pageInfo` ever misbehaves. */
const MAX_PAGES = 20;

function specsIdentifiers(config: ShopifyConfig) {
  return [{ namespace: config.specsMetafield.namespace, key: config.specsMetafield.key }];
}

/**
 * Fetches the whole catalog, following the cursor so stores with more than one
 * page aren't silently truncated.
 */
export async function fetchShopifyProducts(): Promise<Product[]> {
  const config = getShopifyConfig();
  if (!config) return [];

  const products: Product[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data: ProductsQueryResult = await storefrontFetch<ProductsQueryResult>({
      query: PRODUCTS_QUERY,
      variables: { first: PAGE_SIZE, after, specsIdentifiers: specsIdentifiers(config) },
      tags: [TAGS.products],
      config,
    });

    for (const node of data.products.nodes) {
      products.push(normalizeProduct(node, config.specsMetafield));
    }

    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
    if (!after) break;
  }

  return products;
}

/** Returns `undefined` for handles the store doesn't publish, so callers 404. */
export async function fetchShopifyProduct(handle: string): Promise<Product | undefined> {
  const config = getShopifyConfig();
  if (!config) return undefined;

  const data = await storefrontFetch<ProductQueryResult>({
    query: PRODUCT_QUERY,
    variables: { handle, specsIdentifiers: specsIdentifiers(config) },
    // Tagged both ways so a single product webhook can drop just this entry
    // while a bulk change can drop the whole catalog.
    tags: [TAGS.products, TAGS.product(handle)],
    config,
  });

  return data.product ? normalizeProduct(data.product, config.specsMetafield) : undefined;
}

/**
 * Verifies the credentials reach a real storefront. Used by
 * `npm run shopify:check` to tell a bad token apart from an empty catalog.
 */
export async function fetchShopInfo(): Promise<{ name: string; url: string }> {
  const data = await storefrontFetch<ShopQueryResult>({ query: SHOP_QUERY });
  return { name: data.shop.name, url: data.shop.primaryDomain.url };
}
