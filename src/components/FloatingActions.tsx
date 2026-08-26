import Link from "next/link";
import { Icon } from "@/components/Icon";

export function FloatingActions() {
  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3 md:bottom-8">
      <Link
        href="/trust"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-lg ring-1 ring-outline-variant"
        aria-label="Help"
      >
        <Icon name="chat" />
      </Link>
      <Link
        href="/#search"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
        aria-label="Search"
      >
        <Icon name="search" />
      </Link>
    </div>
  );
}
