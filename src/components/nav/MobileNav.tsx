"use client";

import { useState } from "react";
import Link from "next/link";
import { Chevron } from "@/components/nav/icons";
import { NAV_MENUS } from "@/lib/nav-menu";

/**
 * The full-screen menu under `md`, where the shop categories open in place
 * rather than in a drawer — there is no room beside them and no pointer to
 * hover with.
 *
 * A category is a button rather than a link: tapping the row that also holds
 * its sub-shelves should reveal them, not navigate away from them. The shelf
 * itself is the first link inside.
 */
export function MobileNav({
  open,
  items,
  onNavigate,
}: {
  open: boolean;
  items: { label: string; href: string }[];
  /** A link was followed — the header closes the menu behind it. */
  onNavigate: () => void;
}) {
  // Which category is open, kept across a close: the menu fades out as it
  // stands rather than collapsing under itself, and a visitor who shuts it to
  // read the page behind finds it where they left it.
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-40 bg-espresso transition-opacity duration-300 ease-out motion-reduce:transition-none md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <nav className="flex h-full flex-col overflow-y-auto px-8 pt-28 pb-8 text-sm font-medium tracking-wide text-cream uppercase sm:px-12 sm:pt-32">
        {items.map((item) => {
          const menu = NAV_MENUS[item.href];

          if (!menu) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="border-b border-cream/10 py-4 transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            );
          }

          const isExpanded = expanded === item.href;

          return (
            <div key={item.href} className="border-b border-cream/10">
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : item.href)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between py-4 text-left uppercase"
              >
                {item.label}
                <Chevron open={isExpanded} />
              </button>

              {/* Rows collapse from their own height without anything having to
                  measure it — the track goes 0fr to 1fr and the content rides
                  it. */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-6 pb-6">
                    <Link
                      href={menu.browse.href}
                      onClick={onNavigate}
                      className="inline-block border-b border-cream/30 pb-1 text-xs text-cream"
                    >
                      {menu.browse.label}
                    </Link>

                    {menu.groups.map((group) => (
                      <div key={group.title}>
                        <p className="text-[11px] tracking-wide text-cream/40">{group.title}</p>
                        <ul className="mt-3 space-y-2.5">
                          {group.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={onNavigate}
                                className="text-sm font-normal normal-case text-cream/70 transition-colors hover:text-cream"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
