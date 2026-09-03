"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { StoryViewer } from "@/components/StoryViewer";
import { mostLoved, userAvatar } from "@/lib/data";

const stories = mostLoved.map((item) => ({
  label: item.title,
  image: item.img,
}));

export function HomeSearch() {
  const [openStory, setOpenStory] = useState(false);

  return (
    <section
      id="search"
      className="px-container-margin-mobile md:px-container-margin-desktop"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
        <button
          type="button"
          onClick={() => setOpenStory(true)}
          className="story-glow relative h-16 w-16 shrink-0 rounded-full"
          aria-label="Open stories"
        >
          <span className="story-ring pointer-events-none absolute inset-0 rounded-full" />
          <span className="absolute inset-[3px] overflow-hidden rounded-full bg-surface">
            <img src={userAvatar} alt="" className="h-full w-full object-cover" />
          </span>
        </button>

        <form className="card-shadow flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-outline-variant bg-surface p-2 md:flex-row md:items-center md:gap-0 md:rounded-full md:px-2 md:py-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 md:border-r md:border-outline-variant">
            <Icon name="location_on" className="text-on-surface-variant" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Location / villas / landmark"
            />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 md:border-r md:border-outline-variant">
            <Icon name="calendar_month" className="text-on-surface-variant" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Check-in – Check-out" />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
            <Icon name="group" className="text-on-surface-variant" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="2 guests, 1 room" />
          </label>
          <button
            type="button"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary md:ml-1"
          >
            Search
          </button>
        </form>
      </div>

      {openStory ? (
        <StoryViewer stories={stories} onClose={() => setOpenStory(false)} />
      ) : null}
    </section>
  );
}
