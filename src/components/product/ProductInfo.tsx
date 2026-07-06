"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductInfo({ product }: { product: Product }) {
  const initialVariant = product.variants.find((variant) => variant.available) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(initialVariant?.selectedOptions ?? {});

  const selectedVariant =
    product.variants.find((variant) =>
      product.options.every((option) => variant.selectedOptions[option.name] === selected[option.name]),
    ) ?? initialVariant;
  const price = selectedVariant?.price ?? product.price;

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

  return (
    <div>
      <nav className="text-xs font-medium tracking-wide text-taupe uppercase">
        <Link href="/machines" className="hover:text-espresso">
          Machines
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
      <p className="mt-4 text-xl text-espresso">{formatMoney(price)}</p>

      <div
        className="prose-sm mt-6 max-w-md text-sm text-espresso/70 [&_p]:leading-relaxed"
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

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={!selectedVariant?.available}
          className="bg-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-cream uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedVariant?.available ? "Add to Cart" : "Sold Out"}
        </button>
        <Link
          href="/quote"
          className="border border-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-colors hover:bg-espresso hover:text-cream"
        >
          Get a Quote
        </Link>
      </div>
    </div>
  );
}
