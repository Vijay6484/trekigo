export type RoomGuests = {
  adults: number;
  children: number;
};

export const MAX_ROOMS = 4;
export const MAX_ADULTS = 6;
export const MAX_CHILDREN = 4;
export const MIN_ADULTS = 1;
export const MAX_NIGHTS = 30;

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function isSameDay(left: Date, right: Date) {
  return toDateKey(left) === toDateKey(right);
}

export function isBeforeDay(left: Date, right: Date) {
  return startOfDay(left).getTime() < startOfDay(right).getTime();
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

export function isInRange(date: Date, start: Date, end: Date) {
  const time = startOfDay(date).getTime();
  return time > startOfDay(start).getTime() && time < startOfDay(end).getTime();
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function parsePrice(price: string) {
  return Number(price.replace(/,/g, "")) || 0;
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function totalGuests(rooms: RoomGuests[]) {
  return rooms.reduce((sum, room) => sum + room.adults + room.children, 0);
}

export function guestSummary(rooms: RoomGuests[]) {
  const guests = totalGuests(rooms);
  const adults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const children = rooms.reduce((sum, room) => sum + room.children, 0);
  const roomLabel = rooms.length === 1 ? "1 room" : `${rooms.length} rooms`;
  const guestLabel = guests === 1 ? "1 guest" : `${guests} guests`;
  return {
    guests,
    adults,
    children,
    rooms: rooms.length,
    label: `${guestLabel} · ${roomLabel}`,
    detail:
      children > 0
        ? `${adults} adult${adults === 1 ? "" : "s"}, ${children} child${children === 1 ? "" : "ren"}`
        : `${adults} adult${adults === 1 ? "" : "s"}`,
  };
}

export function encodeRooms(rooms: RoomGuests[]) {
  return rooms.map((room) => `${room.adults}.${room.children}`).join("_");
}

export function decodeRooms(value?: string | null): RoomGuests[] {
  if (!value) return [{ adults: 2, children: 0 }];
  const rooms = value.split("_").flatMap((part) => {
    const [adults, children] = part.split(".").map((item) => Number(item));
    if (!Number.isFinite(adults)) return [];
    return [
      {
        adults: Math.min(MAX_ADULTS, Math.max(MIN_ADULTS, adults || MIN_ADULTS)),
        children: Math.min(MAX_CHILDREN, Math.max(0, children || 0)),
      },
    ];
  });
  return rooms.length ? rooms.slice(0, MAX_ROOMS) : [{ adults: 2, children: 0 }];
}

export function suggestedStay(from = new Date()) {
  const today = startOfDay(from);
  const checkIn = addDays(today, 3);
  const checkOut = addDays(checkIn, 2);
  return { checkIn, checkOut };
}

export function eachNightKey(checkIn: Date, checkOut: Date) {
  const keys: string[] = [];
  let current = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  while (current.getTime() < end.getTime()) {
    keys.push(toDateKey(current));
    current = addDays(current, 1);
  }
  return keys;
}

export function stayTotalFromCalendar(
  baseNightly: number,
  checkIn: Date | null,
  checkOut: Date | null,
  days: { date: string; adult_price: number | null }[],
  roomCount = 1,
) {
  if (!checkIn || !checkOut) return 0;
  const total = eachNightKey(checkIn, checkOut).reduce((sum, key) => {
    const day = days.find((item) => item.date === key);
    return sum + (day?.adult_price ?? baseNightly);
  }, 0);
  return total * roomCount;
}

export function checkoutHref(input: {
  id: string;
  checkIn: Date | null;
  checkOut: Date | null;
  rooms: RoomGuests[];
}) {
  const params = new URLSearchParams({ id: input.id });
  if (input.checkIn) params.set("checkIn", toDateKey(input.checkIn));
  if (input.checkOut) params.set("checkOut", toDateKey(input.checkOut));
  params.set("rooms", encodeRooms(input.rooms));
  return `/checkout?${params.toString()}`;
}
