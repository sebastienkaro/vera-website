import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteImage } from "@/components/SiteImage";
import { resolveImage } from "@/lib/images";

export function AboutVera() {
  return (
    <section className="px-8 py-24 sm:px-12">
      <SectionHeading
        eyebrow="About Vera"
        segments={[
          { text: "Equipment, Roastery,", tone: "muted" },
          { text: "and the People Behind Both", tone: "dark" },
        ]}
      />

      <div className="relative mx-auto mt-16 min-h-[420px] max-w-6xl sm:min-h-[520px]">
        <SiteImage
          src={resolveImage("about/roastery")}
          alt="Vera Coffee Solutions roastery — Long Island City"
          label="Roastery — Long Island City"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 from-0% to-transparent to-50%" />

        <div className="absolute right-0 bottom-0 left-0 p-8 sm:p-12">
          <p className="max-w-2xl text-sm text-cream sm:text-base">
            Vera Coffee Solutions is built by operators, for operators. From our Long
            Island City facility we sell, install and service the world&apos;s best
            commercial espresso equipment — and we roast coffee for cafés, restaurants
            and corporate accounts who want a program built around their brand.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="bg-cream px-6 py-3.5 text-sm font-medium text-espresso transition-opacity hover:opacity-90"
            >
              Read Our Story
            </Link>
            <Link
              href="/white-label"
              className="border border-cream px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-espresso"
            >
              White Label Program
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
