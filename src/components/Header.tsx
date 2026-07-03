import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="border-b border-espresso/10 bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-espresso"
        >
          {siteConfig.name}
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-espresso-light">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-espresso">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
