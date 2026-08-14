import Script from "next/script";
import { portalId } from "@/lib/hubspot";

/**
 * HubSpot's chat bubble, plus the tracking it brings with it.
 *
 * One script does both jobs: it draws the launcher in the corner and sets the
 * visitor cookie that `/api/quote` later hands back with a submission, which is
 * what lets HubSpot show a quote request alongside the pages that visitor read
 * before sending it.
 *
 * Loaded `lazyOnload` — during browser idle time, after the page's own images
 * and scripts. A chat widget that arrives a second late costs nothing; one that
 * competes with the hero photograph costs a first impression.
 *
 * Renders nothing when `HUBSPOT_PORTAL_ID` is unset, so a preview deploy or a
 * local dev server doesn't put a live support channel on an unfinished page.
 */
export function HubSpotChat() {
  const portal = portalId();
  if (!portal) return null;

  return (
    <Script
      id="hs-script-loader"
      src={`https://js.hs-scripts.com/${portal}.js`}
      strategy="lazyOnload"
    />
  );
}
