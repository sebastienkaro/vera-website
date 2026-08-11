"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { ProductAddOns } from "@/components/product/ProductAddOns";
import { formatMoney } from "@/lib/money";
import { CATEGORY_LABELS, type Money, type Product } from "@/lib/types";

/** "the filtration package and the maintenance plan" — for the quote note. */
const LIST_FORMAT = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

export function ProductInfo({ product }: { product: Product }) {
  const { add, addLines, pending } = useCart();
  const initialVariant = product.variants.find((variant) => variant.available) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(initialVariant?.selectedOptions ?? {});
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  const selectedVariant =
    product.variants.find((variant) =>
      product.options.every((option) => variant.selectedOptions[option.name] === selected[option.name]),
    ) ?? initialVariant;
  const price = selectedVariant?.price ?? product.price;

  const addOns = product.addOns ?? [];
  const selectedAddOns = addOns.filter((addOn) => selectedAddOnIds.includes(addOn.id));
  // Two kinds of add-on, and they part company at the cart: one has a variant
  // to add, the other is priced by a person. See `ProductAddOn`.
  const purchasableAddOns = selectedAddOns.filter((addOn) => addOn.merchandiseId && addOn.price);
  const quotedAddOns = selectedAddOns.filter((addOn) => !addOn.merchandiseId);

  const total: Money = {
    amount: purchasableAddOns.reduce((sum, addOn) => sum + (addOn.price?.amount ?? 0), price.amount),
    currencyCode: price.currencyCode,
  };

  // Given the other currently selected options, is there any variant with
  // this value that's in stock? Mirrors how Shopify resolves combinations
  // that don't exist or are sold out as you narrow down the options.
  function isValueAvailable(optionName: string, value: string) {
    return product.variants.some(
      (variant) =>
        variant.available &&
        variant.selectedOptions[optionName] === value &&
        product.options.every(
          (option) => option.name === optionName || variant.selectedOptions[option.name] === selected[option.name],
        ),
    );
  }

  // What happens to the ticked add-ons that have no price to add — said in a
  // sentence rather than assembled in JSX, where the spaces between the
  // singular and plural pieces are easy to lose.
  const quotedNote =
    quotedAddOns.length === 0
      ? null
      : `${LIST_FORMAT.format(quotedAddOns.map((addOn) => addOn.title))} ${
          quotedAddOns.length === 1 ? "is" : "are"
        } priced against your site rather than sold online — ask for a quote and we'll include ${
          quotedAddOns.length === 1 ? "it" : "them"
        } with your install.`;

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  function addConfigurationToCart() {
    if (!selectedVariant) return;
    // One change, not one per line — the machine and everything ticked with it
    // reach Shopify together. `add` is the same call with a single line.
    addLines([
      { merchandiseId: selectedVariant.id },
      ...purchasableAddOns.map((addOn) => ({ merchandiseId: addOn.merchandiseId as string })),
    ]);
  }

  return (
    <div>
      <nav className="text-xs font-medium tracking-wide text-taupe uppercase">
        {/* The category slugs are the `ProductCategory` values themselves, so
            the breadcrumb needs no mapping table — see `CATEGORY_LABELS`. */}
        <Link href={`/${product.category}`} className="hover:text-espresso">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-espresso">{product.title}</span>
      </nav>

      <p className="mt-6 text-xs font-medium tracking-wide text-taupe uppercase">
        {product.vendor}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-espresso sm:text-4xl">
        {product.title}
      </h1>
      {product.subtitle && (
        <p className="mt-3 max-w-md text-base leading-relaxed text-espresso/70">{product.subtitle}</p>
      )}
      <p className="mt-4 text-xl text-espresso">{formatMoney(price)}</p>

      <div
        className="prose-sm mt-6 max-w-md text-sm text-espresso/70 [&_p]:leading-relaxed [&_p+p]:mt-3"
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />

      {product.options.map((option) => (
        <div key={option.name} className="mt-8">
          <p className="text-xs font-medium tracking-wide text-taupe uppercase">{option.name}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selected[option.name] === value;
              const isAvailable = isValueAvailable(option.name, value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-espresso bg-espresso text-cream"
                      : "border-espresso/20 text-espresso hover:border-espresso"
                  } ${!isAvailable ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {value}
                  {!isAvailable && " — Sold out"}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {addOns.length > 0 && (
        <ProductAddOns addOns={addOns} selectedIds={selectedAddOnIds} onToggle={toggleAddOn} />
      )}

      {/* The running total only earns its space once there is something to
          total up — a machine on its own already shows its price above. */}
      {purchasableAddOns.length > 0 && (
        <dl className="mt-8 border-t border-espresso/10 pt-4 text-sm">
          <div className="flex items-baseline justify-between gap-4 py-1">
            <dt className="text-espresso/60">
              {product.title}
              {selectedVariant && product.options.length > 0 && (
                <span className="text-espresso/40"> · {selectedVariant.title}</span>
              )}
            </dt>
            <dd className="shrink-0 text-espresso">{formatMoney(price)}</dd>
          </div>
          {purchasableAddOns.map((addOn) => (
            <div key={addOn.id} className="flex items-baseline justify-between gap-4 py-1">
              <dt className="text-espresso/60">{addOn.title}</dt>
              <dd className="shrink-0 text-espresso">{formatMoney(addOn.price as Money)}</dd>
            </div>
          ))}
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-espresso/10 pt-3">
            <dt className="text-xs font-medium tracking-wide text-taupe uppercase">Configuration total</dt>
            <dd className="shrink-0 text-lg font-medium text-espresso">{formatMoney(total)}</dd>
          </div>
        </dl>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={!selectedVariant?.available || pending}
          onClick={() =>
            addOns.length > 0
              ? addConfigurationToCart()
              : selectedVariant && add(selectedVariant.id)
          }
          className="bg-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-cream uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!selectedVariant?.available
            ? "Sold Out"
            : pending
              ? "Adding…"
              : purchasableAddOns.length > 0
                ? `Add ${purchasableAddOns.length + 1} items to cart`
                : "Add to Cart"}
        </button>
        <Link
          href="/quote"
          className="border border-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-colors hover:bg-espresso hover:text-cream"
        >
          Get a Quote
        </Link>
      </div>

      {quotedNote && (
        <p className="mt-4 max-w-md text-xs leading-relaxed text-espresso/60">{quotedNote}</p>
      )}

      {product.purchaseNotes && product.purchaseNotes.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2 border-t border-espresso/10 pt-6">
          {product.purchaseNotes.map((note) => (
            <li key={note} className="flex gap-3 text-xs text-espresso/60">
              <span aria-hidden className="text-espresso/30">
                —
              </span>
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
