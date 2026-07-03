import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export function Collection() {
  const products = getProducts();

  return (
    <section className="border-t border-espresso/10 px-8 py-24 sm:px-12">
      <SectionHeading
        eyebrow="The Collection"
        segments={[
          { text: "All,", tone: "dark" },
          { text: "Machines, Grinders,", tone: "muted" },
          { text: "Parts & Accessories", tone: "muted" },
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
