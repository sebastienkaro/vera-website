/**
 * Approve: the equipment financing offer under the buy buttons.
 *
 * Approve (by Kwipped) quotes a monthly payment against a configuration's
 * price and then takes the application itself, on their side. Nothing about
 * the applicant, their credit or the lender's answer passes through this site
 * — all this end supplies is what was configured and what it costs.
 *
 * The integration is one script and one custom element. The script defines
 * `<approve-button>`; setting `price`, `model`, `qty` and `type` on one makes
 * it fetch the teaser rate — "finance for as low as $754/mo" — and open the
 * application over the page. See `ApproveFinancing` for both halves.
 *
 * Approve's own plugin can instead find the price and the machine name by
 * reading the page, driven by CSS selectors held on the account. That is how
 * the Webflow site did it, and it is the wrong half of the integration to use
 * here: the selectors live outside this repository, so a class rename would
 * break financing with nothing in the diff to show it. Feeding the element
 * directly keeps the configuration flowing through props, where the rest of
 * this page's state already is.
 */

/**
 * Where the application opens if the embedded one can't. The plugin reads it
 * off `window.kwipped_approve` rather than knowing its own origin.
 */
export const APPROVE_URL = "https://www.kwipped.com";

/** Approve's entry point: a shim that loads the account's plugin build. */
export const APPROVE_LOADER_SRC =
  "https://api.kwipped.com/approve/plugin/3.0/approve_plugin_loader.php";

/**
 * Below this there is no term worth quoting, and Approve's own integration
 * hides the button rather than show a payment of a few dollars a month. The
 * same floor is what keeps the button off a $12 gasket — and off any machine
 * listed at nothing, which is how the catalog says "ask us".
 */
export const APPROVE_MINIMUM_PRICE = 500;

/** Approve underwrites in US dollars only. */
export const APPROVE_CURRENCY = "USD";

/**
 * Vera's Approve account, or null when this deploy has none.
 *
 * Not a secret — it ships in the source of every page that offers financing,
 * and Approve scopes it to the domains registered on the account — but read
 * server-side all the same, like the HubSpot ids, so it isn't prefixed
 * `NEXT_PUBLIC_`. Unset means no financing button anywhere, which is what a
 * preview deploy on an unregistered domain should show.
 */
export function approveId(): string | null {
  return process.env.APPROVE_ID?.trim() || null;
}
