import { cookies, headers } from "next/headers";
import {
  HUBSPOT_TRACKING_COOKIE,
  HubSpotError,
  parseQuoteRequest,
  quoteFormConfigured,
  submitQuoteRequest,
} from "@/lib/hubspot";

export async function POST(request: Request) {
  if (!quoteFormConfigured()) {
    return Response.json(
      {
        error:
          "Quote requests aren't configured yet — call or text us and we'll get straight back to you.",
      },
      { status: 501 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const quote = parseQuoteRequest(body);
  if (!quote) {
    return Response.json({ error: "Please give us a name and a valid email address." }, {
      status: 400,
    });
  }

  // Both of these describe the visitor rather than the answers, so they are
  // read from the request itself — nothing the posted body says about who is
  // submitting is taken at face value.
  const cookieStore = await cookies();
  const headerList = await headers();
  const referer = headerList.get("referer");

  try {
    await submitQuoteRequest(quote, {
      pageUri: referer ?? "/quote",
      hutk: cookieStore.get(HUBSPOT_TRACKING_COOKIE)?.value,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof HubSpotError) {
      // The HubSpot message names our configuration, not the visitor's
      // mistake, so it is logged rather than shown.
      console.error(error.message);
      return Response.json(
        { error: "We couldn't send that just now. Try again, or call us and we'll take it down." },
        { status: 502 },
      );
    }
    throw error;
  }
}
