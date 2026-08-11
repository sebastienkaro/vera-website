import type { Product } from "@/lib/types";

/**
 * One product page with every optional field filled in.
 *
 * Nothing in the Shopify catalog carries highlights, grouped specs, a
 * configuration table, add-ons or documents yet — the Storefront API has no
 * field for any of it, and the store defines no metafields for them — so no
 * real listing can show what the product page is capable of. This is that
 * listing: a demonstration of the finished layout, and a worked example of the
 * data each section needs.
 *
 * It is deliberately built on a machine the store really sells. The photography
 * is La Marzocco's own, the description, specifications and documents are the
 * manufacturer's published figures, and the variants carry the real Shopify
 * variant ids at the real prices — so the configuration picker, the add-ons and
 * the cart all behave exactly as they would on a live listing rather than
 * miming it. The service copy (delivery, install, lead time) is illustrative
 * and is Vera's to confirm before any of it is published.
 *
 * The page is reachable only by its own URL: it is not in `getProducts`, so it
 * appears in no category listing, no search result and no related-products row.
 *
 * ## Publishing this for real
 *
 * Each block below maps to something Shopify can hold:
 *
 * - `images` — product media on the Shopify product.
 * - `options` / `variants` — the live listing has one "Configuration" option
 *   with six combined values; splitting it into "Groups" × "Control" is what
 *   produces the two-row picker here, and is done in the Shopify admin.
 * - `highlights`, `specGroups`, `specTable`, `addOns`, `documents` — product
 *   metafields, read in `src/lib/shopify.ts` and mapped in `toProduct`.
 */

export const SAMPLE_PRODUCT_HANDLE = "sample-la-marzocco-linea-classic-s";

const USD = (amount: number) => ({ amount, currencyCode: "USD" });

const IMAGE_DIR = "/images/products/sample-linea-classic-s";

/**
 * The six real variants, as Shopify holds them: two options here, one combined
 * option upstream. The ids are live, which is what lets Add to Cart work.
 */
const CONFIGURATIONS: {
  id: string;
  groups: string;
  control: string;
  price: number;
}[] = [
  {
    id: "gid://shopify/ProductVariant/51965988733159",
    groups: "1 Group",
    control: "Semi-Automatic (EE)",
    price: 10750,
  },
  {
    id: "gid://shopify/ProductVariant/51965988765927",
    groups: "1 Group",
    control: "Auto-Volumetric (AV)",
    price: 12370,
  },
  {
    id: "gid://shopify/ProductVariant/51965988798695",
    groups: "2 Group",
    control: "Semi-Automatic (EE)",
    price: 12730,
  },
  {
    id: "gid://shopify/ProductVariant/51965988831463",
    groups: "2 Group",
    control: "Auto-Volumetric (AV)",
    price: 16670,
  },
  {
    id: "gid://shopify/ProductVariant/51965988864231",
    groups: "3 Group",
    control: "Semi-Automatic (EE)",
    price: 16310,
  },
  {
    id: "gid://shopify/ProductVariant/51965988896999",
    groups: "3 Group",
    control: "Auto-Volumetric (AV)",
    price: 20780,
  },
];

const SAMPLE_PRODUCT: Product = {
  id: "sample/la-marzocco-linea-classic-s",
  handle: SAMPLE_PRODUCT_HANDLE,
  vendor: "La Marzocco",
  title: "La Marzocco Linea Classic S",
  subtitle: "The workhorse of the high-volume cafe — dual boilers, saturated groups, three decades of service history.",
  category: "machines",
  productType: "Espresso Machines",
  // The "from" price, as everywhere else on the site: the cheapest variant.
  price: USD(10750),
  images: [
    { url: `${IMAGE_DIR}/front-three-quarter.png`, alt: "La Marzocco Linea Classic S, 2 group, front three-quarter view" },
    { url: `${IMAGE_DIR}/front.png`, alt: "La Marzocco Linea Classic S, 2 group, straight-on front view" },
    { url: `${IMAGE_DIR}/side.png`, alt: "La Marzocco Linea Classic S, 2 group, side profile" },
    { url: `${IMAGE_DIR}/back-three-quarter.png`, alt: "La Marzocco Linea Classic S, 2 group, rear three-quarter view" },
    { url: `${IMAGE_DIR}/detail-controls.jpg`, alt: "Close-up of the Linea Classic S control panel, shot timer and steam knob" },
    { url: `${IMAGE_DIR}/on-the-bar.jpg`, alt: "Linea Classic S installed on a cafe bar alongside two grinders" },
  ],
  descriptionHtml: `
    <p>The Linea Classic has occupied the cafes, roasteries and chains whose names defined
    specialty coffee for three decades, and it earned that place by being reserved, reliable
    and consistent. The Linea Classic S keeps the shape and adds what a modern bar asks of it:
    dual PID control over separate coffee and steam boilers, per-group shot timers, and an
    electronics board that talks to the La Marzocco Pro App.</p>
    <p>Saturated brew groups hold temperature shot after shot through a rush. Insulated boilers
    cut the energy the machine spends holding that temperature. The half-turn steam valve asks
    less of a barista's wrist across a shift of milk drinks. Available in one, two and three
    group bodies, in semi-automatic (EE) or auto-volumetric (AV) control.</p>
    <p>Every machine Vera sells is delivered, installed and commissioned by our own certified
    technicians, and backed by a 13-month parts warranty.</p>
  `,
  specs: [],
  options: [
    { name: "Groups", values: ["1 Group", "2 Group", "3 Group"] },
    { name: "Control", values: ["Semi-Automatic (EE)", "Auto-Volumetric (AV)"] },
  ],
  variants: CONFIGURATIONS.map((configuration) => ({
    id: configuration.id,
    title: `${configuration.groups} – ${configuration.control}`,
    selectedOptions: { Groups: configuration.groups, Control: configuration.control },
    price: USD(configuration.price),
    available: true,
  })),
  highlights: [
    {
      title: "Dual insulated boilers",
      description:
        "Separate coffee and steam boilers, each insulated — espresso extraction and milk steaming stop competing for the same heat, and the machine spends less energy holding temperature.",
    },
    {
      title: "Saturated brew groups",
      description:
        "The group is part of the boiler rather than plumbed to it, so brew temperature holds through a morning rush instead of drifting with the queue.",
    },
    {
      title: "Dual PID control",
      description:
        "Coffee and steam boiler temperatures are set independently from the front panel — dial in a lighter roast without giving up steam pressure.",
    },
    {
      title: "Half-turn steam valve",
      description:
        "Full steam in a half turn. Across four hundred milk drinks a day, that is a measurable amount of a barista's wrist.",
    },
    {
      title: "Per-group shot timers",
      description:
        "Every group shows its own extraction time on the panel, so shot discipline does not depend on whoever remembered to start a phone timer.",
    },
    {
      title: "Pro App compatible",
      description:
        "Scheduling, temperature and diagnostics from a phone — and the same telemetry Vera's technicians use to spot a service issue before it takes the bar down.",
    },
  ],
  addOns: [
    {
      id: "grinder-e65t",
      title: "Mahlkönig E65T Grind-by-Sync",
      description:
        "The espresso grinder we pair with most Linea installs — 65 mm flat burrs, stepless adjustment, dosing synced to your shot times.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0787/5025/3287/files/e65t.png?v=1775785458",
        alt: "Mahlkönig E65T Grind-by-Sync espresso grinder",
      },
      merchandiseId: "gid://shopify/ProductVariant/51965989716199",
      price: USD(2699),
    },
    {
      id: "tamper-puqpress-m3",
      title: "Puqpress M3 automatic tamper",
      description:
        "Level, repeatable tamping at a fixed pressure — removes the last inconsistent step between grinder and group, and a common source of barista wrist injury.",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0787/5025/3287/files/puqpress-m3.png?v=1775785355",
        alt: "Puqpress M3 automatic espresso tamper",
      },
      merchandiseId: "gid://shopify/ProductVariant/51965989748967",
      price: USD(1480),
    },
    {
      id: "water-filtration",
      title: "Water filtration & softening package",
      description:
        "Specified against a test of your water. Scale is what kills commercial boilers, and it is the one warranty exclusion we see most often.",
      priceNote: "Quoted with install",
    },
    {
      id: "maintenance-plan",
      title: "Preventative maintenance plan",
      description:
        "Scheduled 3, 6 and 12-month service visits on the manufacturer's interval — gaskets, screens, valves and a full descale — carried out on site.",
      priceNote: "Quoted annually",
    },
  ],
  purchaseNotes: [
    "Delivered, installed and commissioned by Vera's certified technicians",
    "13-month parts-only warranty",
    "Typically ships in 2–3 weeks from order",
    "Financing available — ask us for terms",
  ],
  specTable: {
    title: "By configuration",
    columns: ["1 Group", "2 Group", "3 Group"],
    rows: [
      { label: "Width", values: ['20"', '28"', '37"'] },
      { label: "Height", values: ['20.5"', '20.5"', '20.5"'] },
      { label: "Depth", values: ['23"', '23"', '23"'] },
      { label: "Weight", values: ["90 lbs", "130 lbs", "164 lbs"] },
      { label: "Coffee boiler", values: ["1.8 L", "3.4 L", "5.0 L"] },
      { label: "Steam boiler", values: ["3.5 L", "7.0 L", "11.0 L"] },
      { label: "Wattage (min)", values: ["2,500 W", "3,350 W", "4,930 W"] },
      { label: "Wattage (max)", values: ["—", "5,670 W", "7,790 W"] },
      {
        label: "Voltage",
        values: [
          "220V single phase",
          "200V single · 220V single/3 phase · 380V 3 phase",
          "200V single · 220V single/3 phase · 380V 3 phase",
        ],
      },
    ],
  },
  specGroups: [
    {
      title: "Brewing",
      specs: [
        { label: "Group type", value: "Saturated, thermally stable" },
        { label: "Boiler configuration", value: "Dual — separate coffee and steam, insulated" },
        { label: "Temperature control", value: "Dual PID (coffee and steam)" },
        { label: "Brew pressure", value: "9 bar, adjustable" },
        { label: "Pump", value: "Rotary vane, motor mounted in-body" },
        { label: "Portafilters", value: "58 mm, one single and one double per group" },
      ],
    },
    {
      title: "Controls",
      specs: [
        { label: "Control versions", value: "Semi-automatic (EE) or auto-volumetric (AV)" },
        { label: "Programming", value: "3-button interface — left group (AV) or board (EE)" },
        { label: "Shot timer", value: "Per group, on the front panel" },
        { label: "Steam wands", value: "Half-turn valve; Pro Touch cool-touch on special order" },
        { label: "Water sensor", value: "Measures conductivity and hardness at the inlet" },
        { label: "Connectivity", value: "La Marzocco Pro App — scheduling and diagnostics" },
      ],
    },
    {
      title: "Installation",
      specs: [
        { label: "Water inlet", value: '3/8" BSP, filtered and softened supply required' },
        { label: "Drain", value: 'Gravity drain, 3/4" line to floor sink' },
        { label: "Counter clearance", value: '2" behind the machine for service access' },
        { label: "Electrical", value: "Dedicated circuit — see the configuration table above" },
        { label: "Certification", value: "ETL listed, NSF certified" },
        { label: "Countries of origin", value: "Florence, Italy" },
      ],
    },
    {
      title: "Included with every machine",
      specs: [
        { label: "Delivery", value: "Curbside to placement, Connecticut and NY metro" },
        { label: "Installation", value: "Plumbing, electrical hook-up and commissioning" },
        { label: "Water test", value: "On-site test and filtration specification" },
        { label: "Training", value: "Half-day barista and cleaning orientation" },
        { label: "Warranty", value: "13 months, parts only" },
        { label: "Support", value: "Phone and on-site service across the Vera territory" },
      ],
    },
  ],
  documents: [
    { label: "Product sheet", href: "https://lamarzoccousa.com/documents/linea-classic-s-product-sheet/" },
    { label: "Installation guide", href: "https://lamarzoccousa.com/documents/linea-classic-s-installation-guide/" },
    { label: "User manual", href: "https://lamarzoccousa.com/documents/linea-classic-s-manual/" },
    { label: "Parts catalog", href: "https://lamarzoccousa.com/documents/linea-classic-s-parts-catalog/" },
  ],
};

export function getSampleProduct(): Product {
  return SAMPLE_PRODUCT;
}
