import { getFeaturedShopifyProducts, getShopifyProducts } from "@/lib/shopify";
import {
  FEATURED_LIMIT,
  HERO_MARQUEE_LIMIT,
  type Product,
  type ProductCategory,
} from "@/lib/types";

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

/**
 * The machines the hero's marquee runs through. Drawn from the same featured
 * selection as the collection grid — so every card is guaranteed a photo of
 * its own rather than the catalog's stock graphic — and narrowed to Machines,
 * which is what the hero is selling.
 */
export async function getHeroMachines(limit = HERO_MARQUEE_LIMIT): Promise<Product[]> {
  const featured = await getFeaturedShopifyProducts(FEATURED_LIMIT);
  return featured.filter((product) => product.category === "machines").slice(0, limit);
}

/**
 * Everything published in one category, in the order Shopify's collection puts
 * it — so merchandising done in the admin carries through to the page.
 *
 * Unlike `getFeaturedProducts` this is the whole category, photo or no photo:
 * the featured selection screens out products wearing the catalog's shared
 * stock graphic, which is right for a shop window and wrong for a shelf. A part
 * nobody has photographed still has to be findable.
 */
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const products = await getShopifyProducts();
  return products.filter((product) => product.category === category);
}

/**
 * The vendor the homepage's featured-machine section looks for. Matched
 * loosely against `vendor`, since Shopify spells it a few ways.
 */
const FEATURED_MACHINE_VENDOR = "la marzocco";

/**
 * Pin the featured machine to one product by putting its handle here. Left
 * null, the section shows whichever La Marzocco machine comes first in the
 * featured selection — which is Shopify's own collection order, so the machine
 * on the homepage can also be chosen by re-ordering the `machines` collection
 * in the admin.
 */
const FEATURED_MACHINE_HANDLE: string | null = null;

/**
 * The single machine the homepage's featured section is built around: a real
 * product, with its own photo, linking through to its own page.
 *
 * Returns undefined if the catalog has no photographed machine at all, in
 * which case the section renders nothing rather than an empty frame.
 */
export async function getFeaturedMachine(): Promise<Product | undefined> {
  if (FEATURED_MACHINE_HANDLE) {
    const pinned = await getProduct(FEATURED_MACHINE_HANDLE);
    if (pinned) return pinned;
  }

  const machines = (await getFeaturedShopifyProducts(FEATURED_LIMIT)).filter(
    (product) => product.category === "machines",
  );

  return (
    machines.find((product) => product.vendor.toLowerCase().includes(FEATURED_MACHINE_VENDOR)) ??
    machines[0]
  );
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
