"use client";

import { formatMoney } from "@/lib/money";
import type { ProductAddOn } from "@/lib/types";

/**
 * The add-ons offered with a machine: other catalog products that go in the
 * cart alongside it, and services Vera prices by hand.
 *
 * Laid out as a row that scrolls sideways rather than a stacked list. A machine
 * can offer a dozen of these, and a dozen full-width rows pushes the total and
 * the buy button off the screen — the one place on the site where they must not
 * be. Sideways, the whole set costs a fixed amount of height whatever its
 * length.
 *
 * Each card is only what you need in order to choose: name and price. The
 * detail belongs in the specifications below, not stacked twelve deep here.
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
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-medium tracking-wide text-taupe uppercase">Add-ons &amp; upgrades</p>
        <p className="text-xs text-espresso/40">{addOns.length} available</p>
      </div>

      {/* Negative margin lets the row bleed to the edge of the column, so the
          last card is visibly cut off — the cue that there is more sideways. */}
      <ul className="-mx-1 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2">
        {addOns.map((addOn) => {
          const isSelected = selectedIds.includes(addOn.id);
          return (
            <li key={addOn.id} className="snap-start">
              <label
                title={addOn.description}
                className={`flex h-full w-44 cursor-pointer flex-col justify-between gap-3 border p-3 transition-colors ${
                  isSelected
                    ? "border-espresso bg-sand/40"
                    : "border-espresso/15 hover:border-espresso/40"
                }`}
              >
                <span className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(addOn.id)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-espresso"
                  />
                  <span className="text-xs leading-snug text-espresso">{addOn.title}</span>
                </span>
                <span className="text-sm tabular-nums text-espresso/70">
                  {addOn.price ? `+ ${formatMoney(addOn.price)}` : addOn.priceNote}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
