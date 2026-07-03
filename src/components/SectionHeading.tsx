type HeadingSegment = { text: string; tone: "dark" | "muted" };

export function SectionHeading({
  eyebrow,
  segments,
  align = "center",
  eyebrowColor = "text-espresso",
}: {
  eyebrow: string;
  segments: HeadingSegment[];
  align?: "center" | "left";
  eyebrowColor?: string;
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className={`text-xs font-semibold tracking-[-0.02em] uppercase ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-5xl">
        {segments.map((segment, i) => (
          <span key={i} className={segment.tone === "dark" ? "text-espresso" : "text-taupe"}>
            {segment.text}{" "}
          </span>
        ))}
      </h2>
    </div>
  );
}
