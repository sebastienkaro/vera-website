import { SectionHeading } from "@/components/SectionHeading";
import { FeatureBlock } from "@/components/home/FeatureBlock";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export function WhyVera() {
  return (
    <section className="border-t border-espresso/10">
      <div className="px-8 py-24 sm:px-12">
        <SectionHeading
          eyebrow="Why Vera"
          segments={[
            { text: "We don't just sell the machine.", tone: "muted" },
            { text: "We engineer the whole bar.", tone: "dark" },
          ]}
        />
      </div>

      <div className="flex flex-col">
        <FeatureBlock
          bgLabel="Grinder lineup on counter"
          accentLabel="Barista pulling shot"
          accentSide="right"
          textSide="left"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
        <FeatureBlock
          bgLabel="Concrete counter with plants"
          accentLabel="Machine detail"
          accentSide="right"
          textSide="left"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
        <FeatureBlock
          bgLabel="Wood slat wall with seating"
          accentLabel="Machine servicing"
          accentSide="right"
          textSide="left"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
      </div>
    </section>
  );
}
