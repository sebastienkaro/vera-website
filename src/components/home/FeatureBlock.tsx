import { SiteImage } from "@/components/SiteImage";
import { ParallaxBackground } from "@/components/home/ParallaxBackground";
import { Editable } from "@/components/edit/Editable";
import { EditableImage } from "@/components/edit/EditableImage";

export function FeatureBlock({
  path,
  bgSrc,
  bgLabel,
  bgAlt,
  accentSrc,
  accentLabel,
  accentAlt,
  accentSide,
  textSide,
  heading,
  body,
}: {
  // Where this block lives in the content, e.g. `whyVera.blocks.0`, so its text
  // and photos can be edited in place.
  path: string;
  // Already resolved by the caller — see `resolveRef` in `lib/content`. `null`
  // means "no file there", and `SiteImage` shows the placeholder.
  bgSrc: string | null;
  // `label` names the empty placeholder, `alt` describes the real photo.
  bgLabel: string;
  bgAlt: string;
  accentSrc: string | null;
  accentLabel: string;
  accentAlt: string;
  accentSide: "left" | "right";
  textSide: "left" | "right";
  heading: string;
  body: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden sm:h-screen">
      <ParallaxBackground>
        <EditableImage
          path={`${path}.background`}
          previewClassName="absolute inset-0 h-full w-full object-cover"
        >
          <SiteImage src={bgSrc} alt={bgAlt} label={bgLabel} className="absolute inset-0" />
        </EditableImage>
      </ParallaxBackground>

      {/* Dims the drifting photo so the cream copy stays legible over it — these
          backgrounds include blown-out highlights that the text runs straight
          across. Sits above the photo but below the block's content, so the
          accent image keeps its own contrast. */}
      <div className="pointer-events-none absolute inset-0 bg-espresso/65" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-8 py-20 sm:block sm:h-full sm:px-0 sm:py-0">
        <div
          className={`w-56 sm:absolute sm:top-1/2 sm:w-80 sm:-translate-y-1/2 ${
            accentSide === "right" ? "sm:right-12" : "sm:left-12"
          }`}
        >
          <EditableImage
            path={`${path}.accent`}
            previewClassName="relative aspect-[3/4] w-full object-cover shadow-xl"
          >
            <SiteImage
              src={accentSrc}
              alt={accentAlt}
              label={accentLabel}
              className="relative aspect-[3/4] shadow-xl"
              sizes="(min-width: 640px) 320px, 224px"
            />
          </EditableImage>
        </div>

        <div
          className={`max-w-sm text-center sm:absolute sm:top-1/2 sm:-translate-y-1/2 ${
            textSide === "left" ? "sm:left-12 sm:text-left" : "sm:right-12 sm:text-right"
          }`}
        >
          <h3 className="text-3xl font-medium text-cream sm:text-4xl">
            <Editable path={`${path}.heading`}>{heading}</Editable>
          </h3>
          <p className="mt-4 text-base text-cream/85">
            <Editable path={`${path}.body`}>{body}</Editable>
          </p>
        </div>
      </div>
    </div>
  );
}
