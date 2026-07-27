import { cache } from "react";
import type {
  Money,
  Product,
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

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const domain = requireEnv("SHOPIFY_STORE_DOMAIN");
  const token = requireEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");

  const response = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    // Next.js only caches a fetch when an explicit positive `revalidate` is
    // set, and it keys POSTs on the request body — so each distinct GraphQL
    // query/variables pair gets its own cache entry.
    next: { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_CACHE_TAG] },
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

function toProduct(product: ShopifyProduct, category: ProductCategory): Product {
  const options = toOptions(product);
  const compareAt = product.variants.nodes.find((variant) => variant.compareAtPrice)?.compareAtPrice;

  return {
    id: product.id,
    handle: product.handle,
    vendor: product.vendor,
    title: product.title,
    category,
    // The catalog's configurable machines span a wide range, so the card
    // price is the "from" price rather than any one variant's.
    price: toMoney(product.priceRange.minVariantPrice),
    ...(compareAt ? { compareAtPrice: toMoney(compareAt) } : {}),
    images: toImages(product),
    descriptionHtml: product.descriptionHtml,
    // The Storefront API has no equivalent of the hand-written spec tables,
    // and this store defines no metafields for them, so products publish
    // without specs and `ProductSpecs` renders nothing.
    specs: [],
    options,
    variants: toVariants(product, options),
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
