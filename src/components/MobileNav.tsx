"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

const items = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/properties", label: "Properties", icon: "apartment" },
  { href: "/experiences", label: "Experiences", icon: "explore" },
  { href: "/blogs", label: "Blogs", icon: "article" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-outline-variant bg-surface/95 px-2 py-2 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon name={item.icon} filled={active} className="text-[22px]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
