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
          className="story-glow relative h-12 w-12 shrink-0 rounded-full md:h-16 md:w-16"
          aria-label="Open stories"
        >
          <span className="story-ring pointer-events-none absolute inset-0 rounded-full" />
          <span className="absolute inset-[3px] overflow-hidden rounded-full bg-surface">
            <img src={userAvatar} alt="" className="h-full w-full object-cover" />
          </span>
        </button>

        <form className="min-w-0 flex-1">
          <div className="card-shadow flex h-12 items-center gap-2 rounded-full border border-outline-variant bg-surface px-2 pl-4 md:hidden">
            <Icon name="search" className="text-on-surface-variant" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search stays, destinations..."
              type="search"
            />
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
              aria-label="Search"
            >
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>

          <div className="card-shadow hidden items-center rounded-full border border-outline-variant bg-surface px-2 py-2 md:flex">
            <label className="flex min-w-0 flex-1 items-center gap-2 border-r border-outline-variant px-3 py-2">
              <Icon name="location_on" className="text-on-surface-variant" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Location / villas / landmark"
              />
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-2 border-r border-outline-variant px-3 py-2">
              <Icon name="calendar_month" className="text-on-surface-variant" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Check-in – Check-out"
              />
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
              <Icon name="group" className="text-on-surface-variant" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="2 guests, 1 room"
              />
            </label>
            <button
              type="button"
              className="ml-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {openStory ? (
        <StoryViewer stories={stories} onClose={() => setOpenStory(false)} />
      ) : null}
    </section>
  );
}
