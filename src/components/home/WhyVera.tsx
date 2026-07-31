import { SectionHeading } from "@/components/SectionHeading";
import { FeatureBlock } from "@/components/home/FeatureBlock";
import { resolveAsset, resolveImage } from "@/lib/images";

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
          bgSrc={resolveAsset("espresso-machine")}
          bgLabel="La Marzocco espresso machine"
          accentSrc={resolveAsset("Sipping-Espresso-LaMarzocco")}
          accentLabel="Sipping an espresso"
          accentSide="right"
          textSide="left"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
        <FeatureBlock
          bgSrc={resolveImage("why-vera/2/background")}
          bgLabel="Concrete counter with plants"
          accentSrc={resolveAsset("barista-espresso-eversys")}
          accentLabel="Barista at an Eversys machine"
          accentSide="left"
          textSide="right"
          heading="Lorem ipsum dolor sit"
          body={lorem}
        />
        <FeatureBlock
          bgSrc={resolveImage("why-vera/3/background")}
          bgLabel="Wood slat wall with seating"
          accentSrc={resolveImage("why-vera/3/accent")}
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
