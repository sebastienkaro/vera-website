"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/cart/CartButton";
import { useCart } from "@/components/cart/CartProvider";
import { Chevron } from "@/components/nav/icons";
import { MobileNav } from "@/components/nav/MobileNav";
import { NavPanels } from "@/components/nav/NavPanels";
import { NAV_MENUS } from "@/lib/nav-menu";
import { siteConfig } from "@/lib/site-config";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMediaQuery } from "@/lib/use-media-query";
import { useMounted } from "@/lib/use-mounted";

/**
 * How long the shop drawer waits after the pointer leaves before shutting.
 * Long enough to cross the gap between a link and the panel below it, or to
 * cut a corner on the way to the next link, and short enough that a drawer
 * left behind doesn't follow you down the page.
 */
const CLOSE_DELAY_MS = 140;

/**
 * The width the shop drawer needs. Below this the header's own row is already
 * tight, and the panel's columns have nowhere to go — so the nav links stay
 * plain links, and the menus are reached through the page they lead to.
 */
const DRAWER_QUERY = "(min-width: 64rem)";

export function Header({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const isOverlay = variant === "overlay";
  const [menuRequested, setMenuRequested] = useState(false);
  const [shopHref, setShopHref] = useState<string | null>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useMounted();
  const hasRoomForDrawer = useMediaQuery(DRAWER_QUERY);
  const { isOpen: cartOpen } = useCart();
  // The menu, the shop drawer and the cart drawer all cover the page, and all
  // three are opened from this row, so the cart wins while it is open —
  // worked out here rather than by closing the others in an effect, which
  // would be a second source of truth for the same fact.
  const open = menuRequested && !cartOpen;
  const shopOpen = shopHref !== null && !cartOpen && hasRoomForDrawer;
  // Cream type over a photo, espresso type over cream. A shop drawer takes the
  // row's transparency with it: the panel below is cream, so the row has to be
  // cream too for the two to read as one surface.
  const light = (isOverlay && !shopOpen) || open;
  const textColor = light ? "text-cream" : "text-espresso";
  const barColor = light ? "bg-cream" : "bg-espresso";
  const mobileNavItems = [...siteConfig.navLeft, ...siteConfig.navRight];

  useBodyScrollLock(open);

  const cancelClose = () => {
    if (closing.current !== null) {
      clearTimeout(closing.current);
      closing.current = null;
    }
  };

  /** Hovering or focusing a nav link: its menu, or none if it hasn't got one. */
  const openShop = (href: string) => {
    cancelClose();
    setShopHref(href in NAV_MENUS ? href : null);
  };

  const closeShop = () => {
    cancelClose();
    setShopHref(null);
  };

  const closeShopSoon = () => {
    cancelClose();
    closing.current = setTimeout(() => setShopHref(null), CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  // Escape shuts the drawer wherever the keyboard happens to be — including
  // nowhere, which is where it is when the drawer was opened by hovering.
  useEffect(() => {
    if (shopHref === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShopHref(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shopHref]);

  return (
    <header
      // Tabbing out of the header — past the last link in the open panel —
      // shuts it. Moving within it doesn't.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeShop();
      }}
      className={
        isOverlay
          ? "absolute inset-x-0 top-0 z-50"
          : `sticky top-0 z-50 ${open ? "" : "border-b border-espresso/10 bg-cream"}`
      }
    >
      {/* The ground the row stands on while a shop menu is down. Under the row
          rather than on it, so it can fade in on its own — and above the scrim
          the drawer lays over the page, which stops short of the header. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-40 bg-cream transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          shopOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-50 mx-auto flex max-w-[1800px] items-center justify-between px-8 py-8 sm:px-12">
        <nav
          onPointerLeave={closeShopSoon}
          className={`hidden gap-6 text-xs font-medium tracking-wide uppercase md:flex xl:gap-8 ${textColor}`}
        >
          {siteConfig.navLeft.map((item) => {
            const hasMenu = item.href in NAV_MENUS;
            const isOpen = shopOpen && shopHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                // Still a link: it goes to the shelf it names, and the menu is
                // what a pointer or the keyboard finds on the way there. A tap
                // navigates rather than opening a panel nobody can hover.
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") openShop(item.href);
                }}
                // Focus opens it too, so a keyboard reaches the menu rather
                // than passing it. The panel's own links come after this row in
                // the tab order — and every one of them is on the page this
                // link leads to as well, so nothing is only in here.
                onFocus={() => openShop(item.href)}
                onClick={closeShop}
                aria-expanded={hasMenu ? isOpen : undefined}
                className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-70 ${
                  isOpen ? "opacity-70" : ""
                }`}
              >
                {item.label}
                {hasMenu && <Chevron open={isOpen} className="hidden opacity-60 lg:block" />}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="shrink-0 md:hidden" onClick={() => setMenuRequested(false)}>
          <Image
            src={light ? "/logo/vera-icon-light.svg" : "/logo/vera-icon-dark.svg"}
            alt={siteConfig.shortName}
            width={26}
            height={26}
            preload
          />
        </Link>

        <Link href="/" className="hidden shrink-0 md:block">
          <Image
            src={light ? "/logo/vera-wordmark-light.svg" : "/logo/vera-wordmark-dark.svg"}
            alt={siteConfig.name}
            width={218}
            height={20}
            preload
          />
        </Link>

        {/* The cart rides at the end of the nav rather than in `siteConfig`:
            it opens a panel instead of going anywhere, so it isn't a link. */}
        <nav
          onPointerEnter={closeShopSoon}
          className={`hidden items-center gap-6 text-xs font-medium tracking-wide uppercase md:flex xl:gap-8 ${textColor}`}
        >
          {siteConfig.navRight.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
          <CartButton tone={light ? "light" : "dark"} />
        </nav>

        {/* On mobile the nav above is hidden, so the cart sits beside the menu
            button — otherwise it would be reachable only through the menu. */}
        <div className="flex items-center gap-5 md:hidden">
          <CartButton tone={light ? "light" : "dark"} />
          <button
            type="button"
            onClick={() => setMenuRequested((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-6 w-7 shrink-0 flex-col items-center justify-center gap-[6px]"
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
      </div>

      <NavPanels
        items={siteConfig.navLeft}
        openHref={shopOpen ? shopHref : null}
        onHold={cancelClose}
        onRelease={closeShopSoon}
        onDismiss={closeShop}
      />

      {mounted &&
        createPortal(
          <MobileNav
            open={open}
            items={mobileNavItems}
            onNavigate={() => setMenuRequested(false)}
          />,
          document.body,
        )}
    </header>
  );
}
