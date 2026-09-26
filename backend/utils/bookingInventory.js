const pool = require("../dbcon");

let selectedDatesColumnReady = false;
let selectedDatesColumnExists = false;

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatYmd(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function toYmd(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatYmd(value);
  }
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function addDaysYmd(ymd, days) {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatYmd(date);
}

function eachNight(checkIn, checkOut) {
  const dates = [];
  if (!checkIn || !checkOut || checkIn >= checkOut) return dates;
  let cursor = checkIn;
  while (cursor < checkOut) {
    dates.push(cursor);
    cursor = addDaysYmd(cursor, 1);
  }
  return dates;
}

function uniqueSortedDates(dates) {
  return [...new Set((dates || []).map(toYmd).filter(Boolean))].sort();
}

function parseSelectedDates(input) {
  if (!input) return [];
  if (Array.isArray(input)) return uniqueSortedDates(input);
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return uniqueSortedDates(parsed);
    } catch {
      // comma-separated fallback
    }
    return uniqueSortedDates(trimmed.split(","));
  }
  return [];
}

function resolveStayDates({ selected_dates, check_in, check_out } = {}) {
  let dates = parseSelectedDates(selected_dates);
  const checkIn = toYmd(check_in);
  const checkOut = toYmd(check_out);

  if (!dates.length && checkIn && checkOut) {
    dates = eachNight(checkIn, checkOut);
  }
  if (!dates.length && checkIn) {
    dates = [checkIn];
  }

  dates = uniqueSortedDates(dates);
  if (!dates.length) {
    return { dates: [], checkIn: checkIn || "", checkOut: checkOut || "" };
  }

  return {
    dates,
    checkIn: dates[0],
    checkOut: addDaysYmd(dates[dates.length - 1], 1),
  };
}

function inventoryAdjustment(roomsValue) {
  if (
    roomsValue === null ||
    roomsValue === undefined ||
    roomsValue === "" ||
    roomsValue === "null"
  ) {
    return 0;
  }
  const parsed = parseInt(roomsValue, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function bookingOccupiesDate(booking, dateStr) {
  const selected = parseSelectedDates(booking.selected_dates);
  if (selected.length) {
    return selected.includes(dateStr);
  }
  const checkIn = toYmd(booking.check_in);
  const checkOut = toYmd(booking.check_out);
  return Boolean(checkIn && checkOut && checkIn <= dateStr && dateStr < checkOut);
}

async function ensureSelectedDatesColumn(conn = pool) {
  if (selectedDatesColumnReady) {
    return selectedDatesColumnExists;
  }

  try {
    await conn.execute(
      "ALTER TABLE bookings ADD COLUMN selected_dates TEXT NULL"
    );
    selectedDatesColumnExists = true;
    console.log('[inventory] Added bookings.selected_dates column');
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      selectedDatesColumnExists = true;
    } else {
      console.error(
        "[inventory] Could not ensure selected_dates column:",
        error.message
      );
      selectedDatesColumnExists = false;
    }
  }

  selectedDatesColumnReady = true;
  return selectedDatesColumnExists;
}

async function getAvailabilityForDates(
  conn,
  accommodationId,
  dates,
  { lock = false, excludeBookingId = null } = {}
) {
  const dateArray = uniqueSortedDates(dates);
  if (!dateArray.length) {
    return {
      baseRooms: 0,
      dates: [],
      minAvailableRooms: 0,
    };
  }

  await ensureSelectedDatesColumn(conn);

  const lockSql = lock ? " FOR UPDATE" : "";
  const [accommodationRows] = await conn.execute(
    `SELECT id, rooms, type FROM accommodations WHERE id = ?${lockSql}`,
    [accommodationId]
  );

  if (!accommodationRows.length) {
    const error = new Error("Accommodation not found");
    error.statusCode = 404;
    throw error;
  }

  const baseRooms = parseInt(accommodationRows[0].rooms, 10) || 0;
  const placeholders = dateArray.map(() => "?").join(", ");

  const [blockedRows] = await conn.execute(
    `SELECT DATE_FORMAT(blocked_date, '%Y-%m-%d') AS blocked_date, rooms
     FROM blocked_dates
     WHERE accommodation_id = ?
       AND DATE_FORMAT(blocked_date, '%Y-%m-%d') IN (${placeholders})`,
    [accommodationId, ...dateArray]
  );

  const blockedMap = {};
  blockedRows.forEach((row) => {
    blockedMap[row.blocked_date] = inventoryAdjustment(row.rooms);
  });

  const rangeStart = dateArray[0];
  const rangeEndExclusive = addDaysYmd(dateArray[dateArray.length - 1], 1);
  const excludeSql = excludeBookingId ? " AND id <> ?" : "";
  const bookingParams = [accommodationId, rangeEndExclusive, rangeStart];
  if (excludeBookingId) bookingParams.push(excludeBookingId);

  const selectedDatesSql = selectedDatesColumnExists
    ? ", selected_dates"
    : "";

  const [bookingRows] = await conn.execute(
    `SELECT
        DATE_FORMAT(check_in, '%Y-%m-%d') AS check_in,
        DATE_FORMAT(check_out, '%Y-%m-%d') AS check_out,
        rooms
        ${selectedDatesSql}
     FROM bookings
     WHERE accommodation_id = ?
       AND payment_status IN ('success', 'pending')
       AND DATE(check_in) < ?
       AND DATE(check_out) > ?
       AND (
         payment_status = 'success'
         OR created_at > NOW() - INTERVAL 1 HOUR
       )
       ${excludeSql}`,
    bookingParams
  );

  const bookedRoomsMap = {};
  dateArray.forEach((date) => {
    bookedRoomsMap[date] = 0;
  });

  bookingRows.forEach((booking) => {
    const rooms = parseInt(booking.rooms, 10) || 0;
    dateArray.forEach((date) => {
      if (bookingOccupiesDate(booking, date)) {
        bookedRoomsMap[date] += rooms;
      }
    });
  });

  const availabilityDates = dateArray.map((date) => {
    const additionalRooms = blockedMap[date] || 0;
    const totalRooms = Math.max(0, baseRooms + additionalRooms);
    const bookedRooms = bookedRoomsMap[date] || 0;
    const availableRooms = Math.max(0, totalRooms - bookedRooms);
    return {
      date,
      total_rooms: totalRooms,
      booked_rooms: bookedRooms,
      available_rooms: availableRooms,
      additional_rooms: additionalRooms,
    };
  });

  return {
    accommodationId,
    baseRooms,
    dates: availabilityDates,
    minAvailableRooms: Math.min(
      ...availabilityDates.map((item) => item.available_rooms)
    ),
  };
}

async function assertRoomsAvailable(
  conn,
  accommodationId,
  dates,
  requestedRooms,
  options = {}
) {
  const rooms = parseInt(requestedRooms, 10) || 0;
  if (rooms < 1) {
    const error = new Error("Must request at least 1 room");
    error.statusCode = 400;
    throw error;
  }

  const availability = await getAvailabilityForDates(
    conn,
    accommodationId,
    dates,
    { lock: true, ...options }
  );

  const shortDates = availability.dates.filter(
    (item) => item.available_rooms < rooms
  );

  if (shortDates.length) {
    const first = shortDates[0];
    const error = new Error(
      `Only ${first.available_rooms} room(s) available on ${first.date}. Reduce rooms or choose different dates.`
    );
    error.statusCode = 409;
    error.availability = availability;
    throw error;
  }

  return availability;
}

module.exports = {
  addDaysYmd,
  assertRoomsAvailable,
  bookingOccupiesDate,
  ensureSelectedDatesColumn,
  formatYmd,
  getAvailabilityForDates,
  parseSelectedDates,
  resolveStayDates,
  toYmd,
  uniqueSortedDates,
};
