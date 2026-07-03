export type Money = {
  amount: number;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  price: Money;
  available: boolean;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  handle: string;
  vendor: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  images: ProductImage[];
  descriptionHtml: string;
  specs: ProductSpec[];
  variants: ProductVariant[];
};
