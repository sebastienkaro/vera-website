/**
 * HubSpot: where a quote request goes, and where the chat widget comes from.
 *
 * Both features hang off one portal id. The quote form posts to HubSpot's
 * public form-submission endpoint, which takes no API key — a portal id and a
 * form guid are all it needs, and neither is a secret. The submission still
 * goes through the server rather than the browser so that the request can be
 * validated once, on the side we control, and so the visitor's tracking cookie
 * can be attached to it (see `HUBSPOT_TRACKING_COOKIE`).
 *
 * Nothing here throws on a missing configuration. A deploy without HubSpot
 * credentials keeps a quote page that renders and a site with no chat bubble,
 * rather than a build that fails — the catalog is the thing worth failing a
 * build over, not the CRM.
 */
const SUBMISSION_API = "https://api.hsforms.com/submissions/v3/integration/submit";

/** HubSpot's id for the contact object; every field below is a contact property. */
const CONTACT = "0-1";

/**
 * The cookie HubSpot's tracking script sets on a visitor's first page view.
 * Passing it back with a submission is what joins the form fill to everything
 * else HubSpot already knows about that browser — which pages they read, which
 * chat they started. Without it a submission still lands, just as a contact
 * with no history in front of it.
 */
export const HUBSPOT_TRACKING_COOKIE = "hubspotutk";

export class HubSpotError extends Error {}

/** What the quote form asks for. Everything but the message is one line. */
export type QuoteRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  /** Which machine they're asking about — prefilled from a product page. */
  equipment: string;
  message: string;
};

/**
 * Which HubSpot contact property each answer lands in.
 *
 * Every name here is a property HubSpot creates on every portal, so the form
 * submits successfully against an account with nothing configured on it. A
 * field naming a property the portal doesn't have fails the entire submission
 * rather than dropping that one value, which is why this list stays
 * conservative.
 *
 * `equipment` is the exception: HubSpot has no default property for "which
 * machine", so it is folded into the message body by `composeMessage` instead
 * of being sent under its own name. To give it a column of its own, create a
 * custom contact property in HubSpot and add it here.
 */
const PROPERTIES: Partial<Record<keyof QuoteRequest, string>> = {
  firstName: "firstname",
  lastName: "lastname",
  email: "email",
  phone: "phone",
  company: "company",
  message: "message",
};

export function portalId(): string | null {
  return process.env.HUBSPOT_PORTAL_ID?.trim() || null;
}

/** True when a submitted quote request has somewhere to go. */
export function quoteFormConfigured(): boolean {
  return Boolean(portalId() && process.env.HUBSPOT_QUOTE_FORM_GUID?.trim());
}

/**
 * Reads a request body into a `QuoteRequest`, or returns null if it isn't one.
 *
 * The browser checks the same things before it posts; this is the copy that
 * counts, since the endpoint is reachable without going through the form.
 */
export function parseQuoteRequest(body: unknown): QuoteRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;

  const text = (key: string): string => {
    const value = raw[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const request: QuoteRequest = {
    firstName: text("firstName"),
    lastName: text("lastName"),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    equipment: text("equipment"),
    message: text("message"),
  };

  // A name and a way to reply are the whole requirement. Anything more and the
  // form starts turning away people who wanted to talk.
  if (!request.firstName || !isEmail(request.email)) return null;

  // Long enough for a detailed enquiry, short enough that the endpoint isn't a
  // place to store things. HubSpot truncates well before this anyway.
  if (request.message.length > 5000) return null;

  return request;
}

/** Deliberately loose: HubSpot is the real judge of an address. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

/**
 * The message as it will read in HubSpot, with the machine they asked about
 * on the first line so the enquiry is legible without opening the record.
 */
function composeMessage({ equipment, message }: QuoteRequest): string {
  if (!equipment) return message;
  return message ? `Interested in: ${equipment}\n\n${message}` : `Interested in: ${equipment}`;
}

/**
 * Sends a quote request to HubSpot, resolving once HubSpot has accepted it.
 *
 * `pageUri` is the page the form was submitted from, which HubSpot shows on
 * the submission and attributes the conversion to.
 */
export async function submitQuoteRequest(
  request: QuoteRequest,
  context: { pageUri: string; hutk?: string },
): Promise<void> {
  const portal = portalId();
  const formGuid = process.env.HUBSPOT_QUOTE_FORM_GUID?.trim();
  if (!portal || !formGuid) {
    throw new HubSpotError(
      "Quote requests need HUBSPOT_PORTAL_ID and HUBSPOT_QUOTE_FORM_GUID set in the environment.",
    );
  }

  const values: QuoteRequest = { ...request, message: composeMessage(request) };
  const fields = Object.entries(PROPERTIES)
    .map(([key, name]) => ({
      objectTypeId: CONTACT,
      name,
      value: values[key as keyof QuoteRequest],
    }))
    // An empty value is a field HubSpot would blank out on an existing contact,
    // so unanswered questions are left out rather than sent as "".
    .filter((field) => field.value !== "");

  const response = await fetch(`${SUBMISSION_API}/${portal}/${formGuid}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fields,
      context: {
        pageUri: context.pageUri,
        pageName: "Request a Quote — Vera Coffee Solutions",
        ...(context.hutk ? { hutk: context.hutk } : {}),
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new HubSpotError(await describe(response));
  }
}

async function describe(response: Response): Promise<string> {
  let detail = "";
  try {
    const body = await response.json();
    // Field-level problems arrive in `errors`; everything else in `message`.
    const errors = Array.isArray(body?.errors)
      ? body.errors.map((error: { message?: string }) => error?.message).filter(Boolean)
      : [];
    detail = errors.length > 0 ? errors.join("; ") : ((body?.message as string) ?? "");
  } catch {
    // Non-JSON error bodies are rare here and add nothing useful.
  }
  return `HubSpot didn't accept the quote request (${response.status}${detail ? `: ${detail}` : ""}).`;
}
