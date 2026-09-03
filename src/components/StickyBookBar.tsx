import Link from "next/link";

export function StickyBookBar({
  price,
  href = "/checkout",
}: {
  price: string;
  href?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface/95 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
        <div>
          <p className="text-xs text-on-surface-variant">From</p>
          <p className="text-lg font-semibold">
            ₹{price} <span className="text-sm font-normal text-on-surface-variant">/ night</span>
          </p>
        </div>
        <Link
          href={href}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-on-primary"
        >
          Book now
        </Link>
      </div>
    </div>
  );
}
