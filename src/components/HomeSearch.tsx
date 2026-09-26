import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

function SearchOrbit({ children }: { children: ReactNode }) {
  return (
    <div className="search-orbit card-shadow w-full">
      <span className="search-orbit-spin" aria-hidden />
      <div className="search-orbit-inner">{children}</div>
    </div>
  );
}

export function HomeSearch() {
  return (
    <section
      id="search"
      className="px-container-margin-mobile md:px-container-margin-desktop"
    >
      <form className="mx-auto w-full max-w-4xl">
        <div className="md:hidden">
          <SearchOrbit>
            <div className="flex h-12 items-center gap-2 px-2 pl-4">
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
          </SearchOrbit>
        </div>

        <div className="hidden md:block">
          <SearchOrbit>
            <div className="flex items-center px-2 py-2">
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
          </SearchOrbit>
        </div>
      </form>
    </section>
  );
}
