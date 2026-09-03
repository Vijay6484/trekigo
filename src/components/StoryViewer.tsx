"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

export type StoryItem = {
  label: string;
  image: string;
};

export function StoryViewer({
  stories,
  startIndex = 0,
  onClose,
}: {
  stories: StoryItem[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (index < stories.length - 1) {
        setIndex((value) => value + 1);
      } else {
        onClose();
      }
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [index, onClose, stories.length]);

  const story = stories[index];

  return (
    <div className="fixed inset-0 z-[80] bg-black">
      <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-3">
        {stories.map((item, i) => (
          <div key={item.label} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              key={`${item.label}-${i === index ? index : "idle"}`}
              className={`h-full bg-white ${i < index ? "w-full" : i === index ? "animate-story-progress w-full" : "w-0"}`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-4 z-10 text-white"
        aria-label="Close story"
      >
        <Icon name="close" />
      </button>
      <img src={story.image} alt={story.label} className="h-full w-full object-cover" />
      <p className="absolute bottom-10 left-5 text-lg font-semibold text-white">{story.label}</p>
      <button
        type="button"
        className="absolute inset-y-0 left-0 w-1/3"
        onClick={() => setIndex((value) => Math.max(0, value - 1))}
        aria-label="Previous story"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 w-1/3"
        onClick={() => {
          if (index < stories.length - 1) {
            setIndex((value) => value + 1);
          } else {
            onClose();
          }
        }}
        aria-label="Next story"
      />
    </div>
  );
}
