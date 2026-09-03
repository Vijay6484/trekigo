"use client";

import { BackButton } from "@/components/BackButton";
import { Icon } from "@/components/Icon";
import { PHONE } from "@/lib/data";

export function PropertyHeader() {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Trekigo stay", url });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-container-margin-mobile md:px-container-margin-desktop">
        <BackButton
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high"
        />
        <div className="flex items-center gap-2">
          <a
            href={`tel:${PHONE}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface"
            aria-label="Call"
          >
            <Icon name="call" className="text-[20px]" />
          </a>
          <button
            type="button"
            onClick={share}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface"
            aria-label="Share"
          >
            <Icon name="share" className="text-[20px]" />
          </button>
        </div>
      </nav>
    </header>
  );
}
