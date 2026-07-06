import Image from "next/image";
import { PlaceholderImage } from "@/components/PlaceholderImage";

/**
 * Renders a real image when `src` resolves (see `resolveImage`), otherwise
 * falls back to the diagonal-stripe placeholder so pages never break while
 * an image slot is still empty.
 */
export function SiteImage({
  src,
  alt,
  label,
  className = "",
  preload = false,
  sizes = "100vw",
  fit = "cover",
  padding = "p-8",
}: {
  src: string | null;
  alt: string;
  label: string;
  // Must include a position utility (`relative` or `absolute` + inset) —
  // this component doesn't default to one, since combining `relative` and
  // `absolute` in the same class list is ambiguous in Tailwind and can
  // collapse the element to zero height.
  className?: string;
  preload?: boolean;
  sizes?: string;
  // "cover" bleeds the photo to the container's edges (backgrounds, hero
  // shots). "contain" insets it with padding and never crops — for photos
  // on a card, like a product tile, where the whole product should stay
  // visible against the card background.
  fit?: "cover" | "contain";
  // Only used when fit="contain" — how much breathing room to leave around
  // the photo. Bigger cards (a product detail gallery) want more than a
  // small grid tile.
  padding?: string;
}) {
  if (!src) {
    return <PlaceholderImage label={label} className={className} />;
  }

  return (
    <div className={`overflow-hidden bg-sand ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={fit === "contain" ? `object-contain ${padding}` : "object-cover"}
      />
    </div>
  );
}
