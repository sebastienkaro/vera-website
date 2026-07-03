import { SectionHeading } from "@/components/SectionHeading";
import type { ProductSpec } from "@/lib/types";

export function ProductSpecs({ specs }: { specs: ProductSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <section className="border-t border-espresso/10 px-8 py-24 sm:px-12">
      <SectionHeading
        eyebrow="Specifications"
        segments={[
          { text: "The", tone: "muted" },
          { text: "Fine Print", tone: "dark" },
        ]}
      />

      <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-baseline justify-between border-b border-espresso/10 py-3"
          >
            <dt className="text-sm text-espresso/60">{spec.label}</dt>
            <dd className="text-sm font-medium text-espresso">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
