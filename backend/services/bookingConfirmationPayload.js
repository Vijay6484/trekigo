/**
 * Builds the same `sendPdfEmail` parameter object used after a real booking:
 * - variant `manualMailer`: POST /admin/bookings/manualMailer (booking date from `created_at`)
 * - variant `payuSuccess`: payment success callback email (booking date = local today, coupons like PayU verify)
 */
const { format } = require("date-fns");
const { computeEmailTariffLines } = require("./bookingEmailTariffMath");

function formatCheckDate(dateValue) {
  if (!dateValue) return "Invalid date";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) throw new Error("Invalid date");
    return format(date, "dd/MM/yyyy");
  } catch (e) {
    console.error("❌ Invalid date format:", dateValue);
    return "Invalid date";
  }
}

function formatBookingDateYMD(created_at) {
  const bookingDateObj = created_at ? new Date(created_at) : new Date();
  const bookingDay = String(bookingDateObj.getDate()).padStart(2, "0");
  const bookingMonth = String(bookingDateObj.getMonth() + 1).padStart(2, "0");
  const bookingYear = bookingDateObj.getFullYear();
  return `${bookingYear}-${bookingMonth}-${bookingDay}`;
}

/** Same YYYY-MM-DD "booking date" line as PayU success/verify sends (local today). */
function formatPayUTodayYMD() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
}

function toSendPdfEmailParams(
  { booking, accommodation, user },
  variant = "manualMailer"
) {
  const tariff = computeEmailTariffLines({
    total_amount: booking.total_amount,
    Discount: booking.Discount,
    advance_amount: booking.advance_amount,
  });
  const bookingDate =
    variant === "payuSuccess"
      ? formatPayUTodayYMD()
      : formatBookingDateYMD(booking.created_at);
  const coupons =
    variant === "payuSuccess"
      ? booking.coupon_used || 0
      : booking.coupon_used || "";

  return {
    email: booking.guest_email?.trim() || "",
    name: booking.guest_name || "",
    BookingId: booking.id || "",
    BookingDate: bookingDate,
    CheckinDate: formatCheckDate(booking.check_in) || "",
    CheckoutDate: formatCheckDate(booking.check_out) || "",
    totalPrice: tariff.netPayableFormatted,
    advancePayable: booking.advance_amount || "",
    remainingAmount: tariff.remainingAmount,
    mobile: booking.guest_phone || "",
    totalPerson: (booking.adults || 0) + (booking.children || 0),
    adult: booking.adults || "",
    child: booking.children || "",
    vegCount: booking.food_veg || "",
    nonvegCount: booking.food_nonveg || "",
    joinCount: booking.food_jain || "",
    accommodationName: accommodation.name || "",
    accommodationAddress: accommodation.address || "",
    latitude: accommodation.latitude || "",
    longitude: accommodation.longitude || "",
    ownerEmail: user.email || "",
    ownerName: user.name || "",
    ownerPhone: user.phoneNumber || "",
    rooms: booking.rooms || 0,
    coupons,
    full_amount: tariff.fullAmountDisplay,
    discount: tariff.discountFormatted,
    accommodation_type: accommodation.type || "resort",
  };
}

async function fetchBookingConfirmationContext(pool, { bookingId, paymentTxnId }) {
  const bookingSql = `
      SELECT guest_email, id, guest_name, guest_phone, rooms, adults, children,
             food_veg, food_nonveg, food_jain, check_in, check_out,
             total_amount, advance_amount, coupon_used, Discount, accommodation_id, created_at
       FROM bookings
       WHERE ${bookingId != null ? "id = ?" : "payment_txn_id = ?"}`;
  const key = bookingId != null ? bookingId : paymentTxnId;
  const [bookings] = await pool.execute(bookingSql, [key]);

  if (!bookings.length) return null;
  const booking = bookings[0];

  const [accommodations] = await pool.execute(
    `SELECT name, address, latitude, longitude, owner_id, type
       FROM accommodations
       WHERE id = ?`,
    [booking.accommodation_id]
  );

  if (!accommodations.length) return null;
  const accommodation = accommodations[0];

  const [users] = await pool.execute(
    `SELECT email, name, phoneNumber
       FROM users
       WHERE id = ?`,
    [accommodation.owner_id]
  );

  if (!users.length) return null;
  const user = users[0];

  return { booking, accommodation, user };
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {{ bookingId?: number|string, paymentTxnId?: string, variant?: 'manualMailer'|'payuSuccess' }} opts — exactly one of bookingId / paymentTxnId
 * @returns {Promise<object | null>} sendPdfEmail params, or null if booking chain missing
 */
async function getBookingConfirmationMailParams(pool, opts) {
  const variant = opts.variant || "manualMailer";
  const { bookingId, paymentTxnId } = opts;
  const idStr =
    bookingId != null && bookingId !== "" ? String(bookingId).trim() : "";
  const hasId = idStr !== "" && /^\d+$/.test(idStr) && Number(idStr) >= 1;
  const hasTxn = paymentTxnId != null && String(paymentTxnId).trim() !== "";
  if ((hasId && hasTxn) || (!hasId && !hasTxn)) {
    return null;
  }

  const ctx = await fetchBookingConfirmationContext(pool, {
    bookingId: hasId ? Number(idStr) : null,
    paymentTxnId: hasTxn ? String(paymentTxnId).trim() : null,
  });

  if (!ctx) return null;
  return toSendPdfEmailParams(ctx, variant);
}

module.exports = {
  getBookingConfirmationMailParams,
  fetchBookingConfirmationContext,
  toSendPdfEmailParams,
  formatCheckDate,
  formatBookingDateYMD,
  formatPayUTodayYMD,
};
