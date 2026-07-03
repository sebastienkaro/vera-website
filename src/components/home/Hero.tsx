import Link from "next/link";
import { Header } from "@/components/Header";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden">
      <PlaceholderImage label="Café interior — hero photo" className="absolute inset-0" />
      <div className="absolute inset-0 bg-espresso/55" />

      <Header />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-8 pt-40 pb-16 sm:px-12">
        <h1 className="max-w-5xl text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] font-normal tracking-[-0.04em] text-cream uppercase">
          Equipment built for those who demand the best
        </h1>

        <div className="flex flex-col items-end gap-6 self-end text-right">
          <p className="text-sm font-medium tracking-wide text-cream uppercase">
            Take a look at our collection
            <br />
            or get a custom quote
          </p>
          <div className="flex gap-4">
            <Link
              href="/machines"
              className="bg-cream px-6 py-3.5 text-xs font-medium tracking-wide text-espresso uppercase transition-opacity hover:opacity-90"
            >
              Browse Machines
            </Link>
            <Link
              href="/quote"
              className="border border-cream px-6 py-3.5 text-xs font-medium tracking-wide text-cream uppercase transition-colors hover:bg-cream hover:text-espresso"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
