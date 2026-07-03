import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";

const products = [
  { brand: "La Marzocco", name: "Linea Mini" },
  { brand: "La Marzocco", name: "Linea PB" },
  { brand: "La Marzocco", name: "GS3" },
  { brand: "La Marzocco", name: "KB90" },
];

export function Collection() {
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
          <div key={product.name}>
            <PlaceholderImage label={product.name} className="aspect-square" />
            <p className="mt-4 text-xs font-medium tracking-wide text-taupe uppercase">
              {product.brand}
            </p>
            <p className="text-lg font-medium text-espresso">{product.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
