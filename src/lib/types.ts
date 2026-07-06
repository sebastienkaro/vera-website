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
