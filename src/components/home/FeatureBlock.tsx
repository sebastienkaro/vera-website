import { SiteImage } from "@/components/SiteImage";
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
    <div className="relative h-screen">
      <SiteImage src={resolveImage(bgSlot)} alt={bgLabel} label={bgLabel} className="absolute inset-0" />

      <div className="relative mx-auto h-full max-w-6xl">
        <div
          className={`absolute top-1/2 w-56 -translate-y-1/2 sm:w-80 ${
            accentSide === "right" ? "right-8 sm:right-12" : "left-8 sm:left-12"
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
          className={`absolute bottom-12 max-w-sm ${
            textSide === "left" ? "left-8 text-left sm:left-12" : "right-8 text-right sm:right-12"
          }`}
        >
          <h3 className="text-2xl font-medium text-cream">{heading}</h3>
          <p className="mt-4 text-sm text-cream/85">{body}</p>
        </div>
      </div>
    </div>
  );
}
