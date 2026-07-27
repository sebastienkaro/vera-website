import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { TAGS } from "@/lib/shopify/config";

/**
 * Shopify product webhook receiver.
 *
 * Point `products/create`, `products/update` and `products/delete` at
 * `https://<site>/api/shopify/revalidate` and set `SHOPIFY_WEBHOOK_SECRET` to
 * the webhook signing secret shown in the Shopify admin. Without the webhook
 * the catalog still refreshes on the `SHOPIFY_REVALIDATE_SECONDS` interval;
 * this just makes edits show up right away.
 */

/** Shopify's signature covers the raw body, so the body is read as text. */
function isValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest();

  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64");
  } catch {
    return false;
  }

  // timingSafeEqual throws on a length mismatch, which is itself a mismatch.
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const secret = (process.env.SHOPIFY_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    // Refuse rather than accept unauthenticated cache-busting requests.
    return NextResponse.json({ error: "SHOPIFY_WEBHOOK_SECRET is not set." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256");

  if (!isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "unknown";

  let handle: string | undefined;
  try {
    handle = (JSON.parse(rawBody) as { handle?: string }).handle;
  } catch {
    // A body we can't read still tells us something changed; fall through and
    // revalidate the catalog rather than dropping the notification.
  }

  // "max" gives stale-while-revalidate: visitors keep getting the cached page
  // while the next request refreshes it in the background.
  revalidateTag(TAGS.products, "max");
  if (handle) revalidateTag(TAGS.product(handle), "max");

  return NextResponse.json({ revalidated: true, topic, handle: handle ?? null });
}
