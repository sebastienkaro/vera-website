import { createHash } from "node:crypto";
import { cache } from "react";
import { splitDescription } from "@/lib/description";
import type {
  Money,
  Product,
  ProductAddOn,
  ProductCategory,
  ProductImage,
  ProductOption,
  ProductVariant,
} from "@/lib/types";

const API_VERSION = "2026-04";

/**
 * How long a Storefront response is served from the data cache before being
 * refetched. Must stay above 0 — `revalidate: 0` opts the request out of the
 * cache entirely, which would put a Storefront round-trip on every render.
 */
const REVALIDATE_SECONDS = 3600;

/** Revalidate every published product on demand with `revalidateTag`. */
export const PRODUCTS_CACHE_TAG = "shopify-products";

/**
 * The collections that back the site's three categories, in precedence order:
 * a product's category is the first entry here whose collection contains it.
 *
 * Order matters because products can sit in several collections at once —
 * upstream, the Mahlkönig EK43 and E65T are in both `machines` and `grinders`,
 * and they belong under Grinders. `la-marzocco-parts` is the store's bulk
 * spare-parts collection and folds into the same category as the small
 * curated `parts-accessories` one.
 *
 * This list is also the site's publish gate: a product in none of these
 * collections does not appear anywhere on the site.
 */
const CATEGORY_COLLECTIONS: { handle: string; category: ProductCategory }[] = [
  { handle: "grinders", category: "grinders" },
  { handle: "machines", category: "machines" },
  { handle: "parts-accessories", category: "parts-accessories" },
  { handle: "la-marzocco-parts", category: "parts-accessories" },
];

/** Display order of the categories, independent of the precedence above. */
const CATEGORY_ORDER: ProductCategory[] = ["machines", "grinders", "parts-accessories"];

/**
 * Shopify gives single-variant products a placeholder option so that every
 * product has at least one. It is not a real choice and must not be rendered
 * as a variant picker.
 */
const PLACEHOLDER_OPTION_NAME = "Title";
const PLACEHOLDER_OPTION_VALUE = "Default Title";

type ShopifyMoney = { amount: string; currencyCode: string };

type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  descriptionHtml: string;
  priceRange: { minVariantPrice: ShopifyMoney };
  images: { nodes: { url: string; altText: string | null }[] };
  options: { name: string; values: string[] }[];
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: ShopifyMoney;
      compareAtPrice: ShopifyMoney | null;
      selectedOptions: { name: string; value: string }[];
    }[];
  };
  addOns: { references: { nodes: ShopifyAddOnProduct[] } | null } | null;
};

/**
 * A product referenced by another product's `custom.add_ons` metafield: the
 * optional extras a machine is offered with. Only the first variant is read —
 * add-ons are single-variant products by construction, since an option that
 * itself needed configuring would belong on the machine's own picker.
 */
type ShopifyAddOnProduct = {
  id: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  variants: {
    nodes: { id: string; availableForSale: boolean; price: ShopifyMoney }[];
  };
};

type CollectionProductsResponse = {
  collection: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ShopifyProduct[];
    };
  } | null;
};

const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      products(first: 250, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          handle
          title
          vendor
          productType
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            nodes {
              url
              altText
            }
          }
          options {
            name
            values
          }
          variants(first: 100) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
          addOns: metafield(namespace: "custom", key: "add_ons") {
            references(first: 25) {
              nodes {
                ... on Product {
                  id
                  title
                  description
                  featuredImage {
                    url
                    altText
                  }
                  variants(first: 1) {
                    nodes {
                      id
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in the Shopify Storefront API credentials (Shopify admin → Headless → Storefront API).`,
    );
  }
  return value;
}

/**
 * One Storefront round-trip. `caching` is the only thing that varies between
 * the two callers below, and the two settings are mutually exclusive: passing
 * `revalidate` alongside `cache: "no-store"` makes Next ignore both, so they
 * are never combined.
 */
/**
 * Whether the store is wired up at all. The catalog throws without these — the
 * build is meant to fail loudly — but the cart runs at request time, where a
 * misconfigured deploy should refuse politely rather than take the page down.
 */
export function shopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}

async function request<T>(
  query: string,
  variables: Record<string, unknown>,
  caching: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<T> {
  const domain = requireEnv("SHOPIFY_STORE_DOMAIN");
  const token = requireEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");

  const response = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    ...caching,
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API responded ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) {
    throw new Error(`Shopify Storefront API error: ${body.errors.map((e) => e.message).join("; ")}`);
  }
  if (!body.data) {
    throw new Error("Shopify Storefront API returned no data");
  }
  return body.data;
}

/** The catalog: cached, since it is the same for every visitor. */
async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  // Next.js only caches a fetch when an explicit positive `revalidate` is set,
  // and it keys POSTs on the request body — so each distinct GraphQL
  // query/variables pair gets its own cache entry.
  return request<T>(query, variables, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_CACHE_TAG] },
  });
}

/**
 * A visitor's own cart: never cached. Every request here is either a mutation
 * or a read of one person's basket, so a shared cache entry would be wrong in
 * both directions — serving someone else's cart, or serving a stale copy of
 * theirs straight after they changed it.
 */
export async function storefrontUncached<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  return request<T>(query, variables, { cache: "no-store" });
}

async function fetchCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let cursor: string | null = null;

  do {
    const data: CollectionProductsResponse = await storefront<CollectionProductsResponse>(
      COLLECTION_PRODUCTS_QUERY,
      { handle, cursor },
    );
    // A collection that has been renamed or deleted upstream simply
    // contributes nothing rather than breaking the whole catalog.
    if (!data.collection) return products;

    products.push(...data.collection.products.nodes);
    cursor = data.collection.products.pageInfo.hasNextPage
      ? data.collection.products.pageInfo.endCursor
      : null;
  } while (cursor);

  return products;
}

function toMoney(money: ShopifyMoney): Money {
  return { amount: Number.parseFloat(money.amount), currencyCode: money.currencyCode };
}

function isPlaceholderOption(option: { name: string; values: string[] }): boolean {
  return (
    option.name === PLACEHOLDER_OPTION_NAME &&
    option.values.length === 1 &&
    option.values[0] === PLACEHOLDER_OPTION_VALUE
  );
}

function toImages(product: ShopifyProduct): ProductImage[] {
  return product.images.nodes.map((image) => ({
    url: image.url,
    // Most of the catalog has no alt text set in Shopify; the product name is
    // a better fallback than an empty string for a link that is often the
    // only content of its card.
    alt: image.altText?.trim() || product.title,
  }));
}

function toOptions(product: ShopifyProduct): ProductOption[] {
  return product.options
    .filter((option) => !isPlaceholderOption(option))
    .map((option) => ({ name: option.name, values: option.values }));
}

function toVariants(product: ShopifyProduct, options: ProductOption[]): ProductVariant[] {
  const realOptionNames = new Set(options.map((option) => option.name));

  return product.variants.nodes.map((variant) => ({
    id: variant.id,
    title: variant.title,
    selectedOptions: Object.fromEntries(
      variant.selectedOptions
        .filter((option) => realOptionNames.has(option.name))
        .map((option) => [option.name, option.value]),
    ),
    price: toMoney(variant.price),
    available: variant.availableForSale,
  }));
}

/**
 * The optional extras a machine is offered with, from its `custom.add_ons`
 * metafield.
 *
 * These are ordinary catalog products rather than variants of the machine.
 * That is forced by the shape of the data: the options on a price sheet are
 * independent yes/no choices, and variants can only express a fixed set of
 * combinations — the fourteen options an Enigma E'4m offers would need 2^14
 * variants to enumerate, past Shopify's per-product ceiling. Keeping them as
 * products means each carries its own price and part number, and the machine
 * page adds the ticked ones to the cart alongside it.
 *
 * An add-on with no variant is dropped rather than rendered unbuyable.
 */
function toAddOns(product: ShopifyProduct): ProductAddOn[] {
  const nodes = product.addOns?.references?.nodes ?? [];

  return nodes.flatMap((addOn) => {
    const variant = addOn.variants.nodes[0];
    if (!variant) return [];

    return [
      {
        id: addOn.id,
        title: addOn.title,
        description: addOn.description,
        ...(addOn.featuredImage
          ? {
              image: {
                url: addOn.featuredImage.url,
                alt: addOn.featuredImage.altText ?? addOn.title,
              },
            }
          : {}),
        merchandiseId: variant.id,
        price: toMoney(variant.price),
      },
    ];
  });
}

function toProduct(product: ShopifyProduct, category: ProductCategory): Product {
  const options = toOptions(product);
  const addOns = toAddOns(product);
  const compareAt = product.variants.nodes.find((variant) => variant.compareAtPrice)?.compareAtPrice;

  return {
    id: product.id,
    handle: product.handle,
    vendor: product.vendor,
    title: product.title,
    category,
    productType: product.productType.trim(),
    // The catalog's configurable machines span a wide range, so the card
    // price is the "from" price rather than any one variant's.
    price: toMoney(product.priceRange.minVariantPrice),
    ...(compareAt ? { compareAtPrice: toMoney(compareAt) } : {}),
    images: toImages(product),
    descriptionHtml: product.descriptionHtml,
    ...splitDescription(product.descriptionHtml),
    // The store defines no metafield for the hand-written spec tables yet, so
    // products publish without specs and `ProductSpecs` renders nothing. The
    // machines carry their specifications in `descriptionHtml` meanwhile.
    specs: [],
    options,
    variants: toVariants(product, options),
    ...(addOns.length > 0 ? { addOns } : {}),
  };
}

/**
 * Every product published to the site: the members of the category
 * collections, mapped into the shape the components consume.
 *
 * Wrapped in `React.cache` so the several components that ask for the catalog
 * in one render share a single set of Storefront requests — `fetch`
 * memoization only covers GET, and the Storefront API is POST-only.
 */
export const getShopifyProducts = cache(async (): Promise<Product[]> => {
  const collections = await Promise.all(
    CATEGORY_COLLECTIONS.map(async ({ handle, category }) => ({
      category,
      products: await fetchCollectionProducts(handle),
    })),
  );

  // First collection to claim a handle wins, per CATEGORY_COLLECTIONS order.
  const byHandle = new Map<string, Product>();
  for (const { category, products } of collections) {
    for (const product of products) {
      if (!byHandle.has(product.handle)) {
        byHandle.set(product.handle, toProduct(product, category));
      }
    }
  }

  // Group by category for display, keeping each collection's own order within
  // a group so merchandising done in Shopify carries through.
  return [...byHandle.values()].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
});

/**
 * How many products must share one image before it is judged a stock graphic
 * rather than a photo of any particular product.
 *
 * Most of the spare-parts catalog has no photography yet and carries a Vera
 * "image coming soon" card instead. Shopify offers nothing to distinguish that
 * from a real photo — it is not tagged, has no alt text, and shares its 1000 x
 * 1000 dimensions with genuine photos — but it is the same picture, re-uploaded
 * per product, so the products using it all fingerprint alike.
 *
 * Real photos are shared too, legitimately: one Eversys shot covers the six
 * products in a variant family. The threshold sits above that and well below
 * the placeholder's clusters (54 products and 12). The cost of getting it
 * wrong is small and one-sided — a product only drops out of the featured
 * grid, and still has its own page.
 */
const STOCK_IMAGE_MIN_PRODUCTS = 10;

/**
 * Products whose primary image is a placeholder the sharing rule cannot see,
 * because that copy of it was uploaded for one product only and so is shared
 * with nothing.
 *
 * Keep this short. The durable fix for an entry here is in Shopify, not in
 * code: delete the placeholder image from the product and it drops out
 * automatically, since a product with no image is never featured. Re-check the
 * list when the catalog gains real photography.
 */
const ONE_OFF_STOCK_IMAGE_HANDLES = new Set(["lm-f-1-021-gs3-paddle-group-cap-lower-ring"]);

/**
 * Width, in pixels, of the thumbnail used to fingerprint an image. Small
 * enough that probing the whole catalog moves about 175 KB, large enough that
 * genuinely different products never collide.
 */
const STOCK_IMAGE_PROBE_WIDTH = 32;

/**
 * Fingerprints an image by hashing a thumbnail of it rendered by Shopify's
 * CDN.
 *
 * Hashing the full-size bytes does not work: the placeholder was re-uploaded
 * per product, and the copies differ enough in encoding that 66 of them split
 * into three byte-distinct groups, one of them a single product. Downscaling
 * collapses encoding differences, merging those into two large groups the
 * threshold catches, while still separating products that genuinely differ.
 *
 * It does not merge all of them: one product's copy is a different rendering
 * of the same design and stays unique at any width, which is what
 * ONE_OFF_STOCK_IMAGE_HANDLES is for.
 */
async function fingerprintImage(image: ProductImage): Promise<string | null> {
  const url = new URL(image.url);
  url.searchParams.set("width", String(STOCK_IMAGE_PROBE_WIDTH));

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_CACHE_TAG] },
    });
    if (!response.ok) return null;
    return createHash("sha1").update(Buffer.from(await response.arrayBuffer())).digest("hex");
  } catch {
    // An image we can't fingerprint is treated as unique, so a transient
    // network failure hides nothing that deserves to be shown.
    return null;
  }
}

/**
 * Handles whose primary image is a stock graphic shared across many products,
 * rather than a photo of the product itself.
 */
const getStockImageHandles = cache(async (): Promise<Set<string>> => {
  const products = await getShopifyProducts();
  const withImages = products.filter((product) => product.images.length > 0);

  const fingerprints = await Promise.all(
    withImages.map((product) => fingerprintImage(product.images[0])),
  );

  const shareCount = new Map<string, number>();
  for (const fingerprint of fingerprints) {
    if (fingerprint) shareCount.set(fingerprint, (shareCount.get(fingerprint) ?? 0) + 1);
  }

  return new Set([
    ...ONE_OFF_STOCK_IMAGE_HANDLES,
    ...withImages
      .filter((_, index) => {
        const fingerprint = fingerprints[index];
        return fingerprint !== null && (shareCount.get(fingerprint) ?? 0) >= STOCK_IMAGE_MIN_PRODUCTS;
      })
      .map((product) => product.handle),
  ]);
});

/**
 * The homepage's featured selection: products that have a photo of their own,
 * capped per category so every filter tab fills the grid without the section
 * turning into the entire catalog.
 */
export const getFeaturedShopifyProducts = cache(async (perCategory: number): Promise<Product[]> => {
  const [products, stockImages] = await Promise.all([
    getShopifyProducts(),
    getStockImageHandles(),
  ]);

  const taken = new Map<ProductCategory, number>();
  const eligible = products.filter((product) => {
    if (product.images.length === 0 || stockImages.has(product.handle)) return false;
    const count = taken.get(product.category) ?? 0;
    if (count >= perCategory) return false;
    taken.set(product.category, count + 1);
    return true;
  });

  // Interleave the categories so the unfiltered grid shows the range rather
  // than the first N of whichever category sorts first. Filtering by a single
  // category still yields that category's own order, since interleaving
  // preserves the relative order within each one.
  const queues = CATEGORY_ORDER.map((category) =>
    eligible.filter((product) => product.category === category),
  );
  const featured: Product[] = [];
  for (let round = 0; featured.length < eligible.length; round++) {
    for (const queue of queues) {
      if (round < queue.length) featured.push(queue[round]);
    }
  }
  return featured;
});
