import { SectionHeading } from "@/components/SectionHeading";
import { FeatureBlock } from "@/components/home/FeatureBlock";
import { homeContent, resolveRef } from "@/lib/content";

export function WhyVera() {
  const { eyebrow, heading, blocks } = homeContent.whyVera;

  return (
    <section>
      <div className="px-8 py-24 sm:px-12">
        <SectionHeading eyebrow={eyebrow} segments={heading} />
      </div>

      <div className="flex flex-col">
        {blocks.map((block, i) => (
          <FeatureBlock
            key={i}
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
