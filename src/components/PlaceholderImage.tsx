export function PlaceholderImage({
  label,
  className = "",
}: {
  label: string;
  // Must include a position utility (`relative` or `absolute` + inset) —
  // this component doesn't default to one, since combining `relative` and
  // `absolute` in the same class list is ambiguous in Tailwind and can
  // collapse the element to zero height.
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-taupe/25 ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(42,31,22,0.08) 0px, rgba(42,31,22,0.08) 1px, transparent 1px, transparent 14px)",
      }}
    >
      <span className="-rotate-12 text-xs font-semibold tracking-widest text-espresso/40 uppercase">
        {label}
      </span>
    </div>
  );
}
