"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import type { WebsiteVideo } from "@/lib/types";

export function MostLovedVideos({ videos }: { videos: WebsiteVideo[] }) {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <section className="px-container-margin-mobile md:px-container-margin-desktop">
      <SectionHeading title="Most loved" />
      <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x">
        {videos.map((item, index) => {
          const poster = item.posterUrl || item.img || "";
          const isPlaying = playing === index && item.videoUrl;
          return (
            <article
              key={item.id ?? item.title}
              className="relative h-64 w-36 flex-none overflow-hidden rounded-xl snap-start sm:h-80 sm:w-44"
            >
              {isPlaying ? (
                <video
                  src={item.videoUrl}
                  poster={poster}
                  className="h-full w-full object-cover"
                  autoPlay
                  controls
                  playsInline
                />
              ) : (
                <>
                  {poster ? (
                    <img src={poster} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-surface-container-high" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <button
                    type="button"
                    onClick={() => setPlaying(index)}
                    className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90"
                    aria-label={`Play ${item.title}`}
                  >
                    <Icon name="play_arrow" filled className="text-[28px]" />
                  </button>
                  <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white">
                    {item.title}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
