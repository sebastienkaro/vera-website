import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import { Editable } from "@/components/edit/Editable";
import { getHomeContent } from "@/lib/content-store";
import { getFeaturedMachine } from "@/lib/products";

/**
 * One machine, given the whole width of the page on a dark ground: the break
 * between the "Why Vera" blocks and the About section, and the only place on
 * the homepage that puts a single product forward rather than a grid or a
 * stack of them.
 *
 * The product comes from Shopify — see `getFeaturedMachine` for which one and
 * how to pin it — and the copy around it from the homepage content.
 */
export async function FeaturedMachine() {
  const { eyebrow, body, buttonLabel } = getHomeContent().featuredMachine;
  const machine = await getFeaturedMachine();

  // No photographed machine in the catalog, so there is nothing to feature.
  if (!machine) return null;

  const image = machine.images[0];

  return (
    <section className="bg-espresso px-8 py-24 sm:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* The catalog shoots its machines on white, so the photo sits on a
            cream panel rather than straight onto the brown, where it would
            read as a white box someone forgot to knock out. */}
        <SiteImage
          src={image?.url ?? null}
          alt={image?.alt ?? machine.title}
          label={machine.title}
          className="relative aspect-[4/3] w-full rounded-sm"
          sizes="(min-width: 768px) 40vw, 90vw"
          fit="contain"
          padding="p-10"
        />

        <div className="text-cream">
          <p className="text-xs font-semibold tracking-[-0.02em] text-cream/60 uppercase">
            <Editable path="featuredMachine.eyebrow">{eyebrow}</Editable>
          </p>

          {/* No vendor line above the name: the catalog's machine titles lead
              with the make already, so it would only say La Marzocco twice. */}
          <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-4xl">
            {machine.title}
          </h2>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/80 sm:text-base">
            <Editable path="featuredMachine.body">{body}</Editable>
          </p>

          <Link
            href={`/products/${machine.handle}`}
            className="mt-8 inline-block bg-cream px-6 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-opacity hover:opacity-90"
          >
            <Editable path="featuredMachine.buttonLabel">{buttonLabel}</Editable>
          </Link>
        </div>
      </div>
    </section>
  );
}
