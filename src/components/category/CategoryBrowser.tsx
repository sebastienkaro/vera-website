"use client";

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
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
import type { Product } from "@/lib/types";

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
export function CategoryBrowser({ products }: { products: Product[] }) {
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
    <div className="mx-auto mt-16 max-w-6xl">
      <SearchField
        value={filters.query}
        onChange={(query) => setFilters({ query })}
        total={products.length}
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
        <aside className="hidden lg:block">
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
  total,
}: {
  value: string;
  onChange: (value: string) => void;
  total: number;
}) {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);

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

  return (
    <div className="mx-auto max-w-2xl">
      <label className="block">
        <span className="sr-only">Search products</span>
        <input
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Search ${total} products by model, manufacturer or type`}
          className="w-full border-b border-espresso/20 bg-transparent py-3 text-center text-sm text-espresso placeholder:text-taupe focus:border-espresso focus:outline-none"
        />
      </label>
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
