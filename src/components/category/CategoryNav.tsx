import Link from "next/link";
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/types";

/** In display order, as the homepage lists them. */
const CATEGORIES: ProductCategory[] = ["machines", "grinders", "parts-accessories"];

/**
 * The three categories as the page's own title.
 *
 * This is the homepage's collection heading turned into navigation: there, the
 * category words *are* the filter; here they are links, with the one you're on
 * in espresso and the others in taupe. Same gesture, so moving between shelves
 * feels like the same control the homepage taught.
 */
export function CategoryNav({ current }: { current: ProductCategory }) {
  return (
    <h1 className="flex flex-wrap justify-center gap-x-3 text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-5xl">
      {CATEGORIES.map((category, i) => (
        <span key={category}>
          {category === current ? (
            <span aria-current="page" className="text-espresso">
              {CATEGORY_LABELS[category]}
            </span>
          ) : (
            <Link href={`/${category}`} className="text-taupe transition-colors hover:text-espresso/70">
              {CATEGORY_LABELS[category]}
            </Link>
          )}
          {i < CATEGORIES.length - 1 && <span className="text-taupe">,</span>}
        </span>
      ))}
    </h1>
  );
}
