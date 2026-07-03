import { resolveImage } from "@/lib/images";
import type { Product } from "@/lib/types";

type ProductSource = Omit<Product, "images"> & {
  images: { file: string; alt: string }[];
};

/**
 * Mock product catalog. This module is the only place that knows the data
 * is local — swap these functions for Shopify Storefront API calls (mapped
 * into the `Product` shape) and every component that imports from here
 * keeps working unchanged.
 *
 * Each `file` names an image slot under `public/images/products/<handle>/`;
 * see that folder's README for the full list per product.
 */
const products: ProductSource[] = [
  {
    id: "linea-mini",
    handle: "linea-mini",
    vendor: "La Marzocco",
    category: "machines",
    title: "Linea Mini",
    price: { amount: 5590, currencyCode: "USD" },
    images: [
      { file: "front-view", alt: "La Marzocco Linea Mini — front view" },
      { file: "side-view", alt: "La Marzocco Linea Mini — side view" },
      { file: "steam-wand-detail", alt: "La Marzocco Linea Mini — steam wand detail" },
      { file: "group-head-detail", alt: "La Marzocco Linea Mini — group head detail" },
    ],
    descriptionHtml:
      "<p>The Linea Mini brings La Marzocco's commercial-grade engineering to a single-group format. Saturated group heads, a rotary pump, and precise PID temperature control deliver café-quality espresso at home or in a small-format bar.</p>",
    specs: [
      { label: "Boiler type", value: "Dual boiler" },
      { label: "Group heads", value: "1" },
      { label: "Pump", value: "Rotary" },
      { label: "Dimensions", value: "14.9\" W x 16.8\" D x 15.7\" H" },
      { label: "Weight", value: "55 lbs" },
      { label: "Power", value: "110V / 120V, 1500W" },
    ],
    variants: [
      { id: "linea-mini-red", title: "Red", price: { amount: 5590, currencyCode: "USD" }, available: true },
      { id: "linea-mini-white", title: "White", price: { amount: 5590, currencyCode: "USD" }, available: true },
      { id: "linea-mini-black", title: "Black", price: { amount: 5690, currencyCode: "USD" }, available: false },
    ],
  },
  {
    id: "linea-pb",
    handle: "linea-pb",
    vendor: "La Marzocco",
    category: "machines",
    title: "Linea PB",
    price: { amount: 12900, currencyCode: "USD" },
    images: [{ file: "main", alt: "La Marzocco Linea PB" }],
    descriptionHtml: "<p>The commercial standard for multi-group espresso bars.</p>",
    specs: [
      { label: "Boiler type", value: "Dual boiler" },
      { label: "Group heads", value: "2–3" },
      { label: "Pump", value: "Rotary" },
    ],
    variants: [
      { id: "linea-pb-2gr", title: "2 Group", price: { amount: 12900, currencyCode: "USD" }, available: true },
      { id: "linea-pb-3gr", title: "3 Group", price: { amount: 15900, currencyCode: "USD" }, available: true },
    ],
  },
  {
    id: "gs3",
    handle: "gs3",
    vendor: "La Marzocco",
    category: "machines",
    title: "GS3",
    price: { amount: 7590, currencyCode: "USD" },
    images: [{ file: "main", alt: "La Marzocco GS3" }],
    descriptionHtml: "<p>Prosumer espresso machine with full manual control.</p>",
    specs: [
      { label: "Boiler type", value: "Dual boiler" },
      { label: "Group heads", value: "1" },
    ],
    variants: [
      { id: "gs3-av", title: "Auto Volumetric", price: { amount: 7590, currencyCode: "USD" }, available: true },
      { id: "gs3-mp", title: "Manual Paddle", price: { amount: 7990, currencyCode: "USD" }, available: true },
    ],
  },
  {
    id: "kb90",
    handle: "kb90",
    vendor: "La Marzocco",
    category: "machines",
    title: "KB90",
    price: { amount: 16900, currencyCode: "USD" },
    images: [{ file: "main", alt: "La Marzocco KB90" }],
    descriptionHtml: "<p>La Marzocco's flagship volumetric espresso machine.</p>",
    specs: [
      { label: "Boiler type", value: "Multi-boiler" },
      { label: "Group heads", value: "2–3" },
    ],
    variants: [
      { id: "kb90-2gr", title: "2 Group", price: { amount: 16900, currencyCode: "USD" }, available: true },
    ],
  },
];

function resolveProduct(product: ProductSource): Product {
  return {
    ...product,
    images: product.images.map(({ file, alt }) => ({
      url: resolveImage(`products/${product.handle}/${file}`) ?? "",
      alt,
    })),
  };
}

export function getProducts(): Product[] {
  return products.map(resolveProduct);
}

export function getProduct(handle: string): Product | undefined {
  const product = products.find((item) => item.handle === handle);
  return product && resolveProduct(product);
}
