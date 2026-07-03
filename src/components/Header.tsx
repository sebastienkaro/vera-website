import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export function Header({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const isOverlay = variant === "overlay";

  return (
    <header
      className={
        isOverlay
          ? "absolute inset-x-0 top-0 z-20"
          : "sticky top-0 z-20 border-b border-espresso/10 bg-cream"
      }
    >
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-8 sm:px-12">
        <nav
          className={`hidden gap-8 text-xs font-medium tracking-wide uppercase md:flex ${
            isOverlay ? "text-cream" : "text-espresso"
          }`}
        >
          {siteConfig.navLeft.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="shrink-0">
          <Image
            src={isOverlay ? "/logo/vera-wordmark-light.svg" : "/logo/vera-wordmark-dark.svg"}
            alt={siteConfig.name}
            width={218}
            height={20}
            priority
          />
        </Link>

        <nav
          className={`hidden gap-8 text-xs font-medium tracking-wide uppercase md:flex ${
            isOverlay ? "text-cream" : "text-espresso"
          }`}
        >
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
