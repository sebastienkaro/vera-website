import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { Editable } from "@/components/edit/Editable";
import { EditableImage } from "@/components/edit/EditableImage";
import { resolveRef } from "@/lib/content";
import { getHomeContent } from "@/lib/content-store";
import { formatMoney } from "@/lib/money";
import { getFeaturedMachine } from "@/lib/products";

/**
 * One machine given a whole screen: a photograph of it on a working bar, bled
 * to every edge, with the machine's own catalog shot and its details on a card
 * in the top corner. The break between the "Why Vera" rail and the About
 * section, and the only place on the homepage that puts a single product
 * forward rather than a grid or a stack of them.
 *
 * The product comes from Shopify — see `getFeaturedMachine` for which one and
 * how to pin it — and the photograph and copy around it from the homepage
 * content.
 */
export async function FeaturedMachine() {
  const { eyebrow, body, buttonLabel, background } = getHomeContent().featuredMachine;
  const machine = await getFeaturedMachine();

  // No photographed machine in the catalog, so there is nothing to feature.
  if (!machine) return null;

  const image = machine.images[0];

  // Read off the product rather than written by hand, so the card says
  // something true of whichever machine is being featured. The make is left
  // out: the catalog's titles lead with it already. Anything the catalog
  // leaves blank drops out rather than showing an empty row.
  const details = [
    { label: "Type", value: machine.productType },
    ...machine.options.slice(0, 1).map((option) => ({
      label: option.name,
      value: option.values.join(", "),
    })),
  ].filter((row) => row.value);

  return (
    <section className="relative flex min-h-screen flex-col px-8 py-16 sm:px-12 sm:py-20">
      <EditableImage
        path="featuredMachine.background"
        previewClassName="absolute inset-0 h-full w-full object-cover"
      >
        <SiteImage
          src={resolveRef(background)}
          alt={background.alt}
          label={background.label}
          className="absolute inset-0"
        />
      </EditableImage>

      {/* Label in one corner, card in the other, both on the top line — the
          rest of the section is the photograph. Nothing is washed over the
          picture, so the label carries its own cream ground rather than
          relying on whatever happens to be behind it. */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-16">
        <p className="w-fit bg-cream px-4 py-2.5 text-xs font-semibold tracking-[-0.02em] text-espresso uppercase sm:text-sm">
          <Editable path="featuredMachine.eyebrow">{eyebrow}</Editable>
        </p>

        <div className="w-full bg-cream sm:max-w-sm">
          {/* The catalog's own shot of the machine, on the sand ground every
              product photo on the site sits on — the picture behind is the bar
              it lives on, this is the machine itself. */}
          <SiteImage
            src={image?.url ?? null}
            alt={image?.alt ?? machine.title}
            label={machine.title}
            className="relative aspect-[4/3] w-full"
            sizes="(min-width: 640px) 384px, 90vw"
            fit="contain"
            padding="p-[8%]"
          />

          <div className="p-8">
            {/* No vendor line above the name: the catalog's machine titles
                lead with the make already, so it would only say La Marzocco
                twice. */}
            <h2 className="text-2xl leading-[1.05] font-semibold tracking-[-0.02em] text-espresso uppercase">
              {machine.title}
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-espresso/70">
              <Editable path="featuredMachine.body">{body}</Editable>
            </p>

            <dl className="mt-6 text-sm">
              {details.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-t border-espresso/10 py-2.5"
                >
                  <dt className="text-xs tracking-wide text-espresso/50 uppercase">{row.label}</dt>
                  <dd className="text-right text-espresso">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Runs the full width of the card rather than sitting inside its
              padding, so the card closes on a solid bar. The price is the
              point of it, not a footnote under it: it is what a visitor is
              looking for before they click through. */}
          <Link
            href={`/products/${machine.handle}`}
            className="flex items-center justify-between gap-6 bg-espresso px-8 py-5 text-cream transition-opacity hover:opacity-90"
          >
            <span className="text-xs font-medium tracking-wide whitespace-nowrap uppercase">
              <Editable path="featuredMachine.buttonLabel">{buttonLabel}</Editable>
            </span>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[0.65rem] tracking-wide uppercase opacity-70">From</span>
              <span className="text-base font-semibold">{formatMoney(machine.price)}</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
