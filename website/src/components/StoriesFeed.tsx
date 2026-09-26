"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { shortStories, type ShortStory } from "@/lib/data";

export function StoriesFeed() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tapTimer = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const [flash, setFlash] = useState<"play" | "pause" | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const active = shortStories[activeIndex];

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: index * scroller.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.index);
        if (Number.isNaN(index)) return;
        setActiveIndex(index);
        setCommentsOpen(false);
        if (index > 0) setShowHint(false);
      },
      { root: scroller, threshold: [0.65, 0.85] },
    );

    scroller.querySelectorAll<HTMLElement>("[data-story-slide]").forEach((slide) => {
      observer.observe(slide);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hintTimer = window.setTimeout(() => setShowHint(false), 4200);
    return () => window.clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const index = shortStories.findIndex((story) => story.id === hash);
    if (index > 0) scrollToIndex(index);
  }, [scrollToIndex]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index !== activeIndex) {
        video.pause();
        return;
      }
      const play = () => {
        video.play().catch(() => {});
      };
      if (video.readyState >= 2) play();
      else video.addEventListener("canplay", play, { once: true });
    });
  }, [activeIndex]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.muted = muted;
    });
  }, [muted, activeIndex]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(Math.min(shortStories.length - 1, activeIndex + 1));
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      }
      if (event.key === "m" || event.key === "M") setMuted((value) => !value);
      if (event.key === " ") {
        event.preventDefault();
        togglePlay(activeIndex);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, scrollToIndex]);

  function like(id: string) {
    setLiked((current) => ({ ...current, [id]: true }));
    setBurstId(id);
    window.setTimeout(() => setBurstId((current) => (current === id ? null : current)), 720);
  }

  function togglePlay(index: number) {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setFlash("play");
    } else {
      video.pause();
      setFlash("pause");
    }
    window.setTimeout(() => setFlash(null), 560);
  }

  function onSurfaceTap(index: number, id: string) {
    if (tapTimer.current) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
      like(id);
      return;
    }
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null;
      togglePlay(index);
    }, 250);
  }

  async function share(story: ShortStory) {
    const url = `${window.location.origin}/stories#${story.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: story.caption, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Link copied");
      window.setTimeout(() => setNotice(null), 1600);
    } catch {
      setNotice("Could not copy link");
      window.setTimeout(() => setNotice(null), 1600);
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 bg-[#120f0d] text-white md:gap-8 md:px-8 xl:gap-14">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(90, 74, 56, 0.45) 0%, rgba(18, 15, 13, 0) 58%)",
        }}
      />

      <aside className="relative z-10 hidden max-h-[92dvh] flex-col gap-3 overflow-y-auto md:flex">
        {shortStories.map((story, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={`relative h-[76px] w-[52px] overflow-hidden rounded-xl transition ${
                selected ? "ring-2 ring-[#e4c48a]" : "opacity-60 ring-1 ring-white/15 hover:opacity-100"
              }`}
              aria-label={`Play ${story.title}`}
            >
              <img src={story.poster} alt="" className="h-full w-full object-cover" />
            </button>
          );
        })}
      </aside>

      <div className="relative z-10 h-dvh w-full min-w-0 md:h-[min(92dvh,900px)] md:w-auto md:shrink-0 md:aspect-[9/16] md:overflow-hidden md:rounded-[28px] md:shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:ring-1 md:ring-white/15">
        <div
          ref={scrollerRef}
          className="hide-scrollbar h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
        >
          {shortStories.map((story, index) => {
            const nearby = Math.abs(index - activeIndex) <= 1;
            return (
              <article
                key={story.id}
                id={story.id}
                data-story-slide
                data-index={index}
                className="relative h-full w-full shrink-0 snap-start snap-always bg-black"
                onClick={() => onSurfaceTap(index, story.id)}
              >
                {failed[story.id] ? (
                  <img src={story.poster} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    src={story.src}
                    poster={story.poster}
                    className="h-full w-full object-cover"
                    playsInline
                    loop
                    muted={muted}
                    preload={nearby ? "auto" : "none"}
                    onTimeUpdate={(event) => {
                      const bar = barRefs.current[index];
                      const video = event.currentTarget;
                      if (!bar || !video.duration) return;
                      bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
                    }}
                    onError={() => setFailed((current) => ({ ...current, [story.id]: true }))}
                  />
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />

                <div className="absolute inset-x-0 top-0 z-20 px-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
                  <div className="h-[3px] overflow-hidden rounded-full bg-white/25">
                    <div
                      ref={(node) => {
                        barRefs.current[index] = node;
                      }}
                      className="h-full w-full origin-left scale-x-0 bg-[#e4c48a]"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href="/"
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-semibold tracking-tight text-white"
                    >
                      treki<span className="text-[#e4c48a]">Go</span>
                    </Link>
                    <span className="text-[11px] tracking-[0.16em] text-white/75">
                      {String(index + 1).padStart(2, "0")} / {String(shortStories.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {burstId === story.id ? (
                  <span className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-white animate-story-heart">
                    <Icon name="favorite" filled className="text-[92px] text-white drop-shadow-lg" />
                  </span>
                ) : null}

                {index === activeIndex && flash ? (
                  <span className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 backdrop-blur-md">
                    <Icon name={flash === "pause" ? "pause" : "play_arrow"} filled className="text-[34px]" />
                  </span>
                ) : null}

                <div className="absolute right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex flex-col items-center gap-3.5 md:bottom-8">
                  <Action
                    icon="favorite"
                    label={liked[story.id] ? "Unlike" : "Like"}
                    filled={liked[story.id]}
                    text={story.likes}
                    active={liked[story.id]}
                    onClick={() =>
                      setLiked((current) => ({ ...current, [story.id]: !current[story.id] }))
                    }
                  />
                  <Action
                    icon="chat_bubble"
                    label="Comments"
                    text={String(story.comments.length)}
                    onClick={() => setCommentsOpen(true)}
                  />
                  <Action icon="ios_share" label="Share" onClick={() => share(story)} />
                  <Action
                    icon="bookmark"
                    label={saved[story.id] ? "Remove save" : "Save"}
                    filled={saved[story.id]}
                    active={saved[story.id]}
                    onClick={() =>
                      setSaved((current) => ({ ...current, [story.id]: !current[story.id] }))
                    }
                  />
                  <Action
                    icon={muted ? "volume_off" : "volume_up"}
                    label={muted ? "Unmute" : "Mute"}
                    onClick={() => setMuted((value) => !value)}
                  />
                </div>

                <div className="pointer-events-none absolute right-16 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] left-4 z-20 md:bottom-6">
                  <p className="flex items-center gap-1 text-[11px] font-medium tracking-[0.16em] text-[#e4c48a] uppercase">
                    <Icon name="location_on" className="text-[14px]" />
                    {story.location}
                  </p>
                  <h2 className="mt-1 text-[1.65rem] leading-none text-white">{story.title}</h2>
                  <p className="mt-2 max-w-[17rem] text-sm leading-snug text-white/85">{story.caption}</p>
                  <Link
                    href={`/property/${story.propertyId}`}
                    onClick={(event) => event.stopPropagation()}
                    className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-md"
                  >
                    {story.propertyName}
                    <span className="text-[#e4c48a]">₹{story.price}</span>
                  </Link>
                </div>

                {index === 0 && showHint ? (
                  <p className="pointer-events-none absolute top-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-[11px] tracking-[0.14em] text-white/85 uppercase backdrop-blur-md">
                    Swipe up
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>

        {notice ? (
          <p className="absolute top-16 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs backdrop-blur-md">
            {notice}
          </p>
        ) : null}

        {commentsOpen ? (
          <div className="absolute inset-0 z-30 flex flex-col justify-end">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close comments"
              onClick={() => setCommentsOpen(false)}
            />
            <div className="relative max-h-[58%] rounded-t-[28px] bg-[#1c1917]/95 px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Comments</p>
                <button type="button" onClick={() => setCommentsOpen(false)} aria-label="Close comments">
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
              <ul className="flex max-h-52 flex-col gap-4 overflow-y-auto">
                {active.comments.map((comment) => (
                  <li key={comment.name + comment.text}>
                    <p className="text-sm font-semibold">{comment.name}</p>
                    <p className="mt-0.5 text-sm leading-snug text-white/75">{comment.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="relative z-10 hidden w-[280px] shrink-0 xl:block">
        <p className="text-[11px] font-medium tracking-[0.2em] text-[#e4c48a] uppercase">Stories</p>
        <h1 className="mt-3 text-4xl leading-[0.95]">{active.title}</h1>
        <p className="mt-3 text-sm text-white/70">{active.location}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/85">{active.caption}</p>
        <Link
          href={`/property/${active.propertyId}`}
          className="mt-6 block overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15"
        >
          <img src={active.poster} alt="" className="h-36 w-full object-cover" />
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{active.propertyName}</p>
              <p className="text-xs text-white/60">From ₹{active.price} / night</p>
            </div>
            <Icon name="arrow_forward" className="text-[18px] text-[#e4c48a]" />
          </div>
        </Link>
        <p className="mt-6 text-xs leading-relaxed text-white/45">
          Scroll, or use the arrow keys. Press M to unmute. Double-tap a film to save it to your likes.
        </p>
      </aside>
    </div>
  );
}

function Action({
  icon,
  label,
  text,
  filled = false,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  text?: string;
  filled?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex flex-col items-center gap-1"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md ${
          active ? "bg-white text-[#1c1917]" : "bg-black/30 text-white ring-1 ring-white/15"
        }`}
      >
        <Icon name={icon} filled={filled} className="text-[22px]" />
      </span>
      {text ? <span className="text-[11px] text-white/90">{text}</span> : null}
    </button>
  );
}
