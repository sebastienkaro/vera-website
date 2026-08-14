import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { resolveAsset } from "@/lib/images";
import { getProduct } from "@/lib/products";

/**
 * Everything this page says, in one place at the top — the same arrangement as
 * `src/app/white-label/page.tsx`, and static for the same reason: the `?edit`
 * system is built around the homepage's single content file.
 *
 * **This copy is placeholder** — written to sound like the business, approved
 * by nobody.
 */
const CONTENT = {
  hero: {
    eyebrow: "Get a Quote",
    lines: ["Tell us what", "you're pouring"],
    body: "Every bar is a different room with a different queue. Tell us about yours and we'll price the machine that suits it — installed, plumbed and serviced by the same people who sold it.",
  },
  steps: [
    {
      number: "01",
      title: "You tell us the shape of it",
      body: "Covers a day, the space behind the counter, whether there's water and power where the machine needs to stand.",
    },
    {
      number: "02",
      title: "We put numbers to it",
      body: "Machine, grinder, filtration and install, itemised — including the parts most quotes leave until the invoice.",
    },
    {
      number: "03",
      title: "We install and stay",
      body: "Delivery, plumbing, calibration and training on the day, then a service plan with the same phone number behind it.",
    },
  ],
  form: {
    eyebrow: "The Request",
    heading: "A few details and we'll come back to you",
    body: "Nothing here is binding, and a half-filled form is still worth sending — we'd rather start the conversation than wait for the complete picture.",
  },
};

export const metadata: Metadata = {
  title: "Request a Quote — Vera Coffee Solutions",
  description:
    "Tell us about your bar and we'll price the espresso setup that suits it — machine, grinder, filtration and install, from a team in Bridgeport, CT.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  // Product pages link here with the machine they were showing, so the form
  // opens already knowing what the enquiry is about. An unknown handle just
  // leaves the field empty rather than being echoed back into it.
  const handle = (await searchParams).product;
  const product = handle ? await getProduct(handle) : undefined;

  return (
    <>
      <PageHero
        src={resolveAsset("barista-cafe-lamarzocco")}
        alt="A barista pulling a shot on a La Marzocco espresso machine"
        label="Quote — hero photo"
        eyebrow={CONTENT.hero.eyebrow}
        lines={CONTENT.hero.lines}
        body={CONTENT.hero.body}
      />

      <section className="px-8 py-24 sm:px-12">
        <ol className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
          {CONTENT.steps.map((step) => (
            <li key={step.number} className="border-t border-espresso/15 pt-6">
              <p className="text-xs font-medium tracking-wide text-taupe uppercase">{step.number}</p>
              <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-espresso">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-espresso/60">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-8 pb-24 sm:px-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-taupe uppercase">
            {CONTENT.form.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-espresso sm:text-3xl">
            {CONTENT.form.heading}
          </h2>
          <p className="mt-4 mb-10 text-sm leading-relaxed text-espresso/60">{CONTENT.form.body}</p>

          <QuoteForm equipment={product?.title ?? ""} />
        </div>
      </section>
    </>
  );
}
