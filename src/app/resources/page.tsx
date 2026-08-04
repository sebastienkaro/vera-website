import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteImage } from "@/components/SiteImage";
import { resolveAsset } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";

/**
 * Everything this page says, in one place at the top so the words are easy to
 * find and replace.
 *
 * **This copy is placeholder.** It is written to sound like the business rather
 * than like lorem ipsum, which makes the page reviewable — but nobody has
 * approved a line of it.
 *
 * It is also deliberately not editable through `?edit`. That system is
 * homepage-shaped end to end: one content type (`HomeContent`), one validator
 * (`parseHomeContent`), one stored file (`content/home.json`), and a provider
 * mounted only by the homepage. Making other pages editable is a change to that
 * system, not a change to this page — so until it is asked for, these words are
 * edited in git.
 */
const CONTENT = {
  hero: {
    eyebrow: "Resources",
    lines: ["Everything we know", "about keeping a bar", "running"],
    body: "Specs, service intervals, water treatment and the questions worth asking before you buy. Written from what we see on install days.",
  },
  intro: {
    eyebrow: "Guides & Downloads",
    heading: [
      { text: "The reading we hand", tone: "muted" as const },
      { text: "to every new bar", tone: "dark" as const },
    ],
  },
  cards: [
    {
      eyebrow: "Buying guide",
      title: "Sizing a machine to your volume",
      body: "Group count, boiler capacity and recovery — how to read a spec sheet against the morning you actually have.",
      asset: "barista-cafe-lamarzocco",
    },
    {
      eyebrow: "Maintenance",
      title: "The service calendar",
      body: "Daily, weekly and annual. What your team can do, and what needs a technician on site.",
      asset: "espresso-machine-2",
    },
    {
      eyebrow: "Water",
      title: "Treatment and scale",
      body: "The single largest cause of the service calls we take. Testing, filtration and what your warranty expects of you.",
      asset: "office-coffee-3",
    },
    {
      eyebrow: "Workflow",
      title: "Laying out the bar",
      body: "Where the grinder goes, how far the barista walks, and why the drain matters more than the counter.",
      asset: "barista-making-espresso-coffee-shop",
    },
    {
      eyebrow: "Training",
      title: "Onboarding a new team",
      body: "Dialing in, milk technique and the daily reset — the shape of the training that comes with every install.",
      asset: "barista-espresso-eversys",
    },
    {
      eyebrow: "Support",
      title: "Parts and lead times",
      body: "What we stock in Bridgeport, what ships same day, and what to keep in your own cupboard.",
      asset: "espresso-machine",
    },
  ],
  help: {
    heading: "Can't find what you're after?",
    body: "The fastest route to an answer is a text. Tell us the machine and the problem and we'll tell you what we'd do.",
  },
};

export const metadata: Metadata = {
  title: "Resources — Vera Coffee Solutions",
  description:
    "Guides, service intervals and buying advice for commercial espresso equipment, from the team that installs and services it.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        src={resolveAsset("barista-making-espresso-coffee-shop")}
        alt="A barista working an espresso bar"
        label="Resources — hero photo"
        eyebrow={CONTENT.hero.eyebrow}
        lines={CONTENT.hero.lines}
        body={CONTENT.hero.body}
      />

      <section className="px-8 py-24 sm:px-12">
        <SectionHeading eyebrow={CONTENT.intro.eyebrow} segments={CONTENT.intro.heading} />

        {/* The cards don't link anywhere yet — the guides themselves haven't
            been written, and a link to nothing is worse than no link. */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
          {CONTENT.cards.map((card) => (
            <article key={card.title}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <SiteImage
                  src={resolveAsset(card.asset)}
                  alt=""
                  label={card.title}
                  className="absolute inset-0"
                  sizes="(min-width: 768px) 22rem, (min-width: 640px) 45vw, 90vw"
                />
              </div>
              <p className="mt-5 text-xs font-medium tracking-wide text-taupe uppercase">
                {card.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-espresso">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso/60">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-espresso px-8 py-24 text-cream sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-4xl">
              {CONTENT.help.heading}
            </h2>
            <p className="mt-4 text-sm text-cream/70">{CONTENT.help.body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="bg-cream px-6 py-3.5 text-center text-xs font-medium tracking-wide text-espresso uppercase transition-opacity hover:opacity-90"
            >
              {siteConfig.contact.phone}
            </a>
            <Link
              href="/machines"
              className="border border-cream px-6 py-3.5 text-center text-xs font-medium tracking-wide text-cream uppercase transition-colors hover:bg-cream hover:text-espresso"
            >
              Browse Machines
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
