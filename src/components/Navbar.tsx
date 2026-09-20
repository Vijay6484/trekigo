"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { PHONE } from "@/lib/data";

const links = [
  { href: "/", label: "Stays" },
  { href: "/properties", label: "Properties" },
  { href: "/experiences", label: "Experiences" },
  { href: "/blogs", label: "Blogs" },
];

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`top-0 z-50 w-full ${
        overlay
          ? "absolute border-b border-white/20 bg-white/35 backdrop-blur-md"
          : "fixed border-b border-outline-variant bg-surface/90 backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-4 px-container-margin-mobile md:h-20 md:px-container-margin-desktop">
        <Logo />

        <div className="hidden items-center justify-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-on-surface/80 transition-colors hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <a
            href={`tel:${PHONE}`}
            className={`hidden h-10 w-10 items-center justify-center rounded-full text-on-surface md:flex ${
              overlay
                ? "border border-white/40 bg-white/30 hover:bg-white/50"
                : "hover:bg-surface-container"
            }`}
            aria-label="Call"
          >
            <Icon name="call" className="text-[20px]" />
          </a>
          <button
            type="button"
            className={`hidden h-10 w-10 items-center justify-center rounded-full text-on-surface md:flex ${
              overlay
                ? "border border-white/40 bg-white/30 hover:bg-white/50"
                : "hover:bg-surface-container"
            }`}
            aria-label="Account"
          >
            <Icon name="person" className="text-[22px]" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-on-surface md:hidden ${
              overlay
                ? "border border-white/40 bg-white/30"
                : "hover:bg-surface-container"
            }`}
            aria-label="Open menu"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </nav>

      {open ? (
        <div
          className={`border-t px-container-margin-mobile py-4 md:hidden ${
            overlay
              ? "border-white/20 bg-white/80 backdrop-blur-xl"
              : "border-outline-variant bg-surface"
          }`}
        >
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-on-surface hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
