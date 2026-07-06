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
 * Each `file` names an image under `public/images/products/placeholder/`,
 * shared across every product — these are throwaway placeholders and get
 * replaced once products pull from Shopify, so there's no per-product
 * folder. See that folder's README for naming.
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
      { file: "linea-mini-front-view", alt: "La Marzocco Linea Mini — front view" },
      { file: "linea-mini-side-view", alt: "La Marzocco Linea Mini — side view" },
      { file: "linea-mini-steam-wand-detail", alt: "La Marzocco Linea Mini — steam wand detail" },
      { file: "linea-mini-group-head-detail", alt: "La Marzocco Linea Mini — group head detail" },
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
    options: [
      { name: "Color", values: ["Red", "White", "Black"] },
      { name: "Steam Wand", values: ["Standard", "Cool Touch"] },
    ],
    variants: [
      {
        id: "linea-mini-red-standard",
        title: "Red / Standard",
        selectedOptions: { Color: "Red", "Steam Wand": "Standard" },
        price: { amount: 5590, currencyCode: "USD" },
        available: true,
      },
      {
        id: "linea-mini-red-cool-touch",
        title: "Red / Cool Touch",
        selectedOptions: { Color: "Red", "Steam Wand": "Cool Touch" },
        price: { amount: 5790, currencyCode: "USD" },
        available: true,
      },
      {
        id: "linea-mini-white-standard",
        title: "White / Standard",
        selectedOptions: { Color: "White", "Steam Wand": "Standard" },
        price: { amount: 5590, currencyCode: "USD" },
        available: true,
      },
      {
        id: "linea-mini-white-cool-touch",
        title: "White / Cool Touch",
        selectedOptions: { Color: "White", "Steam Wand": "Cool Touch" },
        price: { amount: 5790, currencyCode: "USD" },
        available: true,
      },
      {
        id: "linea-mini-black-standard",
        title: "Black / Standard",
        selectedOptions: { Color: "Black", "Steam Wand": "Standard" },
        price: { amount: 5690, currencyCode: "USD" },
        available: false,
      },
      {
        id: "linea-mini-black-cool-touch",
        title: "Black / Cool Touch",
        selectedOptions: { Color: "Black", "Steam Wand": "Cool Touch" },
        price: { amount: 5890, currencyCode: "USD" },
        available: false,
      },
    ],
  },
  {
    id: "linea-pb",
    handle: "linea-pb",
    vendor: "La Marzocco",
    category: "machines",
    title: "Linea PB",
    price: { amount: 12900, currencyCode: "USD" },
    images: [{ file: "linea-pb-main", alt: "La Marzocco Linea PB" }],
    descriptionHtml: "<p>The commercial standard for multi-group espresso bars.</p>",
    specs: [
      { label: "Boiler type", value: "Dual boiler" },
      { label: "Group heads", value: "2–3" },
      { label: "Pump", value: "Rotary" },
    ],
    options: [{ name: "Group Heads", values: ["2 Group", "3 Group"] }],
    variants: [
      {
        id: "linea-pb-2gr",
        title: "2 Group",
        selectedOptions: { "Group Heads": "2 Group" },
        price: { amount: 12900, currencyCode: "USD" },
        available: true,
      },
      {
        id: "linea-pb-3gr",
        title: "3 Group",
        selectedOptions: { "Group Heads": "3 Group" },
        price: { amount: 15900, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "gs3",
    handle: "gs3",
    vendor: "La Marzocco",
    category: "machines",
    title: "GS3",
    price: { amount: 7590, currencyCode: "USD" },
    images: [{ file: "gs3-main", alt: "La Marzocco GS3" }],
    descriptionHtml: "<p>Prosumer espresso machine with full manual control.</p>",
    specs: [
      { label: "Boiler type", value: "Dual boiler" },
      { label: "Group heads", value: "1" },
    ],
    options: [{ name: "Control", values: ["Auto Volumetric", "Manual Paddle"] }],
    variants: [
      {
        id: "gs3-av",
        title: "Auto Volumetric",
        selectedOptions: { Control: "Auto Volumetric" },
        price: { amount: 7590, currencyCode: "USD" },
        available: true,
      },
      {
        id: "gs3-mp",
        title: "Manual Paddle",
        selectedOptions: { Control: "Manual Paddle" },
        price: { amount: 7990, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "kb90",
    handle: "kb90",
    vendor: "La Marzocco",
    category: "machines",
    title: "KB90",
    price: { amount: 16900, currencyCode: "USD" },
    images: [{ file: "kb90-main", alt: "La Marzocco KB90" }],
    descriptionHtml: "<p>La Marzocco's flagship volumetric espresso machine.</p>",
    specs: [
      { label: "Boiler type", value: "Multi-boiler" },
      { label: "Group heads", value: "2–3" },
    ],
    options: [],
    variants: [
      {
        id: "kb90-2gr",
        title: "2 Group",
        selectedOptions: {},
        price: { amount: 16900, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "atom-grinder",
    handle: "atom-grinder",
    vendor: "Eureka",
    category: "grinders",
    title: "Atom Grinder",
    price: { amount: 1690, currencyCode: "USD" },
    images: [{ file: "grinder-main", alt: "Eureka Atom grinder" }],
    descriptionHtml: "<p>On-demand espresso grinder with stepless adjustment for fast, consistent dosing.</p>",
    specs: [
      { label: "Burr type", value: "65mm flat" },
      { label: "Hopper capacity", value: "1.5 lbs" },
    ],
    options: [
      { name: "Finish", values: ["Black", "Silver"] },
      { name: "Hopper", values: ["Standard", "Large"] },
    ],
    variants: [
      {
        id: "atom-grinder-black-standard",
        title: "Black / Standard",
        selectedOptions: { Finish: "Black", Hopper: "Standard" },
        price: { amount: 1690, currencyCode: "USD" },
        available: true,
      },
      {
        id: "atom-grinder-black-large",
        title: "Black / Large",
        selectedOptions: { Finish: "Black", Hopper: "Large" },
        price: { amount: 1790, currencyCode: "USD" },
        available: true,
      },
      {
        id: "atom-grinder-silver-standard",
        title: "Silver / Standard",
        selectedOptions: { Finish: "Silver", Hopper: "Standard" },
        price: { amount: 1750, currencyCode: "USD" },
        available: true,
      },
      {
        id: "atom-grinder-silver-large",
        title: "Silver / Large",
        selectedOptions: { Finish: "Silver", Hopper: "Large" },
        price: { amount: 1850, currencyCode: "USD" },
        available: false,
      },
    ],
  },
  {
    id: "e65t-grinder",
    handle: "e65t-grinder",
    vendor: "Mahlkonig",
    category: "grinders",
    title: "E65T Grinder",
    price: { amount: 2190, currencyCode: "USD" },
    images: [{ file: "grinder-e65t", alt: "Mahlkonig E65T grinder" }],
    descriptionHtml: "<p>High-throughput commercial grinder built for consistent dosing behind a busy bar.</p>",
    specs: [
      { label: "Burr type", value: "65mm flat" },
      { label: "Hopper capacity", value: "2.5 lbs" },
    ],
    options: [],
    variants: [
      {
        id: "e65t-grinder-black",
        title: "Black",
        selectedOptions: {},
        price: { amount: 2190, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "mythos-grinder",
    handle: "mythos-grinder",
    vendor: "Eureka",
    category: "grinders",
    title: "Mythos Grinder",
    price: { amount: 3290, currencyCode: "USD" },
    images: [{ file: "grinder-shotmaster", alt: "Eureka Mythos grinder" }],
    descriptionHtml: "<p>Temperature-controlled grind chamber for shot-to-shot consistency in high-volume cafés.</p>",
    specs: [
      { label: "Burr type", value: "71mm flat" },
      { label: "Hopper capacity", value: "3 lbs" },
    ],
    options: [],
    variants: [
      {
        id: "mythos-grinder-black",
        title: "Black",
        selectedOptions: {},
        price: { amount: 3290, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "sette-grinder",
    handle: "sette-grinder",
    vendor: "Baratza",
    category: "grinders",
    title: "Sette Grinder",
    price: { amount: 599, currencyCode: "USD" },
    images: [{ file: "grinder-linea-mini-alt", alt: "Baratza Sette grinder" }],
    descriptionHtml: "<p>Compact conical burr grinder with stepped adjustment, sized for a home bar.</p>",
    specs: [
      { label: "Burr type", value: "40mm conical" },
      { label: "Hopper capacity", value: "1 lb" },
    ],
    options: [],
    variants: [
      {
        id: "sette-grinder-black",
        title: "Black",
        selectedOptions: {},
        price: { amount: 599, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "bottomless-portafilter",
    handle: "bottomless-portafilter",
    vendor: "La Marzocco",
    category: "parts-accessories",
    title: "Bottomless Portafilter",
    price: { amount: 129, currencyCode: "USD" },
    images: [{ file: "accessory-portafilter", alt: "La Marzocco bottomless portafilter" }],
    descriptionHtml: "<p>Naked portafilter for dialing in shots and diagnosing extraction issues.</p>",
    specs: [
      { label: "Fit", value: "58mm group" },
      { label: "Material", value: "Chrome-plated brass" },
    ],
    options: [{ name: "Size", values: ["53mm", "58mm"] }],
    variants: [
      {
        id: "bottomless-portafilter-53",
        title: "53mm",
        selectedOptions: { Size: "53mm" },
        price: { amount: 119, currencyCode: "USD" },
        available: true,
      },
      {
        id: "bottomless-portafilter-58",
        title: "58mm",
        selectedOptions: { Size: "58mm" },
        price: { amount: 129, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "knock-box",
    handle: "knock-box",
    vendor: "Vera",
    category: "parts-accessories",
    title: "Knock Box",
    price: { amount: 59, currencyCode: "USD" },
    images: [{ file: "accessory-knockbox", alt: "Espresso knock box" }],
    descriptionHtml: "<p>Stainless knock box with a removable, dishwasher-safe bar for fast puck disposal.</p>",
    specs: [
      { label: "Material", value: "Stainless steel" },
      { label: "Capacity", value: "~150 pucks" },
    ],
    options: [],
    variants: [
      {
        id: "knock-box-steel",
        title: "Steel",
        selectedOptions: {},
        price: { amount: 59, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "precision-tamper",
    handle: "precision-tamper",
    vendor: "Vera",
    category: "parts-accessories",
    title: "Precision Tamper",
    price: { amount: 89, currencyCode: "USD" },
    images: [{ file: "grinder-main", alt: "Espresso tamper" }],
    descriptionHtml: "<p>Calibrated tamper with a flat base for even, repeatable extraction.</p>",
    specs: [
      { label: "Base", value: "58mm flat" },
      { label: "Handle", value: "Anodized aluminum" },
    ],
    options: [],
    variants: [
      {
        id: "precision-tamper-58",
        title: "58mm",
        selectedOptions: {},
        price: { amount: 89, currencyCode: "USD" },
        available: true,
      },
    ],
  },
  {
    id: "cleaning-kit",
    handle: "cleaning-kit",
    vendor: "Vera",
    category: "parts-accessories",
    title: "Cleaning Kit",
    price: { amount: 45, currencyCode: "USD" },
    images: [{ file: "linea-mini-front-view", alt: "Espresso machine cleaning kit" }],
    descriptionHtml: "<p>Backflush detergent, brushes, and a group-head cleaning disc for weekly maintenance.</p>",
    specs: [
      { label: "Contents", value: "Detergent, brush, disc" },
      { label: "Fit", value: "Universal" },
    ],
    options: [],
    variants: [
      {
        id: "cleaning-kit-standard",
        title: "Standard",
        selectedOptions: {},
        price: { amount: 45, currencyCode: "USD" },
        available: true,
      },
    ],
  },
];

function resolveProduct(product: ProductSource): Product {
  return {
    ...product,
    images: product.images.map(({ file, alt }) => ({
      url: resolveImage(`products/placeholder/${file}`) ?? "",
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
