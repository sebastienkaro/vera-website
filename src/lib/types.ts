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
