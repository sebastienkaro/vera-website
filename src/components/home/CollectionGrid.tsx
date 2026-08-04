"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { Editable } from "@/components/edit/Editable";
import { FEATURED_LIMIT, type Product, type ProductCategory } from "@/lib/types";

type Filter = "all" | ProductCategory;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All,", value: "all" },
  { label: "Machines,", value: "machines" },
  { label: "Grinders,", value: "grinders" },
  { label: "Parts & Accessories", value: "parts-accessories" },
];

const FILTER_ROWS = [FILTERS.slice(0, 3), FILTERS.slice(3)];

// `eyebrow` is passed in rather than read from `lib/content` directly: this is
// a client component, and the content module reaches for the filesystem to
// resolve images, which only works on the server.
export function CollectionGrid({
  products,
  eyebrow,
  limit = FEATURED_LIMIT,
}: {
  products: Product[];
  eyebrow: string;
  limit?: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // Capped after filtering, so switching tabs fills the grid rather than
  // showing whatever few of the featured set happen to be in that category.
  const filtered = (filter === "all" ? products : products.filter((product) => product.category === filter)).slice(
    0,
    limit,
  );

  return (
    <div>
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[-0.02em] text-espresso uppercase">
          <Editable path="collection.eyebrow">{eyebrow}</Editable>
        </p>
        <h2 className="mt-4 flex flex-col items-center text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-5xl">
          {FILTER_ROWS.map((row, i) => (
            <div key={i} className="flex flex-wrap justify-center gap-x-3">
              {row.map((item) => (
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
            </div>
          ))}
        </h2>
      </div>

      <div className="mt-16">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
