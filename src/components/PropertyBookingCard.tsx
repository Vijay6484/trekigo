"use client";

import { useState } from "react";
import Link from "next/link";
import { DateRangeCalendar } from "@/components/DateRangeCalendar";
import { GuestRoomPicker } from "@/components/GuestRoomPicker";
import { Icon } from "@/components/Icon";
import {
  checkoutHref,
  formatINR,
  formatShortDate,
  guestSummary,
  nightsBetween,
  parsePrice,
  suggestedStay,
  type RoomGuests,
} from "@/lib/booking";
import type { properties } from "@/lib/data";

type Property = (typeof properties)[number];

export function PropertyBookingCard({ property }: { property: Property }) {
  const suggested = suggestedStay();
  const [checkIn, setCheckIn] = useState<Date | null>(suggested.checkIn);
  const [checkOut, setCheckOut] = useState<Date | null>(suggested.checkOut);
  const [rooms, setRooms] = useState<RoomGuests[]>([{ adults: 2, children: 0 }]);
  const [open, setOpen] = useState<"dates" | "guests" | null>(null);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const guests = guestSummary(rooms);
  const nightly = parsePrice(property.price);
  const estimate = nightly * nights * rooms.length;
  const href = checkoutHref({ id: property.id, checkIn, checkOut, rooms });

  return (
    <div className="sticky top-24 rounded-2xl border border-outline-variant bg-surface p-5 card-shadow">
      <div className="mb-4 flex items-end justify-between">
        <p className="text-xl font-semibold">
          {formatINR(nightly)}{" "}
          <span className="text-sm font-normal text-on-surface-variant">/ night</span>
        </p>
        <p className="flex items-center text-sm">
          <Icon name="star" filled className="mr-1 text-[16px] text-accent" />
          {property.rating}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant">
        <button
          type="button"
          onClick={() => setOpen((value) => (value === "dates" ? null : "dates"))}
          className="grid w-full grid-cols-2 border-b border-outline-variant text-left"
        >
          <span className="border-r border-outline-variant px-3 py-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Check-in
            </span>
            <span className="mt-1 block text-sm font-semibold">
              {checkIn ? formatShortDate(checkIn) : "Add date"}
            </span>
          </span>
          <span className="px-3 py-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Check-out
            </span>
            <span className="mt-1 block text-sm font-semibold">
              {checkOut ? formatShortDate(checkOut) : "Add date"}
            </span>
          </span>
        </button>
        {open === "dates" ? (
          <div className="border-b border-outline-variant p-3">
            <DateRangeCalendar
              months={1}
              showFields={false}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(nextIn, nextOut) => {
                setCheckIn(nextIn);
                setCheckOut(nextOut);
              }}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((value) => (value === "guests" ? null : "guests"))}
          className="flex w-full items-center justify-between px-3 py-3 text-left"
        >
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Guests & rooms
            </span>
            <span className="mt-1 block text-sm font-semibold">{guests.label}</span>
          </span>
          <Icon name={open === "guests" ? "expand_less" : "expand_more"} />
        </button>
        {open === "guests" ? (
          <div className="border-t border-outline-variant p-3">
            <GuestRoomPicker rooms={rooms} onChange={setRooms} />
          </div>
        ) : null}
      </div>

      {nights > 0 ? (
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-on-surface-variant">
            {formatINR(nightly)} × {nights} night{nights === 1 ? "" : "s"}
            {rooms.length > 1 ? ` × ${rooms.length} rooms` : ""}
          </span>
          <span className="font-semibold">{formatINR(estimate)}</span>
        </div>
      ) : null}

      <Link
        href={href}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-on-primary"
      >
        Book now
      </Link>
      <p className="mt-3 text-center text-xs text-on-surface-variant">
        You will not be charged yet
      </p>
    </div>
  );
}
