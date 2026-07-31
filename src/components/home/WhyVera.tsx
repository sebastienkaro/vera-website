import { SectionHeading } from "@/components/SectionHeading";
import { FeatureBlock } from "@/components/home/FeatureBlock";
import { resolveRef } from "@/lib/content";
import { getHomeContent } from "@/lib/content-store";

export function WhyVera() {
  const { eyebrow, heading, blocks } = getHomeContent().whyVera;

  return (
    <section>
      <div className="px-8 py-24 sm:px-12">
        <SectionHeading eyebrow={eyebrow} segments={heading} path="whyVera" />
      </div>

      <div className="flex flex-col">
        {blocks.map((block, i) => (
          <FeatureBlock
            key={i}
            path={`whyVera.blocks.${i}`}
            bgSrc={resolveRef(block.background)}
            bgLabel={block.background.label}
            bgAlt={block.background.alt}
            accentSrc={resolveRef(block.accent)}
            accentLabel={block.accent.label}
            accentAlt={block.accent.alt}
            accentSide={block.accentSide}
            textSide={block.textSide}
            heading={block.heading}
            body={block.body}
          />
        ))}
      </div>
    </section>
  );
}
