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
    <section id="offers" className="relative h-[70vh] min-h-[460px] w-full overflow-hidden md:h-[78vh]">
      {offers.map((item, i) => (
        <article
          key={item.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 px-container-margin-mobile pb-24 pt-28 md:px-container-margin-desktop md:pb-28">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/80">
              {item.label}
            </p>
            <h3 className="mb-2 max-w-[80%] text-3xl text-white md:text-5xl">{item.title}</h3>
            <p className="mb-5 max-w-md text-sm text-white/85 md:text-base">{item.subtitle}</p>
            <button
              type="button"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-on-surface"
            >
              {item.cta}
            </button>
          </div>
        </article>
      ))}
      <div className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 gap-2">
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
      <p className="sr-only">{offer.title}</p>
    </section>
  );
}
