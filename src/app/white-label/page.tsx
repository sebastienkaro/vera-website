import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteImage } from "@/components/SiteImage";
import { resolveAsset, resolveImage } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";

/**
 * Everything this page says, in one place at the top.
 *
 * **This copy is placeholder** — written to sound like the business so the page
 * can be judged, but approved by nobody. It is static rather than editable
 * through `?edit` for the reason set out in `src/app/resources/page.tsx`: that
 * system is built around the homepage's single content file, and extending it
 * is a change to the system rather than to this page.
 */
const CONTENT = {
  hero: {
    eyebrow: "White Label",
    lines: ["Your name", "on the bag"],
    body: "We roast in Long Island City for cafés, restaurants and offices who want a coffee program that belongs to them — not to us.",
  },
  intro: {
    eyebrow: "The Program",
    heading: [
      { text: "We roast it.", tone: "muted" as const },
      { text: "You put your name on it.", tone: "dark" as const },
    ],
    body: "A private-label program is a partnership more than a purchase: a profile built around your menu, packaging that carries your brand, and a delivery rhythm that matches how fast you actually pour.",
  },
  steps: [
    {
      number: "01",
      title: "Cupping and profile",
      body: "We taste through origins with you and build a house blend around the drinks you actually sell — not the ones a sample bag flatters.",
    },
    {
      number: "02",
      title: "Packaging and brand",
      body: "Your label, your bag, your grind and size. We handle the roast, the pack date and the traceability behind it.",
    },
    {
      number: "03",
      title: "Delivery and support",
      body: "A standing schedule sized to your volume, with the same team servicing the equipment it's brewed on.",
    },
  ],
  blocks: [
    {
      eyebrow: "The Roastery",
      heading: "Long Island City",
      body: "Small enough to roast a profile for one account, equipped well enough to keep it identical every week. Every batch is logged, and you're welcome on the floor whenever you want to taste one.",
      asset: null as string | null,
      slot: "about/roastery",
    },
    {
      eyebrow: "Who It's For",
      heading: "Cafés, restaurants, offices",
      body: "Anyone pouring enough coffee that the bag on the shelf says something about them. If you're not sure whether the volume works, ask — the answer is usually a shorter conversation than you'd think.",
      asset: "office-coffee-2",
      slot: null as string | null,
    },
  ],
  cta: {
    heading: "Start with a cupping",
    body: "Tell us what you pour today and we'll put a table together. No minimum, no commitment until the coffee is right.",
  },
};

export const metadata: Metadata = {
  title: "White Label — Vera Coffee Solutions",
  description:
    "Private-label coffee roasted in Long Island City for cafés, restaurants and offices — your profile, your packaging, your brand.",
};

export default function WhiteLabelPage() {
  return (
    <>
      <PageHero
        src={resolveImage("about/roastery")}
        alt="The Vera Coffee Solutions roastery in Long Island City"
        label="White label — hero photo"
        eyebrow={CONTENT.hero.eyebrow}
        lines={CONTENT.hero.lines}
        body={CONTENT.hero.body}
      />

      <section className="px-8 py-24 sm:px-12">
        <SectionHeading eyebrow={CONTENT.intro.eyebrow} segments={CONTENT.intro.heading} />
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-espresso/60">
          {CONTENT.intro.body}
        </p>

        <ol className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
          {CONTENT.steps.map((step) => (
            <li key={step.number} className="border-t border-espresso/15 pt-6">
              <p className="text-xs font-medium tracking-wide text-taupe uppercase">{step.number}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-espresso">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso/60">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Photo and text alternating, the same rhythm as Why Vera on the
          homepage — without its parallax, which belongs to that section. */}
      {CONTENT.blocks.map((block, i) => (
        <section key={block.heading} className="px-8 pb-24 sm:px-12">
          <div
            className={`mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16 ${
              i % 2 === 1 ? "md:[&>figure]:order-2" : ""
            }`}
          >
            <figure className="relative aspect-[4/3] overflow-hidden">
              <SiteImage
                src={block.slot ? resolveImage(block.slot) : resolveAsset(block.asset ?? "")}
                alt=""
                label={block.heading}
                className="absolute inset-0"
                sizes="(min-width: 768px) 32rem, 90vw"
              />
            </figure>
            <div>
              <p className="text-xs font-medium tracking-wide text-taupe uppercase">
                {block.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-espresso sm:text-3xl">
                {block.heading}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-espresso/60">{block.body}</p>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-espresso px-8 py-24 text-cream sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-4xl">
              {CONTENT.cta.heading}
            </h2>
            <p className="mt-4 text-sm text-cream/70">{CONTENT.cta.body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="bg-cream px-6 py-3.5 text-center text-xs font-medium tracking-wide text-espresso uppercase transition-opacity hover:opacity-90"
            >
              {siteConfig.contact.phone}
            </a>
            <Link
              href="/resources"
              className="border border-cream px-6 py-3.5 text-center text-xs font-medium tracking-wide text-cream uppercase transition-colors hover:bg-cream hover:text-espresso"
            >
              Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
