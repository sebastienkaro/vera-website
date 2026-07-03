"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductInfo({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((variant) => variant.available)?.id ?? product.variants[0]?.id,
  );
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
  const price = selectedVariant?.price ?? product.price;

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

      {product.variants.length > 1 && (
        <div className="mt-8">
          <p className="text-xs font-medium tracking-wide text-taupe uppercase">Options</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={!variant.available}
                onClick={() => setSelectedVariantId(variant.id)}
                className={`border px-4 py-2 text-sm transition-colors ${
                  variant.id === selectedVariantId
                    ? "border-espresso bg-espresso text-cream"
                    : "border-espresso/20 text-espresso hover:border-espresso"
                } ${!variant.available ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {variant.title}
                {!variant.available && " — Sold out"}
              </button>
            ))}
          </div>
        </div>
      )}

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
