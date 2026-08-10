import { Suspense } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { CategoryNav } from "@/components/category/CategoryNav";
import { getProductsByCategory } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/types";

/**
 * A category's shelf: every published product in it, and the way across to the
 * other two.
 *
 * All three category routes render this — they differ only in which category
 * they name and what they say about it, so the layout lives here once.
 *
 * The copy below is placeholder, written to be replaced. It is not editable
 * through `?edit`: that system is homepage-shaped end to end — one content
 * type, one stored file, one provider — so these words are edited in git until
 * someone asks for more.
 */
const INTRO: Record<ProductCategory, string> = {
  machines:
    "Traditional, super-automatic and everything between — specified for the volume you actually pull, installed by the people who service them.",
  grinders:
    "The half of the shot most bars under-buy. Flat burrs, conical burrs, single-dose and on-demand, matched to the machine beside them.",
  "parts-accessories":
    "Gaskets, baskets, filters, tampers and the spares worth keeping on the shelf — so a busy morning stays a busy morning.",
};

export async function CategoryPage({ category }: { category: ProductCategory }) {
  const products = await getProductsByCategory(category);

  return (
    <>
      <Header variant="solid" />

      <section className="px-8 py-24 sm:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold tracking-[-0.02em] text-espresso uppercase">
            The Collection
          </p>
          <div className="mt-4">
            <CategoryNav current={category} />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-sm text-espresso/60">{INTRO[category]}</p>
        </div>

        <div>
          {products.length > 0 ? (
            /*
              `CategoryBrowser` reads the filters out of the URL, which opts
              this subtree out of prerendering. The fallback is the plain
              grid — so the built HTML still lists every product for a crawler
              or a visitor whose JavaScript hasn't arrived, and the browser
              takes over on hydration.
            */
            <Suspense
              fallback={
                <div className="mt-16">
                  <ProductGrid products={products} />
                </div>
              }
            >
              <CategoryBrowser products={products} />
            </Suspense>
          ) : (
            /* An emptied or renamed collection upstream, not a wrong URL — the
               shelf is real, so this is a message rather than a 404. */
            <p className="py-16 text-center text-sm text-espresso/60">
              Nothing in {CATEGORY_LABELS[category]} right now. Text us on{" "}
              <a href={`tel:${siteConfig.contact.phone}`} className="text-espresso hover:opacity-70">
                {siteConfig.contact.phone}
              </a>{" "}
              and we&rsquo;ll tell you what we can source.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
