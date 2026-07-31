import { CollectionGrid } from "@/components/home/CollectionGrid";
import { getFeaturedProducts } from "@/lib/products";
import { getHomeContent } from "@/lib/content-store";

export async function Collection() {
  const products = await getFeaturedProducts();

  return (
    <section className="px-8 py-24 sm:px-12">
      <CollectionGrid products={products} eyebrow={getHomeContent().collection.eyebrow} />
    </section>
  );
}
