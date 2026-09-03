import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path d="M7 12c3-6 7-6 10 0-3 6-7 6-10 0Z" strokeLinejoin="round" />
          <path d="M12 8.5v7" strokeLinecap="round" />
        </svg>
      </span>
      <span
        className={`font-display tracking-[0.18em] text-on-surface ${
          compact ? "text-lg" : "text-xl md:text-2xl"
        }`}
      >
        TREKIGO
      </span>
    </Link>
  );
}
