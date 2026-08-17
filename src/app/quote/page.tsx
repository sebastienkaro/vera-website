import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SiteImage } from "@/components/SiteImage";
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
  form: {
    eyebrow: "The Request",
    heading: "A few details and we'll come back to you",
    body: "Nothing here is binding, and a half-filled form is still worth sending.",
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
    /* Unlike the other interior pages, the hero here doesn't hand over to the
       page below it — the form sits inside the opening band so the whole thing
       is on screen without scrolling, which is the only reason anyone is here. */
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <SiteImage
        src={resolveAsset("barista-cafe-lamarzocco")}
        alt="A barista pulling a shot on a La Marzocco espresso machine"
        label="Quote — hero photo"
        className="absolute inset-0"
        preload
      />
      {/* Heaviest on the left, where the title lands; the right only has to
          hold the cream card apart from the photograph behind it. */}
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/65 to-espresso/45" />

      <Header />

      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 items-center px-8 pt-24 pb-10 sm:px-12 lg:pt-28 lg:pb-12">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:pr-8">
            <p className="text-xs font-semibold tracking-[-0.02em] text-cream/70 uppercase">
              {CONTENT.hero.eyebrow}
            </p>
            <h1 className="mt-4 flex flex-col text-[max(2rem,4vw)] leading-[0.95] font-normal tracking-[-0.04em] text-cream uppercase">
              {CONTENT.hero.lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </h1>
            <p className="mt-6 max-w-lg text-sm text-cream/80 sm:text-base">{CONTENT.hero.body}</p>
          </div>

          <div className="bg-cream p-6 sm:p-8 lg:w-full lg:max-w-xl lg:justify-self-end">
            <p className="text-xs font-medium tracking-wide text-taupe uppercase">
              {CONTENT.form.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-espresso sm:text-2xl">
              {CONTENT.form.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-espresso/60">{CONTENT.form.body}</p>

            <QuoteForm equipment={product?.title ?? ""} />
          </div>
        </div>
      </div>
    </section>
  );
}
