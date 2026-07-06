"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

function subscribeNever() {
  return () => {};
}

function useMounted() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

export function Header({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const isOverlay = variant === "overlay";
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const light = isOverlay || open;
  const textColor = light ? "text-cream" : "text-espresso";
  const barColor = light ? "bg-cream" : "bg-espresso";
  const mobileNavItems = [...siteConfig.navLeft, ...siteConfig.navRight];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header
      className={
        isOverlay
          ? "absolute inset-x-0 top-0 z-50"
          : `sticky top-0 z-50 ${open ? "" : "border-b border-espresso/10 bg-cream"}`
      }
    >
      <div className="relative z-50 mx-auto flex max-w-[1800px] items-center justify-between px-8 py-8 sm:px-12">
        <nav className={`hidden gap-8 text-xs font-medium tracking-wide uppercase md:flex ${textColor}`}>
          {siteConfig.navLeft.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="shrink-0 md:hidden" onClick={() => setOpen(false)}>
          <Image
            src={light ? "/logo/vera-icon-light.svg" : "/logo/vera-icon-dark.svg"}
            alt={siteConfig.shortName}
            width={26}
            height={26}
            priority
          />
        </Link>

        <Link href="/" className="hidden shrink-0 md:block">
          <Image
            src={isOverlay ? "/logo/vera-wordmark-light.svg" : "/logo/vera-wordmark-dark.svg"}
            alt={siteConfig.name}
            width={218}
            height={20}
            priority
          />
        </Link>

        <nav className={`hidden gap-8 text-xs font-medium tracking-wide uppercase md:flex ${textColor}`}>
          {siteConfig.navRight.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-6 w-7 shrink-0 flex-col items-center justify-center gap-[6px] md:hidden"
        >
          <span
            className={`h-px w-full ${barColor} transition-transform duration-300 ease-out ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-full ${barColor} transition-transform duration-300 ease-out ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {mounted &&
        createPortal(
          <div
            aria-hidden={!open}
            className={`fixed inset-0 z-40 bg-espresso transition-opacity duration-300 ease-out md:hidden ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <nav className="flex h-full flex-col overflow-y-auto px-8 pt-28 pb-8 text-sm font-medium tracking-wide text-cream uppercase sm:px-12 sm:pt-32">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-cream/10 py-4 transition-opacity hover:opacity-70"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </header>
  );
}
