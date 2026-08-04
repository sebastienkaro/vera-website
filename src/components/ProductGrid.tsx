import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

/**
 * The catalog grid — four across on a wide screen, two on a tablet, one on a
 * phone. Shared by the homepage's filtered collection and the category pages so
 * a product looks the same wherever it is found.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
