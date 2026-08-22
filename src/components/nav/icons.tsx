/**
 * The two marks the menus use. Drawn rather than set in type so they keep the
 * header's hairline weight at any size, and so the arrow can be animated
 * independently of the label beside it.
 */

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M0 4h12M9 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </svg>
  );
}

export function Chevron({ open, className = "" }: { open: boolean; className?: string }) {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      } ${className}`}
    >
      <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
    </svg>
  );
}
