"use client";

import { useState } from "react";
import { StoryViewer } from "@/components/StoryViewer";
import { galleryImages, storyHighlights } from "@/lib/data";

const stories = storyHighlights.map((label, index) => ({
  label,
  image: galleryImages[index % galleryImages.length],
}));

export function InstagramStories() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section>
      <h2 className="mb-4 text-lg">Story</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {stories.map((story, index) => (
          <button
            key={story.label}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="flex flex-col items-center gap-2"
          >
            <span className="relative h-[72px] w-[72px]">
              <span className="story-ring pointer-events-none absolute inset-0 rounded-full" />
              <span className="absolute inset-[3px] overflow-hidden rounded-full bg-surface">
                <img src={story.image} alt="" className="h-full w-full object-cover" />
              </span>
            </span>
            <span className="max-w-[72px] truncate text-[11px] font-medium text-on-surface-variant">
              {story.label}
            </span>
          </button>
        ))}
      </div>
      {openIndex !== null ? (
        <StoryViewer
          stories={stories}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </section>
  );
}
