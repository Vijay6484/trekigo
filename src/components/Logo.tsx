import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="trekiGo home">
      <img
        src="/trekigo-logo.png"
        alt="trekiGo"
        className={`w-auto object-contain object-left ${
          compact ? "h-7 max-w-[148px]" : "h-8 max-w-[168px] md:h-9 md:max-w-[188px]"
        }`}
      />
    </Link>
  );
}
