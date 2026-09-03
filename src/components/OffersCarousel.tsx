"use client";

import { useEffect, useState } from "react";
import { offers } from "@/lib/data";

export function OffersCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % offers.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  const offer = offers[index];

  return (
    <section
      id="offers"
      className="px-container-margin-mobile md:px-container-margin-desktop"
    >
      <div className="mb-5 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-outline" />
        <h2 className="text-lg font-semibold tracking-wide text-on-surface">Offers</h2>
        <span className="h-px w-8 bg-outline" />
      </div>
      <div className="relative h-52 overflow-hidden rounded-2xl md:h-72">
        {offers.map((item, i) => (
          <article
            key={item.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent p-6 md:p-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                {item.label}
              </p>
              <h3 className="mb-2 max-w-[80%] text-2xl text-white md:text-4xl">{item.title}</h3>
              <p className="mb-5 max-w-md text-sm text-white/80">{item.subtitle}</p>
              <button
                type="button"
                className="rounded-full bg-surface px-5 py-2 text-sm font-semibold text-on-surface"
              >
                {item.cta}
              </button>
            </div>
          </article>
        ))}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {offers.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Show ${item.title}`}
            />
          ))}
        </div>
      </div>
      <p className="sr-only">{offer.title}</p>
    </section>
  );
}
