"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { PHONE } from "@/lib/data";

const links = [
  { href: "/", label: "Stays" },
  { href: "/trust", label: "Experiences" },
  { href: "/#packages", label: "Packages" },
  { href: "/blogs", label: "Blogs" },
  { href: "/#offers", label: "Offers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-container-margin-mobile md:h-20 md:px-container-margin-desktop">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${PHONE}`}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-surface-container-high md:flex"
            aria-label="Call"
          >
            <Icon name="call" className="text-[20px]" />
          </a>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface md:flex"
            aria-label="Account"
          >
            <Icon name="person" className="text-[22px]" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high md:hidden"
            aria-label="Open menu"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-outline-variant bg-surface px-container-margin-mobile py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-on-surface hover:bg-surface-container-high"
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
