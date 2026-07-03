import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-8 py-16 sm:px-12">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Image
              src="/logo/vera-wordmark-light.svg"
              alt={siteConfig.name}
              width={218}
              height={20}
            />
            <p className="mt-4 max-w-xs text-sm text-cream/70">{siteConfig.footer.blurb}</p>
            <p className="mt-6 text-xs tracking-wide text-cream/50 uppercase">
              {siteConfig.footer.tag}
            </p>
          </div>

          <div>
            <p className="text-xs tracking-wide text-cream/50 uppercase">Shop</p>
            <ul className="mt-4 space-y-3 text-sm">
              {siteConfig.footer.shop.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-cream/70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-wide text-cream/50 uppercase">Company</p>
            <ul className="mt-4 space-y-3 text-sm">
              {siteConfig.footer.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-cream/70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-wide text-cream/50 uppercase">Get in touch</p>
            <p className="mt-4 text-2xl font-medium">{siteConfig.contact.phone}</p>
            <p className="mt-1 text-sm text-cream/70">{siteConfig.contact.phoneNote}</p>
            <p className="mt-6 text-sm text-cream/70">Join our list — deals & new equipment.</p>
            <form className="mt-2 flex items-end gap-2 border-b border-cream/30 pb-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-cream placeholder:text-cream/50 focus:outline-none"
              />
              <button type="submit" aria-label="Subscribe" className="text-cream">
                →
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs tracking-wide text-cream/50 uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <div className="flex gap-6">
            {siteConfig.footer.legal.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-cream/80">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
