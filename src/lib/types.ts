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
  price: Money;
  compareAtPrice?: Money;
  images: ProductImage[];
  descriptionHtml: string;
  specs: ProductSpec[];
  options: ProductOption[];
  variants: ProductVariant[];
};
