"use client";

import { useEffect, useRef, useState } from "react";
import { NavPanel } from "@/components/nav/NavPanel";
import { NAV_MENUS } from "@/lib/nav-menu";

/**
 * The drawer the shop menus open in, and the only thing that moves.
 *
 * All three menus are rendered at once, stacked in the same spot, and the
 * drawer is given the height of whichever one is showing. That is what makes
 * moving from Machines to Grinders one continuous shape rather than a panel
 * closing and another opening — and it means the links are in the page for a
 * crawler whether or not anything is open. The hidden ones are `inert`, so
 * they are out of the tab order until they're the ones on screen.
 *
 * Wide screens only: the header keeps its nav links plain below `lg`, and
 * under `md` hides them altogether for `MobileNav`.
 */
export function NavPanels({
  items,
  openHref,
  onHold,
  onRelease,
  onDismiss,
}: {
  items: { label: string; href: string }[];
  /** The menu showing, or null when the drawer is shut. */
  openHref: string | null;
  /** The pointer is over the drawer — whatever close is pending, call it off. */
  onHold: () => void;
  /** The pointer has left it. */
  onRelease: () => void;
  /** Shut now: a link was followed, or the page behind was clicked. */
  onDismiss: () => void;
}) {
  const panels = useRef(new Map<string, HTMLDivElement | null>());
  const [height, setHeight] = useState(0);

  /*
    The drawer's height is the showing panel's own height, read after render
    rather than guessed — the menus differ in length, and Parts & Accessories
    is nearly twice Grinders. Re-measured on resize because these are columns
    of text: a narrower window wraps them taller.
  */
  useEffect(() => {
    const measure = () => {
      const panel = openHref === null ? null : panels.current.get(openHref);
      setHeight(panel ? panel.offsetHeight : 0);
    };

    measure();
    if (openHref === null) return;

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [openHref]);

  return (
    <>
      {/* Everything below the header, dimmed. Also the click target that shuts
          the drawer — anywhere outside it is "no thanks". */}
      <div
        onClick={onDismiss}
        aria-hidden
        className={`fixed inset-0 z-30 hidden bg-espresso/25 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:block ${
          openHref === null ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />

      <div
        onPointerEnter={onHold}
        onPointerLeave={onRelease}
        style={{ height }}
        className="absolute inset-x-0 top-full z-40 hidden overflow-hidden bg-cream transition-[height] duration-300 ease-out motion-reduce:transition-none lg:block"
      >
        <div className="relative">
          {items.map((item) => {
            const menu = NAV_MENUS[item.href];
            if (!menu) return null;

            const showing = item.href === openHref;

            return (
              <div
                key={item.href}
                ref={(node) => {
                  panels.current.set(item.href, node);
                }}
                inert={!showing}
                // The hairline belongs to the panel rather than to the drawer
                // around it: the drawer is given the panel's own height, and a
                // border on the outside of that measurement would be clipped.
                className={`border-b border-espresso/10 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                  showing ? "relative opacity-100" : "absolute inset-x-0 top-0 opacity-0"
                }`}
              >
                <NavPanel label={item.label} menu={menu} onNavigate={onDismiss} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
