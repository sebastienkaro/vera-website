"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";

/**
 * What the panel says above the form — the same three lines `/quote` opens
 * with, minus the page's own hero.
 *
 * **This copy is placeholder**, in the voice of `src/app/quote/page.tsx`.
 */
const CONTENT = {
  eyebrow: "Get a Quote",
  heading: "A few details and we'll come back to you",
  body: "Nothing here is binding, and a half-filled form is still worth sending.",
};

/**
 * The quote request over the page, rather than instead of it.
 *
 * Asking for a price on a machine is not a reason to lose the machine — the
 * visitor keeps the listing, the configuration they picked and their place on
 * the page behind the panel, and closing puts them back on it. Same reasoning
 * as the cart drawer, and the same mechanics: portalled to `document.body` so
 * nothing on the page can clip it, page held still while it is open, Escape
 * and the scrim both close it.
 *
 * `/quote` stays where it is — it is what the nav, the footer and anyone
 * arriving without JavaScript still get.
 */
export function QuoteDialog({
  open,
  onClose,
  equipment = "",
}: {
  open: boolean;
  onClose: () => void;
  /** Prefills "What are you looking at?" — the machine they were reading. */
  equipment?: string;
}) {
  const mounted = useMounted();
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(open);

  // Callers write `onClose={() => setOpen(false)}`, which is a new function on
  // every render of the page around it. The effect below must not be torn down
  // and set up again for that: its cleanup moves focus, and doing that while
  // someone is halfway through the form would take them out of the field they
  // were typing in. So it reads the current one through a ref and depends on
  // `open` alone.
  const latestOnClose = useRef(onClose);
  useEffect(() => {
    latestOnClose.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const close = () => latestOnClose.current();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;

      // Tab stays in the panel. A form this long is several Tabs deep, and
      // without this the one past the last field lands on a listing the
      // visitor can no longer see, with no way back but the mouse.
      const stops = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const inPanel = panel.current.contains(document.activeElement);

      if (event.shiftKey && (!inPanel || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inPanel || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Focus moves to the panel's own control so Escape reaches the handler
    // above without a click first, and so the keyboard is inside the form
    // rather than still on the page behind it. The close button rather than
    // the first field: opening a panel shouldn't throw up a phone keyboard.
    const returnTo = document.activeElement;
    closeButton.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Back to the button that opened it, so closing doesn't drop a keyboard
      // visitor at the top of the document.
      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      // Above the sticky header (`z-50`), the mobile menu (`z-40`) and the
      // cart drawer (`z-[60]`), none of which should show through it.
      className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`}
      // The panel stays mounted while closed so it can fade rather than blink,
      // and `inert` is what keeps a form nobody can see off the Tab order and
      // out of the accessibility tree while it waits.
      inert={!open}
    >
      <div
        className={`absolute inset-0 bg-espresso/50 transition-opacity duration-200 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* The panel is taller than a laptop screen with the keyboard up, so the
          scroll lives out here: the whole panel scrolls within the viewport,
          and stays centred while it fits. */}
      <div className="absolute inset-0 overflow-y-auto overscroll-contain">
        <div
          // A click that lands on this padding rather than on the panel is a
          // click outside — which is the scrim, whatever it looks like.
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="flex min-h-full items-center justify-center p-4 sm:p-6"
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal={open}
            aria-labelledby="quote-dialog-heading"
            className={`w-full max-w-xl bg-cream p-6 shadow-[0_0_3rem_rgba(20,12,6,0.35)] transition duration-200 ease-out sm:p-8 ${
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-taupe uppercase">
                  {CONTENT.eyebrow}
                </p>
                <h2
                  id="quote-dialog-heading"
                  className="mt-2 text-xl font-semibold tracking-[-0.02em] text-espresso sm:text-2xl"
                >
                  {CONTENT.heading}
                </h2>
              </div>
              <button
                ref={closeButton}
                type="button"
                onClick={onClose}
                aria-label="Close quote request"
                className="-mt-1 shrink-0 text-xs tracking-wide text-taupe uppercase transition-colors hover:text-espresso"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-espresso/60">{CONTENT.body}</p>

            <QuoteForm equipment={equipment} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
