const CORE = [
  { size: 42, left: "-11px", duration: "1.5s", delay: "0s" },
  { size: 38, left: "10px", duration: "1.3s", delay: "0.45s" },
  { size: 34, left: "-6px", duration: "1.7s", delay: "0.9s" },
  { size: 30, left: "14px", duration: "1.4s", delay: "1.3s" },
];

const PLUME = [
  { size: 78, left: "-25px", duration: "3.4s", delay: "0.3s" },
  { size: 70, left: "17px", duration: "3.9s", delay: "1.1s" },
  { size: 64, left: "-11px", duration: "3.1s", delay: "1.9s" },
  { size: 56, left: "8px", duration: "3.6s", delay: "2.6s" },
  { size: 48, left: "-3px", duration: "3.2s", delay: "3.4s" },
];

/**
 * A vigorous puff of steam: a bright, tight "core" bursting up fast right at
 * the source, plus a taller, softer "plume" that billows and drifts as it
 * dissipates above it. Pure CSS (`steam-core` / `steam-plume` keyframes in
 * globals.css), positioned by the caller.
 */
export function SteamPuff({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ filter: "drop-shadow(0 0 14px rgba(20,12,6,0.55))" }}
      aria-hidden="true"
    >
      {PLUME.map((wisp, i) => (
        <span
          key={`plume-${i}`}
          className="absolute bottom-0 rounded-full bg-cream blur-sm"
          style={{
            left: wisp.left,
            width: wisp.size,
            height: wisp.size,
            opacity: 0,
            animation: `steam-plume ${wisp.duration} ease-out ${wisp.delay} infinite`,
            animationFillMode: "both",
          }}
        />
      ))}
      {CORE.map((wisp, i) => (
        <span
          key={`core-${i}`}
          className="absolute bottom-0 rounded-full bg-white"
          style={{
            left: wisp.left,
            width: wisp.size,
            height: wisp.size,
            opacity: 0,
            animation: `steam-core ${wisp.duration} ease-out ${wisp.delay} infinite`,
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}
