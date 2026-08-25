import { Editable } from "@/components/edit/Editable";

type HeadingSegment = { text: string; tone: "dark" | "muted" };

export function SectionHeading({
  eyebrow,
  segments,
  align = "center",
  eyebrowColor = "text-espresso",
  path,
  as: Tag = "h2",
}: {
  eyebrow: string;
  segments: HeadingSegment[];
  align?: "center" | "left";
  eyebrowColor?: string;
  // Where this heading lives in the content, e.g. `whyVera` — supplied so the
  // text can be edited in place. Omit it and the heading simply isn't editable.
  path?: string;
  // A section heading is an `h2` under the page's own `h1`. A listing page has
  // no other title, so there this heading *is* the `h1`.
  as?: "h1" | "h2";
}) {
  return (
    // Centred headings are centred in their container; left-aligned ones sit
    // against its left edge, so they line up with whatever the section lays
    // out below them rather than floating in from a centred block.
    <div className={`max-w-4xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      <p className={`text-xs font-semibold tracking-[-0.02em] uppercase ${eyebrowColor}`}>
        {path ? <Editable path={`${path}.eyebrow`}>{eyebrow}</Editable> : eyebrow}
      </p>
      <Tag
        className={`mt-4 flex flex-col text-3xl leading-[1.05] font-semibold tracking-[-0.02em] uppercase sm:text-5xl ${
          align === "center" ? "items-center" : "items-start"
        }`}
      >
        {segments.map((segment, i) => (
          <span key={i} className={segment.tone === "dark" ? "text-espresso" : "text-taupe"}>
            {path ? <Editable path={`${path}.heading.${i}.text`}>{segment.text}</Editable> : segment.text}
          </span>
        ))}
      </Tag>
    </div>
  );
}
