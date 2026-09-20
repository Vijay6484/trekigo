"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  MAX_NIGHTS,
  addDays,
  addMonths,
  formatLongDate,
  formatMonthYear,
  formatShortDate,
  isBeforeDay,
  isInRange,
  isSameDay,
  nightsBetween,
  startOfDay,
} from "@/lib/booking";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type DateRangeCalendarProps = {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
  months?: 1 | 2;
  showFields?: boolean;
};

function monthCells(view: Date) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  return { startPad: first.getDay(), daysInMonth, year: view.getFullYear(), month: view.getMonth() };
}

export function DateRangeCalendar({
  checkIn,
  checkOut,
  onChange,
  months = 2,
  showFields = true,
}: DateRangeCalendarProps) {
  const today = startOfDay(new Date());
  const [view, setView] = useState(() => startOfDay(checkIn ?? today));
  const [hover, setHover] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"in" | "out">(checkIn && !checkOut ? "out" : "in");

  const previewEnd = checkIn && !checkOut && hover && !isBeforeDay(hover, checkIn) ? hover : checkOut;

  const monthViews = useMemo(
    () => (months === 2 ? [view, addMonths(view, 1)] : [view]),
    [months, view],
  );

  function selectDay(date: Date) {
    if (isBeforeDay(date, today)) return;

    if (!checkIn || (checkIn && checkOut) || selecting === "in") {
      onChange(date, null);
      setSelecting("out");
      return;
    }

    if (isSameDay(date, checkIn)) {
      onChange(checkIn, addDays(checkIn, 1));
      setSelecting("in");
      return;
    }

    if (isBeforeDay(date, checkIn)) {
      onChange(date, null);
      setSelecting("out");
      return;
    }

    if (nightsBetween(checkIn, date) > MAX_NIGHTS) {
      onChange(checkIn, addDays(checkIn, MAX_NIGHTS));
      setSelecting("in");
      return;
    }

    onChange(checkIn, date);
    setSelecting("in");
  }

  const nightCount = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <div>
      {showFields ? (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelecting("in")}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              selecting === "in" ? "border-primary bg-primary-container" : "border-outline-variant bg-background"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Check-in
            </p>
            <p className="mt-1 text-sm font-semibold">
              {checkIn ? formatLongDate(checkIn) : "Select date"}
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              if (checkIn) setSelecting("out");
            }}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              selecting === "out" ? "border-primary bg-primary-container" : "border-outline-variant bg-background"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Check-out
            </p>
            <p className="mt-1 text-sm font-semibold">
              {checkOut ? formatLongDate(checkOut) : "Select date"}
            </p>
          </button>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView((current) => addMonths(current, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-high"
          aria-label="Previous month"
        >
          <Icon name="chevron_left" />
        </button>
        <p className="text-sm font-semibold md:hidden">{formatMonthYear(view)}</p>
        <p className="hidden text-sm font-semibold md:block">
          {monthViews.map((month) => formatMonthYear(month)).join("  ·  ")}
        </p>
        <button
          type="button"
          onClick={() => setView((current) => addMonths(current, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-high"
          aria-label="Next month"
        >
          <Icon name="chevron_right" />
        </button>
      </div>

      <div className={`grid gap-8 ${months === 2 ? "md:grid-cols-2" : ""}`}>
        {monthViews.map((monthDate) => {
          const { startPad, daysInMonth, year, month } = monthCells(monthDate);
          return (
            <div key={`${year}-${month}`} className={months === 2 ? "hidden first:block md:block" : ""}>
              {months === 2 ? (
                <p className="mb-3 hidden text-center text-sm font-semibold md:block">
                  {formatMonthYear(monthDate)}
                </p>
              ) : null}
              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                {WEEKDAYS.map((day) => (
                  <span key={`${year}-${month}-${day}`}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: startPad }, (_, index) => (
                  <span key={`pad-${year}-${month}-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const date = new Date(year, month, index + 1);
                  const disabled = isBeforeDay(date, today);
                  const start = Boolean(checkIn && isSameDay(date, checkIn));
                  const end = Boolean(checkOut && isSameDay(date, checkOut));
                  const edge = start || end;
                  const middle = Boolean(checkIn && previewEnd && isInRange(date, checkIn, previewEnd));
                  const inPreview = Boolean(
                    checkIn && previewEnd && (start || end || middle) && !disabled,
                  );

                  return (
                    <button
                      key={toCellKey(date)}
                      type="button"
                      disabled={disabled}
                      onMouseEnter={() => setHover(date)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => selectDay(date)}
                      className={`relative h-10 text-sm ${inPreview && !edge ? "bg-primary-container" : ""} ${
                        start && previewEnd ? "rounded-l-full bg-primary-container" : ""
                      } ${end ? "rounded-r-full bg-primary-container" : ""}`}
                    >
                      <span
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                          edge
                            ? "bg-primary font-semibold text-on-primary"
                            : disabled
                              ? "text-on-surface-variant/35"
                              : "hover:bg-surface-container-highest"
                        } ${isSameDay(date, today) && !edge ? "ring-1 ring-accent" : ""}`}
                      >
                        {index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-on-surface-variant">
          {nightCount > 0
            ? `${formatShortDate(checkIn!)} – ${formatShortDate(checkOut!)} · ${nightCount} night${nightCount === 1 ? "" : "s"}`
            : selecting === "out"
              ? "Choose your check-out date"
              : "Choose a date or a range of dates"}
        </p>
        {checkIn ? (
          <button
            type="button"
            onClick={() => {
              onChange(null, null);
              setSelecting("in");
            }}
            className="font-medium text-on-surface underline-offset-2 hover:underline"
          >
            Clear dates
          </button>
        ) : null}
      </div>
    </div>
  );
}

function toCellKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
