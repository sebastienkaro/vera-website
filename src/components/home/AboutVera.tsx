import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteImage } from "@/components/SiteImage";
import { Editable } from "@/components/edit/Editable";
import { EditableImage } from "@/components/edit/EditableImage";
import { resolveRef } from "@/lib/content";
import { getHomeContent } from "@/lib/content-store";

export function AboutVera() {
  const { eyebrow, heading, body, image, buttons } = getHomeContent().about;

  return (
    <section className="px-8 py-24 sm:px-12">
      <SectionHeading eyebrow={eyebrow} segments={heading} path="about" />

      <div className="relative mx-auto mt-16 min-h-[420px] max-w-6xl sm:min-h-[520px]">
        <EditableImage path="about.image" previewClassName="absolute inset-0 h-full w-full object-cover">
          <SiteImage
            src={resolveRef(image)}
            alt={image.alt}
            label={image.label}
            className="absolute inset-0"
          />
        </EditableImage>
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 from-0% to-transparent to-50%" />

        <div className="absolute right-0 bottom-0 left-0 p-8 sm:p-12">
          <p className="max-w-2xl text-sm text-cream sm:text-base">
            <Editable path="about.body">{body}</Editable>
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {buttons.map((button, i) => (
              <Link
                key={button.href}
                href={button.href}
                // First button is the solid one, the rest are outlined.
                className={
                  i === 0
                    ? "bg-cream px-6 py-3.5 text-sm font-medium text-espresso transition-opacity hover:opacity-90"
                    : "border border-cream px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-espresso"
                }
              >
                {button.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
