import { Header } from "@/components/Header";
import { SiteImage } from "@/components/SiteImage";

/**
 * The opening band of an interior page: one photograph, the page's title over
 * it, and the header sitting on top in its overlay colours.
 *
 * Shorter than the homepage's full-screen hero — an interior page has to get to
 * its content — but the same gesture, so the site holds together.
 */
export function PageHero({
  src,
  alt,
  label,
  eyebrow,
  lines,
  body,
}: {
  src: string | null;
  alt: string;
  label: string;
  eyebrow: string;
  /** One array entry per line of the title; they stack. */
  lines: string[];
  body: string;
}) {
  return (
    <section className="relative flex min-h-[60vh] flex-col overflow-hidden">
      <SiteImage src={src} alt={alt} label={label} className="absolute inset-0" preload />
      {/* The overlay header is cream whatever is behind it, and these are
          daylight photographs — the wash is what keeps the type readable. */}
      <div className="absolute inset-0 bg-espresso/50" />

      <Header />

      <div className="relative z-10 mt-auto px-8 pt-32 pb-16 sm:px-12">
        <p className="text-xs font-semibold tracking-[-0.02em] text-cream/70 uppercase">{eyebrow}</p>
        <h1 className="mt-4 flex flex-col text-[max(2rem,5.5vw)] leading-[0.95] font-normal tracking-[-0.04em] text-cream uppercase">
          {lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h1>
        <p className="mt-6 max-w-xl text-sm text-cream/80 sm:text-base">{body}</p>
      </div>
    </section>
  );
}
