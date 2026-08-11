import Link from "next/link";

/**
 * Says plainly what this page is, so nobody mistakes the demonstration listing
 * for a live one. Shown only on the sample product — see
 * `src/lib/sample-product.ts`.
 */
export function SampleNotice() {
  return (
    <div className="border-b border-espresso/10 bg-sand">
      <div className="mx-auto max-w-6xl px-8 py-5 sm:px-12">
        <p className="text-xs font-medium tracking-wide text-taupe uppercase">Sample listing</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-espresso/70">
          A demonstration of a product page with every section filled in: a full photo set, a
          two-part configuration picker, add-ons that go in the cart with the machine, and complete
          technical specifications. The machine, its configurations and their prices are live from
          Shopify — the highlights, specs and documents are La Marzocco&rsquo;s published material,
          and the delivery, install and warranty lines are for Vera to confirm. Nothing in the
          catalog carries this data yet, so no live listing can show it.{" "}
          <Link href="/machines" className="underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso">
            Browse the real machines
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
