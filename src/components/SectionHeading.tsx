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
    <div className={`mx-auto max-w-4xl ${align === "center" ? "text-center" : "text-left"}`}>
      <p className={`text-xs font-semibold tracking-[-0.02em] uppercase ${eyebrowColor}`}>
        {path ? <Editable path={`${path}.eyebrow`}>{eyebrow}</Editable> : eyebrow}
      </p>
      <Tag
        className={`mt-4 flex flex-col text-3xl leading-tight font-semibold tracking-[-0.02em] uppercase sm:text-5xl ${
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
