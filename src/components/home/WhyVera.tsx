import { SectionHeading } from "@/components/SectionHeading";
import { FeatureBlock } from "@/components/home/FeatureBlock";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export function WhyVera() {
  return (
    <section>
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
          bgSlot="why-vera/1/background"
          bgLabel="Grinder lineup on counter"
          accentSlot="why-vera/1/accent"
          accentLabel="Barista pulling shot"
          accentSide="right"
          textSide="left"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
        <FeatureBlock
          bgSlot="why-vera/2/background"
          bgLabel="Concrete counter with plants"
          accentSlot="why-vera/2/accent"
          accentLabel="Machine detail"
          accentSide="right"
          textSide="left"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
        <FeatureBlock
          bgSlot="why-vera/3/background"
          bgLabel="Wood slat wall with seating"
          accentSlot="why-vera/3/accent"
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
