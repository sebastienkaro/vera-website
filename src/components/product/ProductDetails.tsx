/**
 * The long half of a product description — everything from its first heading
 * on, which for a machine means inclusions, specifications and warranty.
 *
 * It sits below the gallery rather than beside the price so that the buy
 * column stays short enough to keep the buttons on screen. The styling lives
 * here because the markup comes from Shopify as a blob of HTML: there are no
 * class names to hook, so every element is reached through the parent.
 */
export function ProductDetails({ html }: { html: string }) {
  if (!html.trim()) return null;

  return (
    <div
      className={[
        "max-w-2xl text-sm leading-relaxed text-espresso/70",
        // Headings: small, spaced capitals with a rule under them, so the
        // sections read as a spec sheet rather than as an article.
        "[&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-espresso/10 [&_h2]:pb-2",
        "[&_h2]:text-xs [&_h2]:font-medium [&_h2]:tracking-wide [&_h2]:text-taupe [&_h2]:uppercase",
        "[&_h2:first-child]:mt-0",
        "[&_h3]:mt-6 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-espresso",
        "[&_p]:mt-4",
        // Two columns on wide screens: these lists are long and narrow, and a
        // single column of short items leaves most of the row empty.
        "[&_ul]:mt-4 [&_ul]:grid [&_ul]:gap-x-8 [&_ul]:gap-y-2 sm:[&_ul]:grid-cols-2",
        "[&_li]:relative [&_li]:pl-4",
        "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-espresso/30 [&_li]:before:content-['—']",
        "[&_strong]:font-medium [&_strong]:text-espresso",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
