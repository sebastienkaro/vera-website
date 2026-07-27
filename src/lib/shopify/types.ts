/**
 * Response shapes for the selection sets in `queries.ts` — not the full
 * Storefront schema, only the fields this site asks for.
 */

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
};

export type ShopifyMetafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
} | null;

export type ShopifySelectedOption = {
  name: string;
  value: string;
};

export type ShopifyProductOption = {
  name: string;
  optionValues: { name: string }[];
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: ShopifySelectedOption[];
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  descriptionHtml: string;
  availableForSale: boolean;
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { maxVariantPrice: ShopifyMoney };
  images: { nodes: ShopifyImage[] };
  options: ShopifyProductOption[];
  variants: { nodes: ShopifyProductVariant[] };
  metafields: ShopifyMetafield[];
};

export type ProductsQueryResult = {
  products: {
    nodes: ShopifyProduct[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export type ProductQueryResult = {
  product: ShopifyProduct | null;
};

export type ShopQueryResult = {
  shop: {
    name: string;
    primaryDomain: { url: string };
  };
};
