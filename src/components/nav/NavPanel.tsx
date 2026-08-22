import Link from "next/link";
import Image from "next/image";
import { Arrow } from "@/components/nav/icons";
import { siteConfig } from "@/lib/site-config";
import type { NavMenu } from "@/lib/nav-menu";

/**
 * One shop menu, drawn.
 *
 * Three columns, left to right in the order a visitor decides: what this
 * category is, which shelf they want, and — for the visitor who already knows
 * the answer is "ask someone" — the one thing the menu is really for.
 *
 * The panel that animates these open lives in `NavPanels`; this component only
 * knows how a menu looks, which is what keeps the two testable apart.
 */
export function NavPanel({
  label,
  menu,
  onNavigate,
}: {
  /** The header link this menu hangs under, repeated as the panel's eyebrow. */
  label: string;
  menu: NavMenu;
  /** Closes the panel — a link inside it has been followed. */
  onNavigate: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1800px] px-8 pt-9 pb-10 sm:px-12">
      {/* The feature only earns its column once there is room for it beside a
          full set of link columns; below that the links take the width. */}
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-x-10 xl:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,4fr)] xl:gap-x-12">
        <div>
          <p className="text-xs font-medium tracking-wide text-espresso/45 uppercase">{label}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-espresso/65">{menu.blurb}</p>
          <Link
            href={menu.browse.href}
            onClick={onNavigate}
            className="group mt-6 inline-flex items-center gap-2 border-b border-espresso/25 pb-1 text-sm text-espresso transition-colors hover:border-espresso"
          >
            {menu.browse.label}
            <Arrow className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </Link>

          {/* The reason to buy it here rather than anywhere, and the fastest
              way to. Under the category's own links because that is the order
              the decision gets made in. */}
          <div className="mt-9 border-t border-espresso/10 pt-5">
            <p className="text-xs leading-relaxed tracking-wide text-espresso/50 uppercase">
              {menu.note}
            </p>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="mt-3 inline-block text-xs font-medium tracking-wide text-espresso uppercase transition-opacity hover:opacity-70"
            >
              Talk to a specialist — {siteConfig.contact.phone}
            </a>
          </div>
        </div>

        {/* One column per group, so a category with more to say gets more
            columns rather than a longer list. */}
        <div
          className={`grid gap-x-10 gap-y-8 ${
            menu.groups.length >= 3 ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {menu.groups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-medium tracking-wide text-espresso/45 uppercase">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="group inline-flex items-center gap-1.5 text-sm text-espresso/65 transition-colors hover:text-espresso"
                    >
                      {link.label}
                      <Arrow className="-translate-x-1 opacity-0 transition duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* The whole card is clickable, but only the button is the link: the
            copy around it is what the button means, not part of its name.
            A column rather than a fixed frame, so the copy sets the height
            instead of spilling out of it at a narrower width. */}
        <div className="group relative hidden min-h-60 flex-col justify-end overflow-hidden xl:flex">
          <Image
            src={menu.feature.image}
            alt={menu.feature.alt}
            fill
            sizes="(min-width: 1280px) 30vw, 40vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Dark at the foot, clear at the head — the copy sits low, and the
              photo keeps the top of the frame to itself. */}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/60 to-espresso/10" />
          <div className="relative p-6">
            <p className="text-xs font-medium tracking-wide text-cream/60 uppercase">
              {menu.feature.eyebrow}
            </p>
            <p className="mt-2 text-xl leading-tight font-medium text-cream">{menu.feature.title}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/75">
              {menu.feature.body}
            </p>
            <Link
              href={menu.feature.cta.href}
              onClick={onNavigate}
              className="mt-5 inline-flex items-center gap-2 bg-cream px-5 py-3 text-xs font-medium tracking-wide text-espresso uppercase transition-opacity group-hover:opacity-90 after:absolute after:inset-0"
            >
              {menu.feature.cta.label}
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
