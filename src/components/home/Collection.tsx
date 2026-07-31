import { CollectionGrid } from "@/components/home/CollectionGrid";
import { getFeaturedProducts } from "@/lib/products";
import { homeContent } from "@/lib/content";

export async function Collection() {
  const products = await getFeaturedProducts();

  return (
    <section className="px-8 py-24 sm:px-12">
      <CollectionGrid products={products} eyebrow={homeContent.collection.eyebrow} />
    </section>
  );
}
