import { resolveAsset, resolveImage } from "@/lib/images";

/**
 * Every piece of homepage copy and every image choice, in one place. The
 * components below `src/components/home` read from here rather than holding
 * their own strings, so changing what the site says means editing this file
 * and nothing else.
 *
 * This is also what makes the page editable at runtime: it's a plain data
 * shape, so a stored version can replace it wholesale without touching any
 * component.
 */

/** A picture, wherever it happens to live. */
export type ImageRef = {
  // "slot:hero/background" for one of the fixed slots under public/images,
  // "asset:espresso-machine" for anything in the shared pool. See the README
  // in public/images for the difference.
  ref: string;
  alt: string;
  // Shown on the striped placeholder while no file is in that spot yet.
  label: string;
};

export type HeadingSegment = { text: string; tone: "dark" | "muted" };

export type LinkButton = { label: string; href: string };

export type FeatureBlockContent = {
  heading: string;
  body: string;
  background: ImageRef;
  accent: ImageRef;
  accentSide: "left" | "right";
  textSide: "left" | "right";
};

export type HomeContent = {
  hero: {
    // One line per array entry — the mobile and desktop headings share these.
    headline: string[];
    kicker: string[];
    buttons: LinkButton[];
    // The deck of featured machines beside the buttons is entirely Shopify's —
    // the cards carry their own names and prices — so it has no content here.
    // The still behind the hero video — first paint, and the fallback whenever
    // the video doesn't play. See `resolveVideo` for the footage itself.
    background: ImageRef;
  };
  collection: { eyebrow: string };
  // The machine itself — name, photo, link — comes from Shopify, so only the
  // words around it live here. Keep the body true of any La Marzocco espresso
  // machine: which one is featured is decided in `getFeaturedMachine`, and can
  // change without anyone editing this copy.
  featuredMachine: { eyebrow: string; body: string; buttonLabel: string };
  whyVera: {
    eyebrow: string;
    heading: HeadingSegment[];
    blocks: FeatureBlockContent[];
  };
  about: {
    eyebrow: string;
    heading: HeadingSegment[];
    body: string;
    image: ImageRef;
    buttons: LinkButton[];
  };
};

const placeholderBody =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export const homeContent: HomeContent = {
  hero: {
    headline: ["Equipment built for", "those who demand", "the best"],
    kicker: ["Take a look at our collection", "or get a custom quote"],
    buttons: [
      { label: "Browse Machines", href: "/machines" },
      { label: "Get a Quote", href: "/quote" },
    ],
    background: {
      ref: "slot:hero/background",
      alt: "Vera Coffee Solutions café interior",
      label: "Café interior — hero photo",
    },
  },

  collection: { eyebrow: "The Collection" },

  featuredMachine: {
    eyebrow: "Featured Machine",
    body: "Built in Florence and specified bar by bar, a La Marzocco is the machine most cafés end up building their program around — saturated groups, temperature that holds through a rush, and parts we stock and service ourselves. Tell us your volume and we'll spec the configuration to match.",
    buttonLabel: "Learn More",
  },

  whyVera: {
    eyebrow: "Why Vera",
    heading: [
      { text: "We don't just sell the machine.", tone: "muted" },
      { text: "We engineer the whole bar.", tone: "dark" },
    ],
    blocks: [
      {
        heading: "Lorem ipsum dolor sit",
        body: placeholderBody,
        background: {
          ref: "asset:espresso-machine",
          alt: "La Marzocco espresso machine",
          label: "La Marzocco espresso machine",
        },
        accent: {
          ref: "asset:Sipping-Espresso-LaMarzocco",
          alt: "Sipping an espresso",
          label: "Sipping an espresso",
        },
        accentSide: "right",
        textSide: "left",
      },
      {
        heading: "Lorem ipsum dolor sit",
        body: placeholderBody,
        background: {
          ref: "slot:why-vera/2/background",
          alt: "Concrete counter with plants",
          label: "Concrete counter with plants",
        },
        accent: {
          ref: "asset:barista-espresso-eversys",
          alt: "Barista at an Eversys machine",
          label: "Barista at an Eversys machine",
        },
        accentSide: "left",
        textSide: "right",
      },
      {
        heading: "Lorem ipsum dolor sit",
        body: placeholderBody,
        background: {
          ref: "slot:why-vera/3/background",
          alt: "Wood slat wall with seating",
          label: "Wood slat wall with seating",
        },
        accent: {
          ref: "slot:why-vera/3/accent",
          alt: "Machine servicing",
          label: "Machine servicing",
        },
        accentSide: "right",
        textSide: "left",
      },
    ],
  },

  about: {
    eyebrow: "About Vera",
    heading: [
      { text: "Equipment, Roastery,", tone: "muted" },
      { text: "and the People Behind Both", tone: "dark" },
    ],
    body: "Vera Coffee Solutions is built by operators, for operators. From our Bridgeport, CT facility we sell, install and service the world's best commercial espresso equipment — and at our Long Island City roastery we roast coffee for cafés, restaurants and corporate accounts who want a program built around their brand.",
    image: {
      ref: "slot:about/roastery",
      alt: "Vera Coffee Solutions roastery — Long Island City",
      label: "Roastery — Long Island City",
    },
    buttons: [
      { label: "Read Our Story", href: "/about" },
      { label: "White Label Program", href: "/white-label" },
    ],
  },
};

/**
 * Turns an `ImageRef` into a public URL, or null when nothing is in that spot
 * — which is what `SiteImage` renders as a placeholder. An unrecognised prefix
 * is treated as missing rather than throwing, so a typo in the content degrades
 * to a placeholder instead of taking the page down.
 */
export function resolveRef(image: ImageRef): string | null {
  const [kind, ...rest] = image.ref.split(":");
  const name = rest.join(":");

  if (kind === "slot") return resolveImage(name);
  if (kind === "asset") return resolveAsset(name);
  return null;
}
