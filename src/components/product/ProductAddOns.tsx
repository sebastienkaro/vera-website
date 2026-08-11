"use client";

import { SiteImage } from "@/components/SiteImage";
import { formatMoney } from "@/lib/money";
import type { ProductAddOn } from "@/lib/types";

/**
 * The add-ons offered with a machine: other catalog products that go in the
 * cart alongside it, and services Vera prices by hand.
 *
 * Both are ticked the same way. A priced add-on carries a variant and is added
 * with the machine; a quote-only one has no price to add, and the panel that
 * owns this list says what happens to it instead — see `ProductInfo`.
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
      <p className="text-xs font-medium tracking-wide text-taupe uppercase">Add-ons & upgrades</p>

      <ul className="mt-3 flex flex-col gap-2">
        {addOns.map((addOn) => {
          const isSelected = selectedIds.includes(addOn.id);
          return (
            <li key={addOn.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 border p-3 transition-colors ${
                  isSelected ? "border-espresso bg-sand/40" : "border-espresso/15 hover:border-espresso/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(addOn.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-espresso"
                />

                {addOn.image && (
                  <SiteImage
                    src={addOn.image.url}
                    alt={addOn.image.alt}
                    label={addOn.title}
                    className="relative hidden h-16 w-16 shrink-0 sm:block"
                    sizes="64px"
                    fit="contain"
                    padding="p-1"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-espresso">{addOn.title}</p>
                    <p className="shrink-0 text-sm text-espresso">
                      {addOn.price ? (
                        `+ ${formatMoney(addOn.price)}`
                      ) : (
                        <span className="text-espresso/60">{addOn.priceNote}</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/60">{addOn.description}</p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
