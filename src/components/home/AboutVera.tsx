import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteImage } from "@/components/SiteImage";
import { Editable } from "@/components/edit/Editable";
import { EditableImage } from "@/components/edit/EditableImage";
import { resolveRef } from "@/lib/content";
import { getHomeContent } from "@/lib/content-store";

export function AboutVera() {
  const { eyebrow, heading, body, image, secondaryImage, buttons } = getHomeContent().about;

  return (
    <section className="px-8 py-24 sm:px-12 sm:py-32">
      {/* The heading shares the columns' container so its left edge lands on
          the same line as the small photo below it. */}
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={eyebrow} segments={heading} path="about" align="left" />
      </div>

      {/* Two columns: a small photo over the copy on the left, one large photo
          on the right. The left column is spaced apart rather than stacked,
          which is what drops the copy to the foot of the section and lines it
          up with the bottom of the big photo. */}
      <div className="mx-auto mt-20 grid max-w-7xl gap-10 sm:grid-cols-2 sm:gap-20">
        <div className="flex flex-col justify-between gap-12">
          <EditableImage
            path="about.secondaryImage"
            previewClassName="relative aspect-square w-2/3 object-cover sm:w-1/2"
          >
            <SiteImage
              src={resolveRef(secondaryImage)}
              alt={secondaryImage.alt}
              label={secondaryImage.label}
              className="relative aspect-square w-2/3 sm:w-1/2"
              sizes="(min-width: 640px) 320px, 66vw"
            />
          </EditableImage>

          <div>
            <p className="max-w-md text-sm leading-relaxed text-espresso/80">
              <Editable path="about.body">{body}</Editable>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {buttons.map((button, i) => (
                <Link
                  key={button.href}
                  href={button.href}
                  // First button is the solid one, the rest are outlined.
                  className={
                    i === 0
                      ? "bg-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-cream uppercase transition-opacity hover:opacity-90"
                      : "border border-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-colors hover:bg-espresso hover:text-cream"
                  }
                >
                  {button.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stacked on a phone the two columns fall in source order, which
            would bury the section's main photo below the buttons. It leads
            instead, and takes its place on the right once there are two
            columns to sit in. */}
        <EditableImage
          path="about.image"
          previewClassName="relative order-first aspect-[5/6] w-full object-cover sm:order-none"
        >
          <SiteImage
            src={resolveRef(image)}
            alt={image.alt}
            label={image.label}
            className="relative order-first aspect-[5/6] w-full sm:order-none"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </EditableImage>
      </div>
    </section>
  );
}
