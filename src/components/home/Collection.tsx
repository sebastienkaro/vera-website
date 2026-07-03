import { CollectionGrid } from "@/components/home/CollectionGrid";
import { getProducts } from "@/lib/products";

export function Collection() {
  const products = getProducts();

  return (
    <section className="px-8 py-24 sm:px-12">
      <CollectionGrid products={products} />
    </section>
  );
}
