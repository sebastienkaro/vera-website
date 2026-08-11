import { SectionHeading } from "@/components/SectionHeading";
import type { ProductHighlight } from "@/lib/types";

/**
 * The handful of reasons a buyer chooses this machine over the next one, in
 * their own words rather than as spec lines. Renders nothing for a product
 * that has none, which is every product coming straight from Shopify.
 */
export function ProductHighlights({ highlights }: { highlights?: ProductHighlight[] }) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="bg-sand px-8 py-24 sm:px-12">
      <SectionHeading
        eyebrow="Highlights"
        segments={[
          { text: "What Sets It", tone: "muted" },
          { text: "Apart", tone: "dark" },
        ]}
      />

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((highlight) => (
          <div key={highlight.title} className="border-t border-espresso/15 pt-5">
            <h3 className="text-lg font-medium text-espresso">{highlight.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-espresso/60">{highlight.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
