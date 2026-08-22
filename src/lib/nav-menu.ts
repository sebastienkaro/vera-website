/**
 * What sits under a shop link in the header.
 *
 * The three shop categories are one page each, and that page's filters are the
 * real map of the catalog — so every link in here is a shelf that already
 * exists: a category, or a category narrowed by one of the facets
 * `lib/catalog-filters` reads out of the URL. Nothing here invents a route.
 *
 * Which facets are worth naming is a merchandising decision, not a derived
 * one, so the lists are written out rather than counted off the catalog: the
 * menu should read as a short recommendation, not as every value Shopify
 * happens to hold. The values themselves must match what the store sends —
 * `vendor` and `productType`, spelled exactly — or the link lands on an empty
 * shelf.
 */

export type NavMenuLink = {
  label: string;
  href: string;
};

export type NavMenuGroup = {
  title: string;
  links: NavMenuLink[];
};

/**
 * The panel's one image, and the one thing it asks for. Every shop menu ends
 * in the same place — a conversation about a machine — so this is a quote
 * request rather than a product, and it doesn't go stale when the catalog
 * changes.
 */
export type NavMenuFeature = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: NavMenuLink;
};

export type NavMenu = {
  /** One sentence on what the category is, beside the links. */
  blurb: string;
  /** The link through to the unfiltered shelf. */
  browse: NavMenuLink;
  groups: NavMenuGroup[];
  feature: NavMenuFeature;
  /** The reassurance under the category's links, above the phone number. */
  note: string;
};

/**
 * A shelf, narrowed. Values go through `URLSearchParams` so they are escaped
 * the same way `serializeFilters` escapes them on the way back out.
 */
function shelf(path: string, params: Record<string, string | string[]> = {}): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      search.append(key, item);
    }
  }

  const query = search.toString();
  return query === "" ? path : `${path}?${query}`;
}

const QUOTE_CTA: NavMenuLink = { label: "Get a quote", href: "/quote" };

/**
 * Keyed by the href of the header link it hangs under, so the header can ask
 * for a menu with what it already has. A nav item without an entry here is
 * just a link.
 */
export const NAV_MENUS: Record<string, NavMenu> = {
  "/machines": {
    blurb:
      "Traditional and super-automatic, specified for the volume you actually pull — and installed by the people who service them.",
    browse: { label: "Shop all machines", href: "/machines" },
    groups: [
      {
        title: "Shop by type",
        links: [
          // Traditional is the two manufacturers that build one: `vendor`
          // repeats, which `parseFilters` reads as either.
          {
            label: "Traditional espresso",
            href: shelf("/machines", { vendor: ["La Marzocco", "Slayer"] }),
          },
          { label: "Super-automatic", href: shelf("/machines", { vendor: "Eversys" }) },
          { label: "In stock now", href: shelf("/machines", { stock: "1" }) },
        ],
      },
      {
        title: "Shop by brand",
        links: [
          { label: "La Marzocco", href: shelf("/machines", { vendor: "La Marzocco" }) },
          { label: "Eversys", href: shelf("/machines", { vendor: "Eversys" }) },
          { label: "Slayer", href: shelf("/machines", { vendor: "Slayer" }) },
        ],
      },
    ],
    feature: {
      image: "/images/assets/cafe-interior.avif",
      alt: "A commercial espresso machine on a tiled café bar",
      eyebrow: "Not sure which",
      title: "Spec'd to your bar",
      body: "Tell us your covers a day and we'll match the machine, install it and keep it running.",
      cta: QUOTE_CTA,
    },
    note: "Installed and serviced by our own techs. Financing available.",
  },

  "/grinders": {
    blurb:
      "The half of the shot most bars under-buy. Flat burrs, conical burrs and single-dose, matched to the machine beside them.",
    browse: { label: "Shop all grinders", href: "/grinders" },
    groups: [
      {
        title: "Shop by brand",
        links: [
          { label: "Mazzer", href: shelf("/grinders", { vendor: "Mazzer" }) },
          { label: "Mahlkönig", href: shelf("/grinders", { vendor: "Mahlkönig" }) },
          { label: "La Cimbali", href: shelf("/grinders", { vendor: "La Cimbali" }) },
          { label: "Faema", href: shelf("/grinders", { vendor: "Faema" }) },
          { label: "Faemina", href: shelf("/grinders", { vendor: "Faemina" }) },
        ],
      },
      {
        title: "Browse",
        links: [
          { label: "In stock now", href: shelf("/grinders", { stock: "1" }) },
          { label: "Burrs, hoppers & spares", href: "/parts-accessories" },
        ],
      },
    ],
    feature: {
      image: "/images/assets/barista.avif",
      alt: "A barista dosing from a commercial grinder",
      eyebrow: "Dialed in",
      title: "Matched to the machine",
      body: "The grinder decides the shot. We pair it, install it and calibrate it on site.",
      cta: QUOTE_CTA,
    },
    note: "Burr sets, hoppers and calibration — set up on the bar, not in a box.",
  },

  "/parts-accessories": {
    blurb:
      "The spares worth keeping on the shelf, and the kit around the machine — so a busy morning stays a busy morning.",
    browse: { label: "Shop all parts & accessories", href: "/parts-accessories" },
    groups: [
      {
        title: "Wear & rebuild",
        links: [
          {
            label: "Gaskets & seals",
            href: shelf("/parts-accessories", { type: "Gaskets & Seals" }),
          },
          { label: "Rebuild kits", href: shelf("/parts-accessories", { type: "Rebuild Kits" }) },
          {
            label: "Solenoid valves",
            href: shelf("/parts-accessories", { type: "Solenoid Valves" }),
          },
          {
            label: "Pumps & flow",
            href: shelf("/parts-accessories", { type: "Pumps & Flow Components" }),
          },
        ],
      },
      {
        title: "Steam, water & controls",
        links: [
          {
            label: "Steam components",
            href: shelf("/parts-accessories", { type: "Steam Components" }),
          },
          {
            label: "Fittings & tubing",
            href: shelf("/parts-accessories", { type: "Fittings & Tubing" }),
          },
          {
            label: "Electrical & controls",
            href: shelf("/parts-accessories", { type: "Electrical & Controls" }),
          },
          {
            label: "Pressure gauges",
            href: shelf("/parts-accessories", { type: "Pressure Gauges" }),
          },
          {
            label: "Hardware & body",
            href: shelf("/parts-accessories", { type: "Hardware & Body Parts" }),
          },
        ],
      },
      {
        title: "Around the machine",
        links: [
          {
            label: "Accessories",
            href: shelf("/parts-accessories", { type: "Espresso Machine Accessories" }),
          },
          {
            label: "Machine options",
            href: shelf("/parts-accessories", { type: "Espresso Machine Options" }),
          },
          {
            label: "Water filtration",
            href: shelf("/parts-accessories", { type: "Water Filtration" }),
          },
          {
            label: "Cleaning supplies",
            href: shelf("/parts-accessories", { type: "Cleaning Supplies" }),
          },
        ],
      },
    ],
    feature: {
      image: "/images/assets/barista-espresso-eversys.avif",
      alt: "A portafilter locked into the group head of an espresso machine",
      eyebrow: "Can't find it",
      title: "Send us the serial",
      body: "We stock what breaks on the machines we sell, and can source the rest.",
      cta: { label: "Request a part", href: "/quote" },
    },
    note: "Same-day shipping on stocked parts. Send a photo and the serial number.",
  },
};
