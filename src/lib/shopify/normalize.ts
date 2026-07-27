import type { MetafieldIdentifier } from "@/lib/shopify/config";
import type { ShopifyMoney, ShopifyProduct } from "@/lib/shopify/types";
import type {
  Money,
  Product,
  ProductCategory,
  ProductImage,
  ProductOption,
  ProductSpec,
  ProductVariant,
} from "@/lib/types";

/**
 * Maps Shopify's product shape onto the site's `Product` type. Everything the
 * components render goes through here, so this is the one place that has to
 * change if the store organises its data differently.
 */

function toMoney(money: ShopifyMoney): Money {
  return {
    // Shopify returns Decimal as a string ("5590.00") to avoid float drift in
    // transit; the UI only formats it, so a number is fine here.
    amount: Number.parseFloat(money.amount),
    currencyCode: money.currencyCode,
  };
}

/**
 * Shopify has no notion of this site's three-way split, so a product's category
 * is resolved in order of how explicit the signal is:
 *
 * 1. a `category:<slug>` tag, which lets the store override everything else
 * 2. the product type
 * 3. any other tag
 *
 * Products that match nothing land in parts & accessories, the catch-all the
 * filter row already treats as the miscellaneous bucket.
 */
const CATEGORY_TAG_PREFIX = "category:";

const CATEGORY_KEYWORDS: [ProductCategory, string[]][] = [
  // Checked before "machines" so a "coffee grinder" doesn't get caught by a
  // looser match, and before "parts" so "grinder burrs" stays with grinders.
  ["grinders", ["grinder", "burr"]],
  ["machines", ["machine", "espresso maker", "brewer"]],
  ["parts-accessories", ["part", "accessor", "cleaning", "tamper", "portafilter", "knock box"]],
];

const VALID_CATEGORIES: ProductCategory[] = ["machines", "grinders", "parts-accessories"];

function matchCategory(text: string): ProductCategory | null {
  const haystack = text.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => haystack.includes(keyword))) return category;
  }
  return null;
}

export function resolveCategory(product: {
  productType: string;
  tags: string[];
}): ProductCategory {
  for (const tag of product.tags) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized.startsWith(CATEGORY_TAG_PREFIX)) continue;
    const slug = normalized.slice(CATEGORY_TAG_PREFIX.length).trim();
    const match = VALID_CATEGORIES.find((category) => category === slug);
    if (match) return match;
  }

  return (
    matchCategory(product.productType) ??
    matchCategory(product.tags.join(" ")) ??
    "parts-accessories"
  );
}

/**
 * Reads the spec table out of its metafield. The value is accepted in whichever
 * of these shapes the store finds easiest to maintain:
 *
 * - `[{"label": "Boiler type", "value": "Dual boiler"}]`
 * - `{"Boiler type": "Dual boiler"}`
 * - `["Boiler type: Dual boiler"]` — matches `list.single_line_text_field`
 *
 * A missing or unreadable metafield yields no specs; `ProductSpecs` renders
 * nothing in that case, which beats breaking the product page over it.
 */
export function parseSpecs(rawValue: string | null | undefined): ProductSpec[] {
  if (!rawValue) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }

  const toSpec = (label: unknown, value: unknown): ProductSpec | null => {
    const labelText = typeof label === "string" ? label.trim() : "";
    const valueText =
      typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
    return labelText && valueText ? { label: labelText, value: valueText } : null;
  };

  if (Array.isArray(parsed)) {
    return parsed
      .map((entry): ProductSpec | null => {
        if (typeof entry === "string") {
          const separator = entry.indexOf(":");
          if (separator <= 0) return null;
          return toSpec(entry.slice(0, separator), entry.slice(separator + 1));
        }
        if (entry && typeof entry === "object") {
          const record = entry as Record<string, unknown>;
          return toSpec(record.label ?? record.name, record.value);
        }
        return null;
      })
      .filter((spec): spec is ProductSpec => spec !== null);
  }

  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>)
      .map(([label, value]) => toSpec(label, value))
      .filter((spec): spec is ProductSpec => spec !== null);
  }

  return [];
}

function normalizeImages(product: ShopifyProduct): ProductImage[] {
  const images = product.images.nodes.map((image) => ({
    url: image.url,
    alt: image.altText?.trim() || product.title,
  }));

  // Products without media still have to render: an empty URL makes SiteImage
  // fall back to the striped placeholder instead of the gallery reading an
  // undefined first image.
  return images.length > 0 ? images : [{ url: "", alt: product.title }];
}

function normalizeOptions(product: ShopifyProduct): ProductOption[] {
  return product.options
    .map((option) => ({
      name: option.name,
      values: option.optionValues.map((optionValue) => optionValue.name),
    }))
    .filter((option) => option.values.length > 0);
}

function normalizeVariants(product: ShopifyProduct): ProductVariant[] {
  return product.variants.nodes.map((variant) => ({
    id: variant.id,
    title: variant.title,
    selectedOptions: Object.fromEntries(
      variant.selectedOptions.map((option) => [option.name, option.value]),
    ),
    price: toMoney(variant.price),
    available: variant.availableForSale,
  }));
}

export function normalizeProduct(
  product: ShopifyProduct,
  specsMetafield: MetafieldIdentifier,
): Product {
  const price = toMoney(product.priceRange.minVariantPrice);
  const compareAt = toMoney(product.compareAtPriceRange.maxVariantPrice);

  const specs = product.metafields.find(
    (metafield) =>
      metafield?.namespace === specsMetafield.namespace && metafield?.key === specsMetafield.key,
  );

  return {
    id: product.id,
    handle: product.handle,
    vendor: product.vendor,
    title: product.title,
    category: resolveCategory(product),
    price,
    // Shopify reports a compare-at of 0 when no sale price is set, and mirrors
    // the price itself on some imports — neither is a discount worth showing.
    ...(compareAt.amount > price.amount ? { compareAtPrice: compareAt } : {}),
    images: normalizeImages(product),
    descriptionHtml: product.descriptionHtml,
    specs: parseSpecs(specs?.value),
    options: normalizeOptions(product),
    variants: normalizeVariants(product),
  };
}
