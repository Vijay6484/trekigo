"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DateRangeCalendar } from "@/components/DateRangeCalendar";
import { GuestRoomPicker } from "@/components/GuestRoomPicker";
import { Icon } from "@/components/Icon";
import {
  decodeRooms,
  formatINR,
  formatLongDate,
  fromDateKey,
  guestSummary,
  nightsBetween,
  parsePrice,
  suggestedStay,
  type RoomGuests,
} from "@/lib/booking";
import type { properties } from "@/lib/data";

type Property = (typeof properties)[number];

type CheckoutFormProps = {
  property: Property;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRooms?: string;
};

export function CheckoutForm({
  property,
  initialCheckIn,
  initialCheckOut,
  initialRooms,
}: CheckoutFormProps) {
  const suggested = suggestedStay();
  const [checkIn, setCheckIn] = useState<Date | null>(
    () => fromDateKey(initialCheckIn ?? "") ?? suggested.checkIn,
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    () => fromDateKey(initialCheckOut ?? "") ?? suggested.checkOut,
  );
  const [rooms, setRooms] = useState<RoomGuests[]>(() => decodeRooms(initialRooms));
  const [meal, setMeal] = useState<"veg" | "nonveg">("veg");
  const [pay, setPay] = useState<"full" | "advance">("full");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const guests = guestSummary(rooms);
  const nightly = parsePrice(property.price);
  const stayTotal = nightly * nights * rooms.length;
  const cleaning = nights > 0 ? 1_200 * rooms.length : 0;
  const service = Math.round(stayTotal * 0.06);
  const total = stayTotal + cleaning + service;
  const advance = Math.max(5_000, Math.round(total * 0.2));
  const dueNow = pay === "advance" ? advance : total;
  const canBook = nights > 0 && name.trim() && email.trim() && phone.trim();

  const stayLabel = useMemo(() => {
    if (!checkIn || !checkOut || nights === 0) return "Select your dates";
    return `${formatLongDate(checkIn)} – ${formatLongDate(checkOut)}`;
  }, [checkIn, checkOut, nights]);

  function confirmBooking() {
    if (!canBook) {
      setError("Add dates, guest rooms, and your contact details to continue.");
      return;
    }
    setError("");
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-outline-variant bg-surface p-8 text-center card-shadow">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container">
          <Icon name="check_circle" className="text-[28px]" />
        </span>
        <h1 className="text-2xl">Booking requested</h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          {property.name} is held for {guests.label.toLowerCase()} from {stayLabel}. We will
          confirm on {email || "your email"} shortly.
        </p>
        <p className="mt-4 text-lg font-semibold">{formatINR(dueNow)} due now</p>
        <Link
          href={`/property/${property.id}`}
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary"
        >
          Back to property
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Booking
          </p>
          <h1 className="mt-1 text-3xl">Confirm your stay</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {property.name} · {property.loc}, Maharashtra
          </p>
        </div>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="calendar_month" />
            <h2 className="text-lg">Dates</h2>
          </div>
          <DateRangeCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(nextIn, nextOut) => {
              setCheckIn(nextIn);
              setCheckOut(nextOut);
            }}
          />
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="group" />
            <h2 className="text-lg">Guests & rooms</h2>
          </div>
          <GuestRoomPicker rooms={rooms} onChange={setRooms} />
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 md:p-6">
          <h2 className="mb-4 text-lg">Guest details</h2>
          <div className="grid gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Full name
              </span>
              <input
                className="w-full rounded-xl border border-outline-variant bg-background px-4 py-3 outline-none focus:border-primary"
                placeholder="Name on the booking"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Email
              </span>
              <input
                className="w-full rounded-xl border border-outline-variant bg-background px-4 py-3 outline-none focus:border-primary"
                placeholder="you@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Phone
              </span>
              <input
                className="w-full rounded-xl border border-outline-variant bg-background px-4 py-3 outline-none focus:border-primary"
                placeholder="+91"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 md:p-6">
          <h2 className="text-lg">Meal preference</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Breakfast is included. Tell the host your preference.
          </p>
          <div className="mt-4 flex gap-3">
            {(["veg", "nonveg"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMeal(option)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium ${
                  meal === option
                    ? "bg-primary text-on-primary"
                    : "bg-primary-container text-on-surface"
                }`}
              >
                {option === "nonveg" ? "Non-veg" : "Vegetarian"}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-outline-variant bg-surface p-5 md:p-6">
          <h2 className="text-lg">Payment</h2>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-container/60">
            <input
              type="radio"
              name="pay"
              checked={pay === "full"}
              onChange={() => setPay("full")}
              className="mt-1 accent-primary"
            />
            <div>
              <p className="font-semibold">Pay in full</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {nights > 0 ? `${formatINR(total)} now. Free cancellation for 24 hours.` : "Select dates to see the total."}
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-container/60">
            <input
              type="radio"
              name="pay"
              checked={pay === "advance"}
              onChange={() => setPay("advance")}
              className="mt-1 accent-primary"
            />
            <div>
              <p className="font-semibold">Pay advance</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {nights > 0
                  ? `${formatINR(advance)} now, ${formatINR(total - advance)} at the property.`
                  : "Reserve with a smaller amount, pay the rest at check-in."}
              </p>
            </div>
          </label>
        </section>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <button
          type="button"
          onClick={confirmBooking}
          className="w-full rounded-xl bg-primary py-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-fixed-dim disabled:opacity-40"
          disabled={!canBook}
        >
          {pay === "advance" && nights > 0 ? `Pay ${formatINR(advance)} to book` : "Confirm and book"}
        </button>
        <p className="text-center text-xs text-on-surface-variant">
          You will not be charged until the host confirms.
        </p>
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-28 space-y-4">
          <div className="rounded-2xl border border-outline-variant bg-surface p-5 card-shadow">
            <div className="mb-5 flex gap-4 border-b border-outline-variant pb-5">
              <img
                src={property.img}
                alt={property.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  {property.type}
                </p>
                <h3 className="mt-1 truncate font-semibold">{property.name}</h3>
                <p className="mt-1 flex items-center text-sm text-on-surface-variant">
                  <Icon name="location_on" className="mr-1 text-[16px]" />
                  {property.loc}
                </p>
                <p className="mt-1 flex items-center text-sm">
                  <Icon name="star" filled className="mr-1 text-[16px] text-accent" />
                  {property.rating}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-b border-outline-variant pb-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Dates</span>
                <span className="text-right font-medium">{stayLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Guests</span>
                <span className="text-right font-medium">{guests.label}</span>
              </div>
              <p className="text-right text-xs text-on-surface-variant">{guests.detail}</p>
            </div>

            <h3 className="mt-5 mb-3 font-semibold">Price details</h3>
            {nights > 0 ? (
              <div className="space-y-3 text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span>
                    {formatINR(nightly)} × {nights} night{nights === 1 ? "" : "s"}
                    {rooms.length > 1 ? ` × ${rooms.length} rooms` : ""}
                  </span>
                  <span>{formatINR(stayTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>{formatINR(cleaning)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>{formatINR(service)}</span>
                </div>
                <div className="flex justify-between border-t border-outline-variant pt-3 text-base font-semibold text-on-surface">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
                <div className="flex justify-between text-on-surface">
                  <span>Due now</span>
                  <span className="font-semibold">{formatINR(dueNow)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Select check-in and check-out to see the total.
              </p>
            )}
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-primary-container px-4 py-3 text-xs leading-5 text-on-surface-variant">
            <Icon name="verified_user" className="text-[18px] text-on-surface" />
            Free cancellation for 24 hours. Check-in 2:00 PM · Check-out 11:00 AM.
          </div>
        </div>
      </aside>
    </div>
  );
}
