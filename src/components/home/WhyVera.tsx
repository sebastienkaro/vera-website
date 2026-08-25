import { SectionHeading } from "@/components/SectionHeading";
import { FeatureRail } from "@/components/home/FeatureRail";
import { resolveRef } from "@/lib/content";
import { getHomeContent } from "@/lib/content-store";

export function WhyVera() {
  const { eyebrow, heading, blocks } = getHomeContent().whyVera;

  return (
    <section>
      {/* The rail below centres its cards in a full screen, and that centring
          is nearly all of the air under this heading — so there is barely any
          padding of its own here. */}
      <div className="px-8 pt-24 pb-2 sm:px-12">
        <SectionHeading eyebrow={eyebrow} segments={heading} path="whyVera" align="left" />
      </div>

      {/* The photos are resolved here, in the server component, because the
          rail runs on the client and `resolveRef` reads the filesystem. */}
      <FeatureRail
        items={blocks.map((block, i) => ({
          path: `whyVera.blocks.${i}`,
          src: resolveRef(block.background),
          alt: block.background.alt,
          label: block.background.label,
          heading: block.heading,
          body: block.body,
        }))}
      />
    </section>
  );
}
