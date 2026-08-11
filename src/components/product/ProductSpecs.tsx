import { SectionHeading } from "@/components/SectionHeading";
import type { Product, ProductSpec, ProductSpecGroup, ProductSpecTable } from "@/lib/types";

/**
 * Everything a buyer needs to check before they can say yes: the figures that
 * change with the configuration, the ones that don't, and the manufacturer's
 * own documents.
 *
 * Each block stands alone and renders nothing when its data is missing, so a
 * product can be filled in a piece at a time. A product with none of it — every
 * product coming straight from Shopify today — renders no section at all.
 */
export function ProductSpecs({ product }: { product: Product }) {
  const { specs, specGroups, specTable, documents } = product;

  const hasAnything =
    specs.length > 0 ||
    (specGroups?.length ?? 0) > 0 ||
    specTable !== undefined ||
    (documents?.length ?? 0) > 0;
  if (!hasAnything) return null;

  return (
    <section className="px-8 py-24 sm:px-12">
      <SectionHeading
        eyebrow="Specifications"
        segments={[
          { text: "The", tone: "muted" },
          { text: "Fine Print", tone: "dark" },
        ]}
      />

      {specTable && <ConfigurationTable table={specTable} />}

      {specGroups && specGroups.length > 0 && (
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2">
          {specGroups.map((group) => (
            <SpecGroup key={group.title} group={group} />
          ))}
        </div>
      )}

      {specs.length > 0 && (
        <SpecList specs={specs} className="mx-auto mt-16 max-w-3xl sm:grid-cols-2" />
      )}

      {documents && documents.length > 0 && (
        <div className="mx-auto mt-16 max-w-5xl border-t border-espresso/10 pt-8">
          <p className="text-xs font-medium tracking-wide text-taupe uppercase">Documents</p>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {documents.map((document) => (
              <li key={document.href}>
                <a
                  href={document.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-espresso underline decoration-espresso/30 underline-offset-4 transition-colors hover:decoration-espresso"
                >
                  {document.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * The figures that change with the configuration, as a table — which is how
 * manufacturers publish them, and how a buyer compares one group count against
 * the next. It scrolls sideways rather than wrapping on a phone: a spec table
 * that reflows into a column stops being a comparison.
 */
function ConfigurationTable({ table }: { table: ProductSpecTable }) {
  return (
    <div className="mx-auto mt-16 max-w-3xl overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-espresso/20">
            <th
              scope="col"
              className="py-3 pr-6 text-left text-xs font-medium tracking-wide text-taupe uppercase"
            >
              {table.title}
            </th>
            {table.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="py-3 pr-6 text-left text-xs font-medium tracking-wide text-espresso uppercase"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.label} className="border-b border-espresso/10">
              <th scope="row" className="py-3 pr-6 text-left font-normal text-espresso/60">
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${table.columns[index] ?? index}`} className="py-3 pr-6 text-espresso">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpecGroup({ group }: { group: ProductSpecGroup }) {
  return (
    <div>
      <h3 className="text-xs font-medium tracking-wide text-taupe uppercase">{group.title}</h3>
      <SpecList specs={group.specs} className="mt-4" />
    </div>
  );
}

function SpecList({ specs, className = "" }: { specs: ProductSpec[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-12 gap-y-4 ${className}`}>
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-baseline justify-between gap-6 border-b border-espresso/10 py-3"
        >
          <dt className="shrink-0 text-sm text-espresso/60">{spec.label}</dt>
          <dd className="text-right text-sm font-medium text-espresso">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
