"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product, ProductCategory } from "@/lib/types";

type Filter = "all" | ProductCategory;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All,", value: "all" },
  { label: "Machines,", value: "machines" },
  { label: "Grinders,", value: "grinders" },
  { label: "Parts & Accessories", value: "parts-accessories" },
];

export function CollectionGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = filter === "all" ? products : products.filter((product) => product.category === filter);

  return (
    <div>
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[-0.02em] text-espresso uppercase">The Collection</p>
        <h2 className="mt-4 flex flex-wrap justify-center gap-x-3 text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-5xl">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`cursor-pointer uppercase transition-colors ${
                filter === item.value ? "text-espresso" : "text-taupe hover:text-espresso/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </h2>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
