import type { Product } from "@/lib/types";

/**
 * Mock product catalog. This module is the only place that knows the data
 * is local — swap these functions for Shopify Storefront API calls (mapped
 * into the `Product` shape) and every component that imports from here
 * keeps working unchanged.
 */
const products: Product[] = [
  {
    id: "linea-mini",
    handle: "linea-mini",
    vendor: "La Marzocco",
    title: "Linea Mini",
    price: { amount: 5590, currencyCode: "USD" },
    images: [
      { url: "", alt: "La Marzocco Linea Mini — front view" },
      { url: "", alt: "La Marzocco Linea Mini — side view" },
      { url: "", alt: "La Marzocco Linea Mini — steam wand detail" },
      { url: "", alt: "La Marzocco Linea Mini — group head detail" },
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
    title: "Linea PB",
    price: { amount: 12900, currencyCode: "USD" },
    images: [{ url: "", alt: "La Marzocco Linea PB" }],
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
    title: "GS3",
    price: { amount: 7590, currencyCode: "USD" },
    images: [{ url: "", alt: "La Marzocco GS3" }],
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
    title: "KB90",
    price: { amount: 16900, currencyCode: "USD" },
    images: [{ url: "", alt: "La Marzocco KB90" }],
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

export function getProducts(): Product[] {
  return products;
}

export function getProduct(handle: string): Product | undefined {
  return products.find((product) => product.handle === handle);
}

export function formatMoney(money: { amount: number; currencyCode: string }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: 0,
  }).format(money.amount);
}
