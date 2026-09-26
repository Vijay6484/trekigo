"use client";

import { Icon } from "@/components/Icon";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  MAX_ROOMS,
  MIN_ADULTS,
  guestSummary,
  type RoomGuests,
} from "@/lib/booking";

type GuestRoomPickerProps = {
  rooms: RoomGuests[];
  onChange: (rooms: RoomGuests[]) => void;
};

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-on-surface-variant">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-lg disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-primary text-on-primary disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function GuestRoomPicker({ rooms, onChange }: GuestRoomPickerProps) {
  const summary = guestSummary(rooms);

  function updateRoom(index: number, patch: Partial<RoomGuests>) {
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{summary.label}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{summary.detail} · counted per room</p>
        </div>
        {rooms.length < MAX_ROOMS ? (
          <button
            type="button"
            onClick={() => onChange([...rooms, { adults: 2, children: 0 }])}
            className="rounded-full border border-outline-variant px-3 py-1.5 text-xs font-semibold hover:border-on-surface"
          >
            Add room
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {rooms.map((room, index) => (
          <section
            key={`room-${index}`}
            className="rounded-xl border border-outline-variant bg-background px-4 py-2"
          >
            <div className="flex items-center justify-between border-b border-outline-variant py-2">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="bed" className="text-[18px]" />
                Room {index + 1}
              </p>
              {rooms.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onChange(rooms.filter((_, i) => i !== index))}
                  className="text-xs font-medium text-on-surface-variant hover:text-on-surface"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <Stepper
              label="Adults"
              hint="Ages 13+"
              value={room.adults}
              min={MIN_ADULTS}
              max={MAX_ADULTS}
              onChange={(adults) => updateRoom(index, { adults })}
            />
            <div className="border-t border-outline-variant">
              <Stepper
                label="Children"
                hint="Ages 2–12 · under 2 stay free"
                value={room.children}
                min={0}
                max={MAX_CHILDREN}
                onChange={(children) => updateRoom(index, { children })}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
