"use client";

import { useState } from "react";
import { SiteImage } from "@/components/SiteImage";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // A Shopify product can have no media at all, and the active index can point
  // past the end if the gallery re-renders with a shorter list.
  const active = images[activeIndex] ?? images[0] ?? { url: "", alt: "" };

  return (
    <div>
      <SiteImage
        src={active.url || null}
        alt={active.alt}
        label={active.alt}
        className="relative aspect-[4/5] w-full"
        sizes="(min-width: 768px) 50vw, 100vw"
        fit="contain"
        padding="p-12 sm:p-20"
      />
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              // Shopify images often share alt text (it defaults to the
              // product title), so the URL is the stable identifier here.
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`transition-opacity ${
                index === activeIndex ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
              aria-label={`Show image: ${image.alt}`}
              aria-pressed={index === activeIndex}
            >
              <SiteImage
                src={image.url || null}
                alt={image.alt}
                label={image.alt}
                className="relative aspect-square"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
