import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="bg-espresso text-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-28">
        <span className="rounded-full border border-amber/40 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber">
          Placeholder content
        </span>
        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-lg text-cream/80">{siteConfig.tagline}</p>
        <a
          href="#contact"
          className="rounded-full bg-amber px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-amber-dark hover:text-cream"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
