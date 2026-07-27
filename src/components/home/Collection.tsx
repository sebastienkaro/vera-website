import { CollectionGrid } from "@/components/home/CollectionGrid";
import { getProducts } from "@/lib/products";

export async function Collection() {
  const products = await getProducts();

  return (
    <section className="px-8 py-24 sm:px-12">
      <CollectionGrid products={products} />
    </section>
  );
}
