import { PlaceholderImage } from "@/components/PlaceholderImage";

export function FeatureBlock({
  bgLabel,
  accentLabel,
  accentSide,
  textSide,
  heading,
  body,
}: {
  bgLabel: string;
  accentLabel: string;
  accentSide: "left" | "right";
  textSide: "left" | "right";
  heading: string;
  body: string;
}) {
  return (
    <div className="relative min-h-[560px] sm:min-h-[720px]">
      <PlaceholderImage label={bgLabel} className="absolute inset-0" />
      <div className="absolute inset-0 bg-espresso/60" />

      <div
        className={`absolute top-1/2 w-56 -translate-y-1/2 sm:w-80 ${
          accentSide === "right" ? "right-8 sm:right-16" : "left-8 sm:left-16"
        }`}
      >
        <PlaceholderImage label={accentLabel} className="aspect-[3/4] shadow-xl" />
      </div>

      <div
        className={`absolute bottom-12 max-w-sm px-8 sm:px-16 ${
          textSide === "left" ? "left-0 text-left" : "right-0 text-right"
        }`}
      >
        <h3 className="text-2xl font-medium text-cream">{heading}</h3>
        <p className="mt-4 text-sm text-cream/85">{body}</p>
      </div>
    </div>
  );
}
