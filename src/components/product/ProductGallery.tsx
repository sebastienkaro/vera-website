"use client";

import { useState } from "react";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <PlaceholderImage label={active.alt} className="aspect-[4/5] w-full" />
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
              <PlaceholderImage label={image.alt} className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
