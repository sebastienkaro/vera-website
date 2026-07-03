import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-espresso/10 px-8 py-24 sm:px-12">
      <SectionHeading
        eyebrow="Keep Exploring"
        segments={[
          { text: "You May", tone: "muted" },
          { text: "Also Like", tone: "dark" },
        ]}
      />

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
