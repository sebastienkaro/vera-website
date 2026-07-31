import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteImage } from "@/components/SiteImage";
import { homeContent, resolveRef } from "@/lib/content";

export function AboutVera() {
  const { eyebrow, heading, body, image, buttons } = homeContent.about;

  return (
    <section className="px-8 py-24 sm:px-12">
      <SectionHeading eyebrow={eyebrow} segments={heading} />

      <div className="relative mx-auto mt-16 min-h-[420px] max-w-6xl sm:min-h-[520px]">
        <SiteImage
          src={resolveRef(image)}
          alt={image.alt}
          label={image.label}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 from-0% to-transparent to-50%" />

        <div className="absolute right-0 bottom-0 left-0 p-8 sm:p-12">
          <p className="max-w-2xl text-sm text-cream sm:text-base">{body}</p>
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
