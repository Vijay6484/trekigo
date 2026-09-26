"use client";

import { useState } from "react";

export function PhotoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-xl border border-outline-variant">
        <img
          src={images[active]}
          alt={alt}
          className="h-[280px] w-full object-cover sm:h-[420px] md:h-[520px]"
        />
        <button
          type="button"
          className="absolute right-4 bottom-4 rounded-full bg-surface/95 px-4 py-2 text-sm font-medium text-primary shadow-sm"
        >
          View all photos
        </button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {images.map((image, index) => (
          <button
            key={image + index}
            type="button"
            onClick={() => setActive(index)}
            className={`h-16 w-16 flex-none overflow-hidden rounded-lg border-2 sm:h-20 sm:w-20 ${
              active === index ? "border-primary" : "border-transparent"
            }`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
