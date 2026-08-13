/**
 * Split a product description into the part that belongs beside the price and
 * the part that belongs below the gallery.
 *
 * The first heading is the seam: everything before it is the prose that
 * introduces the machine, everything from it on is reference material —
 * inclusions, specifications, warranty. A description with no heading is all
 * summary, capped at two paragraphs so that a long one still cannot crowd the
 * buy button off the screen.
 *
 * Descriptions arrive from Shopify as a blob of HTML with no class names to
 * hook, so the split has to work off the markup itself.
 */
export function splitDescription(html: string): { summaryHtml: string; detailsHtml: string } {
  const heading = html.search(/<h[1-6][\s>]/i);
  if (heading !== -1) {
    return { summaryHtml: html.slice(0, heading), detailsHtml: html.slice(heading) };
  }

  const paragraphs = [...html.matchAll(/<\/p>/gi)];
  if (paragraphs.length <= 2) return { summaryHtml: html, detailsHtml: "" };

  const cut = (paragraphs[1]?.index ?? 0) + "</p>".length;
  return { summaryHtml: html.slice(0, cut), detailsHtml: html.slice(cut) };
}
