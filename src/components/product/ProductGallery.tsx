"use client";

import { useState } from "react";
import { SiteImage } from "@/components/SiteImage";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <SiteImage
        src={active.url || null}
        alt={active.alt}
        label={active.alt}
        className="relative aspect-[4/5] w-full"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image.alt}
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
