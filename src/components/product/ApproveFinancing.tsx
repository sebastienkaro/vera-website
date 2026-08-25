"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import {
  APPROVE_CURRENCY,
  APPROVE_LOADER_SRC,
  APPROVE_MINIMUM_PRICE,
  APPROVE_URL,
} from "@/lib/approve";
import type { Money, Product, ProductAddOn } from "@/lib/types";

/**
 * `<approve-button>` is defined by Approve's script, so TypeScript has to be
 * told it exists. Only the attributes this site sets are declared: `price`,
 * `model`, `qty` and `type` are the four the element watches, and
 * `application-type` decides whether the application opens over the page or in
 * a new tab.
 */
declare module "react" {
  // React's contract for adding an element to JSX is a namespace; there is no
  // module-syntax form of it to prefer.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "approve-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        price: number;
        model: string;
        qty: number;
        type: "new_product";
        "application-type": "embedded_app" | "hosted_app";
      };
    }
  }
}

/**
 * The parts of the button that no custom property reaches.
 *
 * Approve's button draws itself in a shadow root and exposes most of its
 * appearance as custom properties — those are set in `globals.css`, with the
 * rest of the site's colours. The rest is hard-coded in its own stylesheet: a
 * drop shadow that belongs to a different site, tracking the site's other
 * buttons don't have, and a typeface the page doesn't load. The typeface can't
 * simply be inherited back, either, because everything above it in that root
 * is reset to the browser's initial styles.
 *
 * Appending a stylesheet of our own to the same root is the only way past
 * them, and it beats overwriting inline styles because it survives the widget
 * re-rendering its own contents.
 */
const SHADOW_OVERRIDES = `
  .approve_button { box-shadow: none; }
  .teaser_container { letter-spacing: 0.025em; }
  .powered-by-text { font-family: var(--button_font); }
`;

/**
 * "Finance for as low as $754/mo", under the buy buttons.
 *
 * The price quoted is the configuration total rather than the machine's own
 * price: the add-ons a buyer ticks are part of what they'd be financing, and
 * the payment shown should be the payment for what's on screen. `model` is the
 * same configuration written out, which is what Approve carries into the
 * application and what a lender ends up reading.
 *
 * Renders nothing without an account id, and nothing on a listing too cheap
 * for a term — see `APPROVE_MINIMUM_PRICE`.
 */
export function ApproveFinancing({
  approveId,
  product,
  options,
  addOns,
  price,
}: {
  approveId: string;
  product: Product;
  /** The currently selected value of each of the product's options. */
  options: Record<string, string>;
  /** The add-ons whose prices are in `price` — the ones being financed. */
  addOns: ProductAddOn[];
  /** The configuration total. */
  price: Money;
}) {
  const button = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = button.current;
    if (!element) return;

    // The shadow root doesn't exist until the element is upgraded, which is
    // whenever the plugin finishes loading — after this effect, on a first
    // visit, and before it on any page reached from that one.
    let cancelled = false;
    customElements.whenDefined("approve-button").then(() => {
      if (cancelled || !element.shadowRoot) return;
      const style = document.createElement("style");
      style.textContent = SHADOW_OVERRIDES;
      element.shadowRoot.appendChild(style);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (price.currencyCode !== APPROVE_CURRENCY || price.amount < APPROVE_MINIMUM_PRICE) {
    return null;
  }

  // What the buyer configured, in one line: the machine, then each option they
  // picked, then anything ticked alongside it.
  const model = [
    `${product.vendor} ${product.title}`,
    ...product.options.map((option) => `${option.name}: ${options[option.name]}`),
    ...addOns.map((addOn) => `+ ${addOn.title}`),
  ].join(" | ");

  return (
    <div className="mt-6 w-full max-w-sm">
      {/* Approve's snippet, which sets the account up and then loads the
          plugin. Kept as one script because the loader errors out if the
          account id isn't already on `window` when it runs, and two scripts
          would be two chances to get that order wrong. */}
      <Script id="approve-plugin" strategy="afterInteractive">{`
        window.kwipped_approve = window.kwipped_approve || {};
        window.kwipped_approve.url = ${JSON.stringify(APPROVE_URL)};
        window.kwipped_approve.approve_id = ${JSON.stringify(approveId)};
        if (!document.querySelector('approve-widget, approve-plugin')) {
          document.body.appendChild(document.createElement('approve-widget'));
        }
        document.body.appendChild(
          Object.assign(document.createElement('script'), { src: ${JSON.stringify(
            APPROVE_LOADER_SRC,
          )} })
        );
      `}</Script>

      <approve-button
        ref={button}
        application-type="embedded_app"
        type="new_product"
        price={price.amount}
        model={model}
        qty={1}
      />
    </div>
  );
}
