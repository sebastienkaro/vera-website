"use client";

import {
  useEffect,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryNav } from "@/components/category/CategoryNav";
import { FilterPanel } from "@/components/category/FilterPanel";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  applyFilters,
  buildFacets,
  isFiltered,
  parseFilters,
  serializeFilters,
  type CatalogFilters,
  type SortKey,
} from "@/lib/catalog-filters";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { siteConfig } from "@/lib/site-config";
import { CATEGORY_LABELS, type Product, type ProductCategory } from "@/lib/types";

/** How many products a shelf shows before asking to be opened further. */
const PAGE_SIZE = 24;

/**
 * A category's shelf, with the controls to work through it.
 *
 * Filtering happens here rather than on the server: the whole category is
 * already in the page — it is fetched at build time and a few hundred items at
 * most — so narrowing it is a array operation, and making it a round trip would
 * only add latency to something that should feel immediate.
 *
 * The state lives in the URL so a narrowed shelf can be linked, bookmarked and
 * navigated back to. `replace` rather than `push`, so ticking four filters
 * doesn't leave four entries between the visitor and the page they came from.
 */
export function CategoryBrowser({
  products,
  category,
}: {
  products: Product[];
  category: ProductCategory;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  /*
    Writing to the URL is a client-side navigation, so a ticked box would sit
    unticked for the ~100ms it takes to come back round — long enough to read as
    a dropped click on a control you tick four of in a row. The optimistic copy
    renders the change on the same frame, and React discards it once the real
    URL state lands, so there is still only one source of truth.
  */
  const [, startTransition] = useTransition();
  const [filters, setOptimisticFilters] = useOptimistic(urlFilters);

  const setFilters = (next: Partial<CatalogFilters>) => {
    const merged = { ...filters, ...next };
    startTransition(() => {
      setOptimisticFilters(merged);
      router.replace(`${pathname}${serializeFilters(merged)}`, { scroll: false });
    });
  };

  const facets = useMemo(() => buildFacets(products, filters), [products, filters]);
  const results = useMemo(() => applyFilters(products, filters), [products, filters]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  useBodyScrollLock(drawerOpen);

  const fingerprint = serializeFilters(filters);

  return (
    <div className="mx-auto mt-12 max-w-6xl">
      <SearchField
        value={filters.query}
        onChange={(query) => setFilters({ query })}
        category={category}
      />

      <div className="mt-8 flex items-center justify-between gap-4 border-b border-espresso/10 pb-4">
        <p aria-live="polite" className="text-xs tracking-wide text-espresso/60 uppercase">
          {results.length === products.length
            ? `${products.length} products`
            : `${results.length} of ${products.length}`}
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="text-xs tracking-wide text-espresso uppercase transition-opacity hover:opacity-70 lg:hidden"
          >
            Filter
            {isFiltered(filters) && <span aria-hidden> ·</span>}
          </button>

          <label className="flex items-center gap-2">
            <span className="sr-only">Sort by</span>
            <select
              value={filters.sort}
              onChange={(event) => setFilters({ sort: event.target.value as SortKey })}
              className="border border-espresso/15 bg-transparent px-3 py-2 text-xs tracking-wide text-espresso uppercase focus:border-espresso focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-10 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <aside className="hidden space-y-8 lg:block">
          <CategoryNav current={category} />
          <FilterPanel
            filters={filters}
            facets={facets}
            onChange={setFilters}
            onClear={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}
          />
        </aside>

        <div>
          {results.length > 0 ? (
            /*
              Keyed on the filters so a new set of results starts at the top of
              the shelf again — narrowing from 90 products to 5 should not leave
              an already-expanded page behind.
            */
            <Results key={fingerprint} products={results} />
          ) : (
            <NoResults onClear={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })} />
          )}
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="mb-8">
          <CategoryNav current={category} />
        </div>
        <FilterPanel
          filters={filters}
          facets={facets}
          onChange={setFilters}
          onClear={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}
          showHeading={false}
        />
      </FilterDrawer>
    </div>
  );
}

/**
 * The visible slice of a filtered shelf, and the button that lengthens it.
 *
 * Its own component so that `key` can reset how far the shelf is opened when
 * the filters change, rather than an effect reaching in to correct it after
 * the fact.
 */
function Results({ products }: { products: Product[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  return (
    <>
      <ProductGrid products={products.slice(0, visible)} />
      {visible < products.length && (
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="border border-espresso px-8 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-colors hover:bg-espresso hover:text-cream"
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
}

/**
 * The search box. Typed against local state and written to the URL a beat
 * later, so the field stays responsive under fast typing instead of waiting on
 * a route update per keystroke.
 */
function SearchField({
  value,
  onChange,
  category,
}: {
  value: string;
  onChange: (value: string) => void;
  category: ProductCategory;
}) {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);
  const id = useId();

  // Follow the URL when it changes from anywhere else — Clear all, a back
  // navigation — but not in response to this field's own writes.
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = draft;
      onChange(draft);
    }, 200);
    return () => clearTimeout(timer);
    // `onChange` closes over the current filters and changes every render;
    // depending on it here would restart the timer on each keystroke's render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const label = CATEGORY_LABELS[category].toLowerCase();

  return (
    <div className="relative mx-auto max-w-xl">
      <label htmlFor={id} className="sr-only">
        Search {label}
      </label>

      {/* The magnifier is what makes the field read as a search box at a
          glance; the rule-under-centred-placeholder it replaces read as a
          caption. Decorative, so it is hidden from assistive tech — the input
          is already labelled and typed as a search. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-espresso/45"
      >
        <circle cx="7.5" cy="7.5" r="5.25" />
        <path d="M11.5 11.5 16 16" />
      </svg>

      <input
        id={id}
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={`Search ${label} by model, manufacturer or type`}
        // The native WebKit clear affordance is suppressed in favour of the
        // button below, which renders the same way in every browser.
        className="w-full border border-espresso/20 bg-cream py-3.5 pr-20 pl-11 text-sm text-espresso placeholder:text-taupe focus:border-espresso focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />

      {draft !== "" && (
        <button
          type="button"
          onClick={() => setDraft("")}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-xs tracking-wide text-taupe uppercase transition-colors hover:text-espresso"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-espresso/60">
        Nothing matches that. Try fewer filters, or text us on{" "}
        <a href={`tel:${siteConfig.contact.phone}`} className="text-espresso hover:opacity-70">
          {siteConfig.contact.phone}
        </a>{" "}
        and we&rsquo;ll tell you what we can source.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 border border-espresso px-8 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-colors hover:bg-espresso hover:text-cream"
      >
        Clear all filters
      </button>
    </div>
  );
}

/**
 * The filters as a panel on a phone, where there is no room for a sidebar.
 * Follows the cart's drawer — same geometry and same transition — so the two
 * slide-overs on the site behave alike.
 */
function FilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    closeButton.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-espresso/40 transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Filter products"
        className={`absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-cream shadow-[0_0_3rem_rgba(20,12,6,0.35)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
          <h2 className="text-xs font-medium tracking-wide text-espresso uppercase">Filter</h2>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="text-xs tracking-wide text-taupe uppercase transition-colors hover:text-espresso"
          >
            Done
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </aside>
    </div>
  );
}
