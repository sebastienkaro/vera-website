/**
 * Verifies the Shopify credentials in .env.local without starting the site.
 *
 *   npm run shopify:check
 *
 * Reports what the storefront token can actually see, which is the quickest
 * way to tell a bad token apart from an empty or unpublished catalog.
 */
import { loadEnvConfig } from "@next/env";
import { fetchShopInfo, fetchShopifyProducts, getShopifyConfig } from "../src/lib/shopify";

// Loads .env.local / .env with the same precedence Next uses, so the script
// sees exactly what the site would. Safe to call after the imports because the
// Shopify modules read process.env lazily, inside getShopifyConfig().
loadEnvConfig(process.cwd());

async function main() {
  const config = getShopifyConfig();

  if (!config) {
    console.error(
      "Not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Store:       ${config.domain}`);
  console.log(`API version: ${config.apiVersion}`);
  console.log(`Specs from:  ${config.specsMetafield.namespace}.${config.specsMetafield.key}`);
  console.log("");

  const shop = await fetchShopInfo();
  console.log(`Connected to "${shop.name}" (${shop.url})`);

  const products = await fetchShopifyProducts();
  console.log(`Published products visible to this token: ${products.length}`);

  if (products.length === 0) {
    console.warn(
      "No products came back. Check that products are published to the sales channel " +
        "the storefront token belongs to.",
    );
    return;
  }

  const byCategory = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
    return counts;
  }, {});

  console.log("");
  console.log("Category mapping (see resolveCategory in src/lib/shopify/normalize.ts):");
  for (const [category, count] of Object.entries(byCategory)) {
    console.log(`  ${category}: ${count}`);
  }

  const withoutSpecs = products.filter((product) => product.specs.length === 0).length;
  const withoutImages = products.filter((product) => !product.images[0]?.url).length;

  console.log("");
  console.log(`Products with no specs metafield: ${withoutSpecs}`);
  console.log(`Products with no images:          ${withoutImages}`);

  console.log("");
  console.log("Sample:");
  for (const product of products.slice(0, 5)) {
    console.log(
      `  ${product.handle} — ${product.title} (${product.category}, ${product.variants.length} variant(s))`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
