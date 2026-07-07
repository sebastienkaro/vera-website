import { SiteImage } from "@/components/SiteImage";
import { ParallaxBackground } from "@/components/home/ParallaxBackground";
import { resolveImage } from "@/lib/images";

export function FeatureBlock({
  bgSlot,
  bgLabel,
  accentSlot,
  accentLabel,
  accentSide,
  textSide,
  heading,
  body,
}: {
  bgSlot: string;
  bgLabel: string;
  accentSlot: string;
  accentLabel: string;
  accentSide: "left" | "right";
  textSide: "left" | "right";
  heading: string;
  body: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden sm:h-screen">
      <ParallaxBackground>
        <SiteImage src={resolveImage(bgSlot)} alt={bgLabel} label={bgLabel} className="absolute inset-0" />
      </ParallaxBackground>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-8 py-20 sm:block sm:h-full sm:px-0 sm:py-0">
        <div
          className={`w-56 sm:absolute sm:top-1/2 sm:w-80 sm:-translate-y-1/2 ${
            accentSide === "right" ? "sm:right-12" : "sm:left-12"
          }`}
        >
          <SiteImage
            src={resolveImage(accentSlot)}
            alt={accentLabel}
            label={accentLabel}
            className="relative aspect-[3/4] shadow-xl"
            sizes="(min-width: 640px) 320px, 224px"
          />
        </div>

        <div
          className={`max-w-sm text-center sm:absolute sm:top-1/2 sm:-translate-y-1/2 ${
            textSide === "left" ? "sm:left-12 sm:text-left" : "sm:right-12 sm:text-right"
          }`}
        >
          <h3 className="text-3xl font-medium text-cream sm:text-4xl">{heading}</h3>
          <p className="mt-4 text-base text-cream/85">{body}</p>
        </div>
      </div>
    </div>
  );
}
