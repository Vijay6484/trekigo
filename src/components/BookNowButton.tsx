"use client";

export function BookNowButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Booking confirmed!")}
      className="w-full rounded-xl bg-primary py-4 font-semibold text-on-primary transition-colors hover:bg-primary-fixed-dim"
    >
      Book now
    </button>
  );
}
