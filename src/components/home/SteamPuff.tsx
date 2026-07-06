const WISPS = [
  { size: 44, left: "-10px", duration: "5s", delay: "0s" },
  { size: 36, left: "6px", duration: "6s", delay: "1.8s" },
  { size: 32, left: "-4px", duration: "4.5s", delay: "3.2s" },
];

/**
 * A handful of blurred, softly-glowing circles drifting upward and fading
 * out on a loop — stacked with staggered timing so it reads as one
 * continuous puff rather than three distinct blobs. Pure CSS (see the
 * `steam-rise` keyframes in globals.css), positioned by the caller.
 */
export function SteamPuff({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      {WISPS.map((wisp, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-cream blur-lg"
          style={{
            left: wisp.left,
            width: wisp.size,
            height: wisp.size,
            opacity: 0,
            animation: `steam-rise ${wisp.duration} ease-in-out ${wisp.delay} infinite`,
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}
