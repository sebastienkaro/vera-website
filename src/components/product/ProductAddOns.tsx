"use client";

import { formatMoney } from "@/lib/money";
import type { ProductAddOn } from "@/lib/types";

/**
 * The add-ons offered with a machine: other catalog products that go in the
 * cart alongside it, and services Vera prices by hand.
 *
 * Both are ticked the same way. A priced add-on carries a variant and is added
 * with the machine; a quote-only one has no price to add, and the panel that
 * owns this list says what happens to it instead — see `ProductInfo`.
 *
 * A machine can offer a dozen of these, so the row is only what you need to
 * choose: name and price. The explanation sits behind a disclosure, because a
 * list of twelve paragraphs is not a list anyone reads — and it pushes the
 * rest of the page below the fold.
 */
export function ProductAddOns({
  addOns,
  selectedIds,
  onToggle,
}: {
  addOns: ProductAddOn[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mt-8">
      <p className="text-xs font-medium tracking-wide text-taupe uppercase">Add-ons &amp; upgrades</p>

      <ul className="mt-3 divide-y divide-espresso/10 border-y border-espresso/10">
        {addOns.map((addOn) => {
          const isSelected = selectedIds.includes(addOn.id);
          return (
            <li key={addOn.id} className={isSelected ? "bg-sand/30" : undefined}>
              <label className="flex cursor-pointer items-center gap-3 py-2.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(addOn.id)}
                  className="h-4 w-4 shrink-0 accent-espresso"
                />
                <span className="min-w-0 flex-1 text-sm text-espresso">{addOn.title}</span>
                <span className="shrink-0 text-sm tabular-nums text-espresso/70">
                  {addOn.price ? `+ ${formatMoney(addOn.price)}` : addOn.priceNote}
                </span>
              </label>

              {addOn.description && (
                <details className="group pb-2.5 pl-7">
                  <summary className="inline-flex cursor-pointer list-none text-xs text-espresso/50 hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso">
                    <span className="group-open:hidden">What this is</span>
                    <span className="hidden group-open:inline">Hide</span>
                  </summary>
                  <p className="mt-1.5 max-w-prose text-xs leading-relaxed text-espresso/60">
                    {addOn.description}
                  </p>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
