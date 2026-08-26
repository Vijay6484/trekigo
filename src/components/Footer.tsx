import Link from "next/link";
import { Logo } from "@/components/Logo";
import { footerColumns } from "@/lib/data";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-surface pb-24 md:pb-10">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-container-margin-mobile py-12 sm:grid-cols-3 md:grid-cols-6 md:px-container-margin-desktop">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <Logo compact />
          <p className="mt-4 max-w-xs text-sm leading-6 text-on-surface-variant">
            Go wild, stay chill. Handpicked villas, cottages, and experiences around the hills.
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-2">
            <h4 className="mb-1 text-sm font-semibold text-on-surface">{column.title}</h4>
            {column.links.map((link) => (
              <Link
                key={link}
                href="/"
                className="text-sm text-on-surface-variant transition-colors hover:text-primary"
              >
                {link}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant">
        <p className="mx-auto max-w-[1280px] px-container-margin-mobile py-5 text-sm text-on-surface-variant md:px-container-margin-desktop">
          © {new Date().getFullYear()} Trekigo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
