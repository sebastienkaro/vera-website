export type Money = {
  amount: number;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  selectedOptions: Record<string, string>;
  price: Money;
  available: boolean;
};

export type ProductSpec = {
  label: string;
  value: string;
};

/**
 * A titled block of specs — "Boilers", "Electrical", "In the box". A full
 * manufacturer spec sheet runs to thirty-odd lines, which reads as a wall
 * without headings to break it into what a buyer is actually looking for.
 */
export type ProductSpecGroup = {
  title: string;
  specs: ProductSpec[];
};

/**
 * The specs that change with the configuration — height stays the same across
 * a 1, 2 and 3 group machine, but width, weight and wattage don't. A table is
 * how manufacturers publish these, and it doubles as the comparison a buyer
 * makes before choosing a group count.
 */
export type ProductSpecTable = {
  title: string;
  /** Column headings, e.g. `["1 Group", "2 Group", "3 Group"]`. */
  columns: string[];
  /** One `values` entry per column, in the same order. */
  rows: { label: string; values: string[] }[];
};

/** A short selling point, shown as a card rather than a spec line. */
export type ProductHighlight = {
  title: string;
  description: string;
};

/**
 * Something a buyer can add to the machine on its own product page: another
 * product in the catalog, or a service Vera quotes separately.
 *
 * `merchandiseId` is what makes an add-on purchasable — with one, ticking the
 * add-on puts that variant in the cart alongside the machine. Without one it
 * is quote-only: still tickable, so it can be carried into a quote request,
 * but priced by a human. `priceNote` is what stands in for the price there.
 */
export type ProductAddOn = {
  id: string;
  title: string;
  description: string;
  image?: ProductImage;
  merchandiseId?: string;
  price?: Money;
  priceNote?: string;
};

/** A downloadable spec sheet, manual or parts catalog. */
export type ProductDocument = {
  label: string;
  href: string;
};

export type ProductCategory = "machines" | "grinders" | "parts-accessories";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  machines: "Machines",
  grinders: "Grinders",
  "parts-accessories": "Parts & Accessories",
};

/**
 * How many products the homepage collection grid shows at once — three rows of
 * four. It is a featured selection, not the whole catalog, and the count
 * applies per filter so every tab fills the grid.
 */
export const FEATURED_LIMIT = 12;

/**
 * How many machines the hero's marquee runs through before repeating. Enough
 * that a visitor is unlikely to see the same card twice while reading the
 * headline, and few enough that the strip isn't the page's heaviest download.
 */
export const HERO_MARQUEE_LIMIT = 8;

/**
 * One line of a Shopify cart. `id` is the line's own id — the handle for
 * changing its quantity or removing it — while `merchandiseId` is the variant
 * it holds, which is what gets added in the first place.
 *
 * The product's title and handle are carried on the line rather than looked up,
 * because Shopify returns them with the cart: the drawer can render without a
 * second trip to the catalog.
 */
export type CartLine = {
  id: string;
  merchandiseId: string;
  productTitle: string;
  productHandle: string;
  /** The variant's own name, e.g. "2 Group". Null on single-variant products. */
  variantTitle: string | null;
  image: ProductImage | null;
  quantity: number;
  /** Unit price, and the line's total for the quantity held. */
  price: Money;
  lineTotal: Money;
};

/**
 * A Shopify cart, as the drawer needs it. `checkoutUrl` leaves this app for
 * Shopify's hosted checkout, which is where payment, shipping and tax are all
 * settled — none of that is modelled here.
 */
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};

/**
 * What every cart action hands back: the cart as Shopify now holds it, and a
 * sentence to show the visitor if something went wrong. Both can be set — a
 * refused quantity change leaves the cart intact and still owes an explanation.
 */
export type CartResult = {
  cart: Cart | null;
  error: string | null;
};

export type Product = {
  id: string;
  handle: string;
  vendor: string;
  title: string;
  category: ProductCategory;
  /**
   * Shopify's own product type — "Pressure Gauges", "Steam Components",
   * "Espresso Machines". Finer-grained than `category`, which only has three
   * values, and it is what the category pages filter on: Parts & Accessories
   * is one category but fifteen product types.
   */
  productType: string;
  price: Money;
  compareAtPrice?: Money;
  images: ProductImage[];
  descriptionHtml: string;
  specs: ProductSpec[];
  options: ProductOption[];
  variants: ProductVariant[];
  /**
   * Everything below is optional and everything below is empty on a product
   * that comes from Shopify: the Storefront API has no field for any of it,
   * and this store defines no metafields for them yet. Each section renders
   * nothing when its data is missing, so a listing can be filled in a piece at
   * a time rather than all at once.
   *
   * `src/lib/sample-product.ts` is one product with all of it filled in —
   * what a fully built-out listing looks like, and the shape the metafields
   * would need to take to produce it from Shopify.
   */
  /** One line under the title, e.g. what the machine is for. */
  subtitle?: string;
  highlights?: ProductHighlight[];
  addOns?: ProductAddOn[];
  specGroups?: ProductSpecGroup[];
  specTable?: ProductSpecTable;
  documents?: ProductDocument[];
  /** Reassurances shown under the buy buttons — warranty, lead time, install. */
  purchaseNotes?: string[];
};
