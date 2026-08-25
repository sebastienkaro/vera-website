import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

/**
 * A full screen of its own at the end of every page, rather than a strip of
 * links: the phone number is the largest thing on it, the directory sits
 * underneath, and the wordmark runs the full width along the bottom edge.
 *
 * `min-h-screen` rather than `h-screen` — on a phone the directory is taller
 * than the viewport, and a fixed height would clip it.
 */
export function Footer() {
  return (
    <footer className="flex min-h-screen flex-col justify-between bg-ink text-cream">
      <div className="mx-auto w-full max-w-7xl px-8 pt-20 sm:px-12 sm:pt-28">
        {/* The part that isn't a directory: talk to us, or hear from us. */}
        <div className="grid gap-12 border-b border-cream/15 pb-16 sm:grid-cols-[1.3fr_1fr] sm:gap-20">
          <div>
            <p className="text-xs tracking-wide text-cream/50 uppercase">Get in touch</p>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\D/g, "")}`}
              className="mt-4 block text-4xl leading-none font-semibold tracking-[-0.02em] transition-opacity hover:opacity-70 sm:text-6xl"
            >
              {siteConfig.contact.phone}
            </a>
            <p className="mt-4 text-sm text-cream/70">{siteConfig.contact.phoneNote}</p>
          </div>

          <div className="sm:pt-8">
            <p className="text-sm text-cream/70">Join our list — deals & new equipment.</p>
            <form className="mt-4 flex items-end gap-2 border-b border-cream/30 pb-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-cream placeholder:text-cream/50 focus:outline-none"
              />
              <button type="submit" aria-label="Subscribe" className="text-cream">
                →
              </button>
            </form>
            <p className="mt-8 text-xs tracking-wide text-cream/50 uppercase">
              {siteConfig.footer.tag}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-4">
          <FooterColumn title="Shop" items={siteConfig.footer.shop} />
          <FooterColumn title="Company" items={siteConfig.footer.company} />
          <FooterColumn title="Legal" items={siteConfig.footer.legal} />
          <div>
            <p className="text-xs tracking-wide text-cream/50 uppercase">Where we are</p>
            <p className="mt-4 max-w-xs text-sm text-cream/70">{siteConfig.footer.blurb}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-8 pb-10 sm:px-12">
        <p className="flex flex-col gap-2 pb-8 text-xs tracking-wide text-cream/50 uppercase sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span>Bridgeport, CT · Long Island City, NY</span>
        </p>

        {/* The full width of the content, not of the window — it lines up with
            everything above it. The closing mark of the page rather than a
            logo in a corner. */}
        <Image
          src="/logo/vera-wordmark-light.svg"
          alt={siteConfig.name}
          width={446}
          height={41}
          className="h-auto w-full"
        />
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-cream/50 uppercase">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="transition-colors hover:text-cream/60">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
