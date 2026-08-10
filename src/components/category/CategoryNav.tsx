import Link from "next/link";
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/types";

/** In display order, as the homepage lists them. */
const CATEGORIES: ProductCategory[] = ["machines", "grinders", "parts-accessories"];

/**
 * Moving between shelves, as the first group in the filter column.
 *
 * This used to be the page's title — all three categories set large, with the
 * current one picked out. It read well and said nothing the header's nav wasn't
 * already saying, while pushing the first product most of a screen down. As a
 * list at the top of the filters it sits where a shopper looks for it, above
 * the narrower cuts, and matches how the current site orders the same controls.
 *
 * Links rather than checkboxes on purpose: a category is a different shelf with
 * its own facets, not another filter on this one, so switching starts clean.
 */
export function CategoryNav({ current }: { current: ProductCategory }) {
  return (
    <nav aria-label="Product categories">
      <p className="text-xs font-medium tracking-wide text-espresso uppercase">Category</p>
      <ul className="mt-4 space-y-2.5">
        {CATEGORIES.map((category) => {
          const active = category === current;
          return (
            <li key={category}>
              <Link
                href={`/${category}`}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition-colors ${
                  active ? "text-espresso" : "text-espresso/55 hover:text-espresso"
                }`}
              >
                {CATEGORY_LABELS[category]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
