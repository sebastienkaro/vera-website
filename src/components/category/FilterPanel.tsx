"use client";

import {
  isFiltered,
  toggleValue,
  type CatalogFilters,
  type FacetOption,
  type Facets,
} from "@/lib/catalog-filters";

/**
 * The controls that narrow a shelf. Presentational: every change is handed
 * straight up to `CategoryBrowser`, which owns the state and the URL.
 *
 * Rendered twice — once in the desktop sidebar, once inside the mobile
 * drawer — so it takes its heading level rather than assuming one.
 */
export function FilterPanel({
  filters,
  facets,
  onChange,
  onClear,
  // The mobile drawer carries its own "Filter" header, so the panel drops
  // its heading there rather than repeating the word inside the dialog.
  showHeading = true,
}: {
  filters: CatalogFilters;
  facets: Facets;
  onChange: (next: Partial<CatalogFilters>) => void;
  onClear: () => void;
  showHeading?: boolean;
}) {
  const nothingToFilter =
    facets.vendors.length === 0 &&
    facets.types.length === 0 &&
    facets.priceRange === null &&
    !facets.canFilterByStock;

  if (nothingToFilter) return null;

  return (
    <div className="space-y-8">
      {(showHeading || isFiltered(filters)) && (
        <div className="flex items-baseline justify-between">
          {showHeading ? (
            <h2 className="text-xs font-medium tracking-wide text-espresso uppercase">Filter</h2>
          ) : (
            <span />
          )}
          {isFiltered(filters) && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs tracking-wide text-taupe uppercase transition-colors hover:text-espresso"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {facets.types.length > 0 && (
        <CheckboxFacet
          legend="Type"
          options={facets.types}
          selected={filters.types}
          onToggle={(value) => onChange({ types: toggleValue(filters.types, value) })}
        />
      )}

      {facets.vendors.length > 0 && (
        <CheckboxFacet
          legend="Manufacturer"
          options={facets.vendors}
          selected={filters.vendors}
          onToggle={(value) => onChange({ vendors: toggleValue(filters.vendors, value) })}
        />
      )}

      {facets.priceRange && (
        <fieldset>
          <legend className="text-xs font-medium tracking-wide text-espresso uppercase">
            Price
          </legend>
          {/*
            Two inputs rather than a slider. This catalog runs from a few-dollar
            gasket to a forty-thousand-dollar machine, and a linear slider over
            that range spends most of its travel in the first pixel.
          */}
          <div className="mt-4 flex items-center gap-3">
            <PriceInput
              label="Minimum price"
              placeholder={String(facets.priceRange.min)}
              value={filters.minPrice}
              onCommit={(value) => onChange({ minPrice: value })}
            />
            <span aria-hidden className="text-sm text-taupe">
              –
            </span>
            <PriceInput
              label="Maximum price"
              placeholder={String(facets.priceRange.max)}
              value={filters.maxPrice}
              onCommit={(value) => onChange({ maxPrice: value })}
            />
          </div>
        </fieldset>
      )}

      {facets.canFilterByStock && (
        <label className="flex cursor-pointer items-center gap-3 text-sm text-espresso/80">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(event) => onChange({ inStockOnly: event.target.checked })}
            className="size-4 accent-espresso"
          />
          In stock only
        </label>
      )}
    </div>
  );
}

function CheckboxFacet({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium tracking-wide text-espresso uppercase">
        {legend}
      </legend>
      <div className="mt-4 space-y-2.5">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          // A zero count means ticking this would return nothing given the
          // other filters. It stays clickable — the visitor may want to swap
          // to it — but reads as dimmed so the live choices stand out.
          const empty = option.count === 0 && !checked;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 text-sm transition-colors ${
                empty ? "text-espresso/35" : "text-espresso/80 hover:text-espresso"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option.value)}
                className="size-4 shrink-0 accent-espresso"
              />
              <span className="flex-1">{option.value}</span>
              <span className="text-xs tabular-nums text-taupe">{option.count}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * A price bound. Committed on blur and on Enter rather than per keystroke:
 * typing "1500" would otherwise filter to "1", then "15", then "150" on the
 * way, emptying the grid under the visitor's hands.
 */
function PriceInput({
  label,
  placeholder,
  value,
  onCommit,
}: {
  label: string;
  placeholder: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") return onCommit(null);
    const parsed = Number(trimmed);
    onCommit(Number.isFinite(parsed) && parsed >= 0 ? parsed : null);
  };

  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      aria-label={label}
      // Keyed on the committed value so an abandoned edit — typed, then
      // cleared elsewhere — resets instead of lingering.
      key={value ?? ""}
      defaultValue={value ?? ""}
      placeholder={placeholder}
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit(event.currentTarget.value);
        }
      }}
      className="w-full min-w-0 border border-espresso/15 bg-transparent px-3 py-2 text-sm text-espresso placeholder:text-taupe focus:border-espresso focus:outline-none"
    />
  );
}
