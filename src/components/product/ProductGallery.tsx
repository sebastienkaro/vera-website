"use client";

import { useState } from "react";
import { SiteImage } from "@/components/SiteImage";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Products come from Shopify, where a photo is not guaranteed — fall back to
  // the striped placeholder rather than indexing into an empty array.
  const active = images[activeIndex] ?? null;

  return (
    <div>
      <SiteImage
        src={active?.url || null}
        alt={active?.alt ?? ""}
        label={active?.alt ?? "Product photo"}
        className="relative aspect-[4/5] w-full"
        sizes="(min-width: 768px) 50vw, 100vw"
        fit="contain"
        padding="p-12 sm:p-20"
      />
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              // Most Shopify images carry no alt text and fall back to the
              // product title, so alt is not unique across a gallery.
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`transition-opacity ${
                index === activeIndex ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={index === activeIndex}
            >
              <SiteImage
                src={image.url || null}
                alt={image.alt}
                label={image.alt}
                className="relative aspect-square"
                // A thumbnail is a quarter of the gallery column, which is
                // itself half the page above `md`.
                sizes="(min-width: 768px) 13vw, 25vw"
                // Same treatment as the main image: a machine shot cropped to
                // fill a square reads as a different photo from the one it
                // switches to, which makes the row hard to scan.
                fit="contain"
                padding="p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
