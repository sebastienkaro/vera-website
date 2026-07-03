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
}: {
  src: string | null;
  alt: string;
  label: string;
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return <PlaceholderImage label={label} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" />
    </div>
  );
}
