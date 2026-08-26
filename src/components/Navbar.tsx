"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/", label: "Stays" },
  { href: "/trust", label: "Experiences" },
  { href: "/#packages", label: "Packages" },
  { href: "/#offers", label: "Offers" },
];

type NavbarProps = {
  variant?: "default" | "property" | "checkout";
};

export function Navbar({ variant = "default" }: NavbarProps) {
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
          {variant === "property" ? (
            <>
              <a
                href="tel:+919876543210"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-primary transition-colors hover:bg-primary-container sm:flex"
                aria-label="Call support"
              >
                <Icon name="call" className="text-[20px]" />
              </a>
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-primary transition-colors hover:bg-primary-container sm:flex"
                aria-label="Share"
              >
                <Icon name="share" className="text-[20px]" />
              </button>
            </>
          ) : null}

          {variant === "checkout" ? (
            <Link
              href="/"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-primary transition-colors hover:bg-primary-container sm:flex"
              aria-label="Search"
            >
              <Icon name="search" className="text-[20px]" />
            </Link>
          ) : (
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-container md:flex"
              aria-label="Saved stays"
            >
              <Icon name="favorite" className="text-[22px]" />
            </button>
          )}

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-primary-container text-primary md:flex"
            aria-label="Account"
          >
            <Icon name="person" className="text-[22px]" />
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary-container md:hidden"
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
                className="rounded-lg px-3 py-2 text-base font-medium text-on-surface hover:bg-primary-container hover:text-primary"
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
