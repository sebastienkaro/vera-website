import type { Product } from "@/lib/types";

/**
 * The catalog browser's model: what a visitor has narrowed the shelf to, how
 * that reads in the URL, and how it is applied to a list of products.
 *
 * Kept as plain functions over plain data, separate from the components that
 * draw it, because the filtering is the part with rules in it — everything in
 * here can be reasoned about (and exercised) without rendering anything.
 */

export const SORT_OPTIONS = [
  // Shopify's own collection order, so merchandising done in the admin is what
  // a visitor sees first. Every other order is something they asked for.
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Models A–Z" },
  { value: "vendor-asc", label: "Manufacturers A–Z" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((option) => option.value));

export const DEFAULT_SORT: SortKey = "featured";

export type CatalogFilters = {
  query: string;
  vendors: string[];
  types: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  sort: SortKey;
};

export const EMPTY_FILTERS: CatalogFilters = {
  query: "",
  vendors: [],
  types: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sort: DEFAULT_SORT,
};

/** Whether anything is narrowing the shelf — sort alone doesn't count. */
export function isFiltered(filters: CatalogFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.vendors.length > 0 ||
    filters.types.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.inStockOnly
  );
}

export function isAvailable(product: Product): boolean {
  return product.variants.some((variant) => variant.available);
}

/**
 * Search matches on the words a visitor is likely to type — the model, who
 * makes it, and what kind of thing it is. Every word has to match something,
 * so "marzocco gasket" narrows rather than widens.
 */
function matchesQuery(product: Product, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const haystack = `${product.title} ${product.vendor} ${product.productType}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/**
 * Which facets to leave out when testing a product. Used to count a facet's
 * options against everything *except* that facet, so ticking "Eversys" doesn't
 * knock every other manufacturer's count to zero and strand the visitor.
 */
type Ignored = "vendors" | "types" | null;

function matches(product: Product, filters: CatalogFilters, ignore: Ignored = null): boolean {
  if (!matchesQuery(product, filters.query)) return false;

  if (ignore !== "vendors" && filters.vendors.length > 0) {
    if (!filters.vendors.includes(product.vendor)) return false;
  }

  if (ignore !== "types" && filters.types.length > 0) {
    if (!filters.types.includes(product.productType)) return false;
  }

  if (filters.minPrice !== null && product.price.amount < filters.minPrice) return false;
  if (filters.maxPrice !== null && product.price.amount > filters.maxPrice) return false;

  if (filters.inStockOnly && !isAvailable(product)) return false;

  return true;
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  if (sort === "featured") return products;

  const sorted = [...products];
  const byName = (a: Product, b: Product) => a.title.localeCompare(b.title);

  switch (sort) {
    case "name-asc":
      return sorted.sort(byName);
    case "vendor-asc":
      // Ties inside a manufacturer fall back to the model name, so a vendor's
      // block reads alphabetically rather than in arbitrary order.
      return sorted.sort((a, b) => a.vendor.localeCompare(b.vendor) || byName(a, b));
    case "price-asc":
      return sorted.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return sorted.sort((a, b) => b.price.amount - a.price.amount);
  }
}

export function applyFilters(products: Product[], filters: CatalogFilters): Product[] {
  return sortProducts(
    products.filter((product) => matches(product, filters)),
    filters.sort,
  );
}

export type FacetOption = { value: string; count: number };

export type Facets = {
  vendors: FacetOption[];
  types: FacetOption[];
  /** Null when every product in the shelf costs the same — nothing to range. */
  priceRange: { min: number; max: number } | null;
  /**
   * True only when stock actually divides the shelf. A control that either
   * changes nothing or empties the page is worse than no control, and this
   * catalog can be entirely one or the other depending on how Shopify's
   * inventory is set up.
   */
  canFilterByStock: boolean;
};

function countBy(products: Product[], pick: (product: Product) => string): FacetOption[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const value = pick(product);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * The facet lists for a shelf. Options are counted against the other active
 * filters, so the numbers say how many products each choice would actually
 * add — but the full set of options stays visible, so a filter can always be
 * changed rather than only cleared.
 */
export function buildFacets(products: Product[], filters: CatalogFilters): Facets {
  const forVendors = products.filter((product) => matches(product, filters, "vendors"));
  const forTypes = products.filter((product) => matches(product, filters, "types"));

  const vendorCounts = new Map(
    countBy(forVendors, (product) => product.vendor).map((option) => [option.value, option.count]),
  );
  const typeCounts = new Map(
    countBy(forTypes, (product) => product.productType).map((option) => [option.value, option.count]),
  );

  const withCounts = (all: FacetOption[], counts: Map<string, number>) =>
    all.map((option) => ({ value: option.value, count: counts.get(option.value) ?? 0 }));

  const prices = products.map((product) => product.price.amount);
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));

  const available = products.filter(isAvailable).length;

  return {
    // A facet with one option cannot narrow anything — the shelf is already
    // all of it — so those are dropped rather than drawn as a dead control.
    vendors: keepIfUseful(withCounts(countBy(products, (p) => p.vendor), vendorCounts)),
    types: keepIfUseful(withCounts(countBy(products, (p) => p.productType), typeCounts)),
    priceRange: prices.length > 0 && min < max ? { min, max } : null,
    canFilterByStock: available > 0 && available < products.length,
  };
}

function keepIfUseful(options: FacetOption[]): FacetOption[] {
  return options.length > 1 ? options : [];
}

/** Read the filter state out of the URL. Anything unrecognised falls back. */
export function parseFilters(params: URLSearchParams): CatalogFilters {
  const number = (key: string): number | null => {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  };

  const sort = params.get("sort");

  return {
    query: params.get("q") ?? "",
    vendors: params.getAll("vendor"),
    types: params.getAll("type"),
    minPrice: number("min"),
    maxPrice: number("max"),
    inStockOnly: params.get("stock") === "1",
    sort: sort !== null && SORT_KEYS.has(sort) ? (sort as SortKey) : DEFAULT_SORT,
  };
}

/**
 * The inverse: filter state as a query string, defaults omitted so an
 * untouched page keeps a clean URL. Returns "" rather than "?" when nothing is
 * set, so it can be appended to a pathname unconditionally.
 */
export function serializeFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.query.trim() !== "") params.set("q", filters.query.trim());
  for (const vendor of filters.vendors) params.append("vendor", vendor);
  for (const type of filters.types) params.append("type", type);
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("stock", "1");
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);

  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

/** Add or remove one value from a multi-select facet. */
export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((existing) => existing !== value)
    : [...values, value];
}
