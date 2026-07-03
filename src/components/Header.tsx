import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-8 sm:px-12">
        <nav className="hidden gap-8 text-xs font-medium tracking-wide text-cream uppercase md:flex">
          {siteConfig.navLeft.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="shrink-0">
          <Image
            src="/logo/vera-wordmark-light.svg"
            alt={siteConfig.name}
            width={218}
            height={20}
            priority
          />
        </Link>

        <nav className="hidden gap-8 text-xs font-medium tracking-wide text-cream uppercase md:flex">
          {siteConfig.navRight.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
