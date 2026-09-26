const express = require("express");

const router = express.Router();

const pool = require("../dbcon");

const crypto = require("crypto");

const PayU = require("payu-websdk");

const puppeteer = require("puppeteer");

const { format } = require("date-fns");

const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const sendPdfEmail = require("../services/sendBookingConfirmationEmail");

const {
  getBookingConfirmationMailParams,
} = require("../services/bookingConfirmationPayload");

const { computeEmailTariffLines } = require("../services/bookingEmailTariffMath");

const {
  assertRoomsAvailable,
  ensureSelectedDatesColumn,
  getAvailabilityForDates,
  resolveStayDates,
} = require("../utils/bookingInventory");

async function assertGuestCapacity(connection, accommodationId, rooms, adults, children) {
  const [[row]] = await connection.execute(
    `SELECT type, capacity FROM accommodations WHERE id = ?`,
    [accommodationId]
  );
  if (!row) return;
  const type = String(row.type || "").toLowerCase();
  const capacity = Number(row.capacity) || 0;
  if (!capacity) return;
  const total = Number(adults || 0) + Number(children || 0);
  const roomCount = Math.max(1, Number(rooms) || 1);
  if (type === "cottage" && total > roomCount * capacity) {
    const error = new Error(
      `Maximum ${capacity} guests per room. You have ${total} guests for ${roomCount} room(s).`
    );
    error.statusCode = 400;
    throw error;
  }
}

ensureSelectedDatesColumn().catch((error) => {
  console.error("Failed to ensure selected_dates column:", error.message);
});

const payu_key = process.env.PAYU_MERCHANT_KEY || "n5ikm0"; //process.env.PAYU_MERCHANT_KEY;

const payu_salt = process.env.PAYU_MERCHANT_SALT || "diKKGjJv3yODMXnmPF48WXaQLWoBJaD2";

// "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCS2TYPoivPA9qOZW+c+evpYJGF9I6Ti/FVL3+3AyEImmWr9kd8NXRnWkRw79JmzJ+wUL1HkuloTCEvOcnoN16sd2bQ3n4j2WRca0QkHbx4JougH3NKfUkVIo2n21xlaxu9xiIjMZF1OQbNhMJfid/vP7FSaUhLdN46aWvyjxohK30IRvGnXbOH3666UtJXDSvebtrClLfUdX/9zOXLUU45vncGyCtylNiADLW5dMR5EkB8vQwpFXbQ+79LG9RRSDD8yCIJbd8Z4EB5gt1rQwdiUeV2T45ncSETFNKudUtwt/SxffzQPH5qDiyU2D35Cc5lUQQmELjK9aLYI/ge6ss1AgMBAAECggEAFxolc2GttzBxxIeoPr+hsdIvqq2N9Z/lPGPP2ZScMIyLtLk2x09oi+7rSAIurV4BPF2DXZx67F3XtaSHg2kck5DoQ7FREmY7r/9vFah480ULH8p62ovpwLGyK+dqeokWcO1YBwXgDptFWvVJF/sql+rDBIZMKZTN9k4J/buuHmwKQEqOowUBQWP1oo0Sgrnv48nQqlPfGatxq7U4w4hRLf3l6UR0c/mPHVb00UabBaZzZ9B/jMMasHDtLKYQ/69VtCo2QVm9Kykh3bRHKjiAF5f606gHiewILi3jj+lcnUrcDL1pFkBqskrJ8NibHfdJkaT1w3W1n463cLfCCntD2QKBgQC67h1lGo3avoB4GdoGMzqsDg9Bub0FpI2/lnL5oeFgygRvYRBb78E3fUKuYIWcUjiZaTgukIsMtZKPEpv90tJXua5dQEOOip9D4SQddHoT7MNToFFKJ5pXzHonc8dSMQYLV3LeR1V/9inJhrRPjedhr1jdJBMLZIAOe/mZBDh8CQKBgQDJG7zPL0sua6WkX6lLX0JydmEjbOFedeL2olY3pm8Vj0iC1ejUzsYrRwHEc1YUr2bO0NQ0uQ64dLhl+AXu2HwCWu7aRKMas0lg4uFemcmerqUMd1ozJJfI3fhjfSaFXwSqn5LcclUCXt/LOx49cxN9HmPHYNpyvV+P17gchIG4zQKBgCL95+rBKcTE3G+fBz0Z4eXLS/fVuRiRUSeIFkW8k9/2cRYYaWOMYfLtM8pIrzov+gBdvfKZhC4A30qBBUpiaJWbYJR8LylDscSXJJeO8jtAmt/QpubmuvGsiUFRXwJ3wtXkrNAHMm4dunzLBn3N5n5WwJ/E3PvI+F+9vV9zds9hAoGAdz5eHo8RSe4EIkmibRGHqaztff7SRpspv0mUS50A4sy5lvJVAtG0CPcqYhxtHwi9scV6/eP4iYCT0cpVYkC0jwTx+TOXbn599Nex/9C6Dr/JF3IxZn+9DBopbHxJee1ULANAJjwYkbZFhhCAprj0Bk0dppuUC1KkNfsXrLkY3cUCgYAYdRxY9KFg97jhRyD25LKTHbLyp5+rd53UxxNM5GGaxwHCe0FPj9jTD9x6NoGIg1cLDeaTIy20a4cDJx5v50yrMFvnbIMCcQ4nm71GfXUtO53O/k4ptTk9jVlM8ymJ/kK0956OODrrCTz/4Sur4+11gkd1LAw+MfKHZ8gtWrswPQ=="; //process.env.PAYU_MERCHANT_SALT;

const PAYU_BASE_URL = process.env.PAYU_BASE_URL || "https://test.payu.in"  //'https://secure.payu.in';

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "https://nirwanastays.com";

const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || "https://api.nirwanastays.com";

// BOOKING CLEANUP JOB

const bookingCleanup = () => {
  setInterval(async () => {
    try {
      const [result] = await pool.execute(
        `UPDATE bookings 

         SET payment_status = 'expired'

         WHERE payment_status = 'pending'

         AND created_at < NOW() - INTERVAL 1 HOUR`
      );

      console.log(`Marked ${result.affectedRows} bookings as expired`);
    } catch (error) {
      console.error("Booking cleanup error:", error);
    }
  }, 30 * 60 * 1000); // every 30 minutes
};

bookingCleanup();

// GET /admin/bookings - fetch all bookings

router.get("/", async (req, res) => {
  try {
    await ensureSelectedDatesColumn();
    const { 
      page = 1, 
      limit = 20,
      search,
      payment_status,
      status,
      start_date,
      end_date
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause dynamically
    let whereConditions = [];
    let queryParams = [];

    // Search filter - search in guest name, email, phone, booking ID, payment_txn_id
    if (search) {
      whereConditions.push(`(
        b.guest_name LIKE ? OR 
        b.guest_email LIKE ? OR 
        b.guest_phone LIKE ? OR 
        b.payment_txn_id LIKE ? OR
        CAST(b.id AS CHAR) LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Payment status filter
    if (payment_status) {
      whereConditions.push('b.payment_status = ?');
      queryParams.push(payment_status);
    }

    // Date range filter - check_in date range
    if (start_date) {
      whereConditions.push('DATE(b.check_in) >= ?');
      queryParams.push(start_date);
    }
    if (end_date) {
      whereConditions.push('DATE(b.check_in) <= ?');
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Main query
    const bookingsQuery = `
      SELECT 

        b.id,

        b.guest_name,

        b.guest_email,

        b.guest_phone,
        b.food_veg,
        b.food_nonveg,
        b.food_jain,

        a.name AS accommodation_name,

        DATE_FORMAT(b.check_in, '%Y-%m-%d') AS check_in,

        DATE_FORMAT(b.check_out, '%Y-%m-%d') AS check_out,

        b.selected_dates,






        b.adults,

        b.children,

        b.rooms,

        b.total_amount,

        b.advance_amount,

        b.Discount,
        b.coupon_used,

        b.payment_status,

        b.payment_txn_id,

        b.created_at




      FROM bookings b
      LEFT JOIN accommodations a ON b.accommodation_id = a.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM bookings b
      LEFT JOIN accommodations a ON b.accommodation_id = a.id
      ${whereClause}
    `;

    // Execute queries
    const [bookings] = await pool.execute(
      bookingsQuery,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    const [[{ count }]] = await pool.execute(
      countQuery,
      queryParams
    );

    res.json({
      success: true,

      data: bookings,

      pagination: {
        total: count,

        page: parseInt(page),

        limit: parseInt(limit),

        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);

    res.status(500).json({
      success: false,

      error: "Failed to fetch bookings",

      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// POST /admin/bookings - create booking

router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      guest_name,
      guest_email,
      guest_phone,
      accommodation_id,
      package_id,

      check_in,
      check_out,
      selected_dates,
      adults = 1,
      children = 0,
      rooms = 1,

      food_veg = 0,
      food_nonveg = 0,
      food_jain = 0,
      total_amount,

      advance_amount = 0,
      coupon_code = 0,
      discount = 0,
      payment_method = "payu",
    } = req.body;

    console.log(req.body);

    const stay = resolveStayDates({ selected_dates, check_in, check_out });

    const requiredFields = [
      "guest_name",
      "accommodation_id",
      "package_id",
      "total_amount",
    ];

    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null
    );

    if (!stay.dates.length) {
      missingFields.push("selected_dates");
    }

    console.log(missingFields);

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

    const totalGuests = adults + children;

    const totalFood = food_veg + food_nonveg + food_jain;

    // if (totalFood !== totalGuests) {
    //   return res
    //     .status(400)
    //     .json({
    //       success: false,
    //       error: "Food preferences must match total guests",
    //     });
    // }

    if (stay.checkIn >= stay.checkOut) {
      return res
        .status(400)
        .json({ success: false, error: "Check-out must be after check-in" });
    }

    if (total_amount <= 0 || advance_amount < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid amount values" });
    }

    if (adults < 1 || rooms < 1) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Must have at least 1 adult and 1 room",
        });
    }

    try {
      await assertGuestCapacity(
        connection,
        accommodation_id,
        rooms,
        adults,
        children
      );
    } catch (capacityError) {
      return res.status(capacityError.statusCode || 400).json({
        success: false,
        error: capacityError.message,
      });
    }

    await connection.beginTransaction();

    await assertRoomsAvailable(
      connection,
      accommodation_id,
      stay.dates,
      rooms
    );

    const payment_status = "pending";

    const payment_txn_id = `BOOK-${uuidv4()}`;

    const [result] = await connection.execute(
      `

      INSERT INTO bookings (

        guest_name, guest_email, guest_phone, accommodation_id, package_id,

        check_in, check_out, adults, children, rooms, food_veg, food_nonveg, 

        food_jain, total_amount, advance_amount, payment_status, payment_txn_id, created_at,coupon_used,Discount, selected_dates

      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        guest_name,
        guest_email,
        guest_phone || null,
        accommodation_id,
        package_id,

        stay.checkIn,
        stay.checkOut,
        adults,
        children,
        rooms,
        food_veg || 0,
        food_nonveg || 0,
        food_jain || 0,
        total_amount,
        advance_amount,
        payment_status,
        payment_txn_id,
        new Date(),
        coupon_code || null,
        discount || 0,
        JSON.stringify(stay.dates),
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      data: {
        booking_id: result.insertId,
        payment_txn_id,
        payment_status,
        selected_dates: stay.dates,
        check_in: stay.checkIn,
        check_out: stay.checkOut,
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Transaction may not have started yet
    }

    console.error("Error creating booking:", error);

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,

      error:
        statusCode === 409 || statusCode === 400 || statusCode === 404
          ? error.message
          : "Failed to create booking",

      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    connection.release();
  }
});

router.post("/offline", async (req, res) => {
  let connection;

  try {
    const {
      guest_name,
      guest_email,
      guest_phone,
      accommodation_id,

      check_in,
      check_out,
      selected_dates,
      adults = 1,
      children = 0,
      rooms = 1,

      food_veg = 0,
      food_nonveg = 0,
      food_jain = 0,

      total_amount,
      advance_amount = 0,
      coupon,
      discount,
      full_amount
    } = req.body;

    const stay = resolveStayDates({ selected_dates, check_in, check_out });

    // Validate required fields

    const requiredFields = [
      "guest_name",
      "guest_email",
      "accommodation_id",
      "total_amount",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (!stay.dates.length) {
      missingFields.push("selected_dates");
    }

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest_email)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Invalid email format",
        });
    }

    // Validate food count vs guest count

    const totalGuests = adults + children;

    const totalFood = food_veg + food_nonveg + food_jain;

    if (totalFood > 0 && totalFood !== totalGuests) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Food preferences must match total guests",
        });
    }

    // Validate check-in/out dates

    if (stay.checkIn >= stay.checkOut) {
      return res
        .status(400)
        .json({ success: false, error: "Check-out must be after check-in" });
    }

    // Validate positive values

    if (total_amount <= 0 || advance_amount < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid amount values" });
    }

    if (adults < 1 || rooms < 1) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Must have at least 1 adult and 1 room",
        });
    }

    // Get connection after all validations pass
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Validate accommodation exists
    const [[accommodationCheck]] = await connection.execute(
      `SELECT id, type, capacity FROM accommodations WHERE id = ?`,
      [accommodation_id]
    );

    if (!accommodationCheck) {
      await connection.rollback();
      return res
        .status(404)
        .json({
          success: false,
          error: "Accommodation not found",
        });
    }

    try {
      await assertGuestCapacity(
        connection,
        accommodation_id,
        rooms,
        adults,
        children
      );
    } catch (capacityError) {
      await connection.rollback();
      return res.status(capacityError.statusCode || 400).json({
        success: false,
        error: capacityError.message,
      });
    }

    await assertRoomsAvailable(
      connection,
      accommodation_id,
      stay.dates,
      rooms
    );

    const payment_status = "success";

    const payment_txn_id = `BOOK-${uuidv4()}`;

    // Insert into bookings

    const [result] = await connection.execute(
      `

      INSERT INTO bookings (

        guest_name, guest_email, guest_phone, accommodation_id,

        check_in, check_out, adults, children, rooms, food_veg, food_nonveg,

        food_jain, total_amount, advance_amount, payment_status, payment_txn_id, created_at,coupon_used,Discount, selected_dates

      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        guest_name,
        guest_email,
        guest_phone || null,
        accommodation_id,

        stay.checkIn,
        stay.checkOut,
        adults,
        children,
        rooms,
        food_veg,
        food_nonveg,

        food_jain,
        full_amount || total_amount,
        advance_amount,
        payment_status,
        payment_txn_id,
        new Date(),
        coupon || null,
        discount || null,
        JSON.stringify(stay.dates),
      ]
    );

    const booking_id = result.insertId;

    // Fetch booking details with accommodation

    const [bookingRows] = await connection.execute(
      `

      SELECT b.*, a.name AS accommodation_name, a.address AS accommodation_address,

             a.latitude, a.longitude, a.owner_id, a.type AS accommodation_type

      FROM bookings b

      JOIN accommodations a ON b.accommodation_id = a.id

      WHERE b.id = ?`,
      [booking_id]
    );

    if (!bookingRows || bookingRows.length === 0) {
      await connection.rollback();
      return res
        .status(500)
        .json({
          success: false,
          error: "Failed to retrieve booking details",
        });
    }

    const booking = bookingRows[0];

    // Fetching owner details for a booking
    const [rows] = await connection.execute(
      `SELECT email, phoneNumber, name FROM users WHERE id = ?`,
      [booking.owner_id]
    );
    const user = rows[0] || {};
    const ownerEmail = user.email;
    const ownerName = user.name;
    const ownerNumber = user.phoneNumber;

    // Commit the transaction before sending email
    await connection.commit();

    // Send email after successful commit (outside transaction)
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);

      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    };

    const tariff = computeEmailTariffLines({
      total_amount: booking.total_amount,
      Discount: booking.Discount,
      advance_amount: booking.advance_amount,
    });

    try {
      await sendPdfEmail({
        email: booking.guest_email || "",

        name: booking.guest_name || "",

        BookingId: booking.id || "",

        BookingDate: formatDate(booking.created_at) || "",

        CheckinDate: formatDate(booking.check_in) || "",

        CheckoutDate: formatDate(booking.check_out) || "",

        totalPrice: tariff.netPayableFormatted || "",

        advancePayable: booking.advance_amount || "",

        remainingAmount: tariff.remainingAmount || "",

        mobile: booking.guest_phone || "",

        totalPerson: booking.adults + booking.children || "",

        adult: booking.adults || "",

        child: booking.children || "",

        vegCount: booking.food_veg || "",

        nonvegCount: booking.food_nonveg || "",

        joinCount: booking.food_jain || "",

        accommodationName: booking.accommodation_name || "",

        accommodationAddress: booking.accommodation_address || "",

        latitude: booking.latitude || "",

        longitude: booking.longitude || "",

        ownerEmail: ownerEmail || "",
        ownerName: ownerName || "",
        ownerPhone: ownerNumber || "",

        rooms: booking.rooms || "",
        coupons: coupon || "",
        discount: tariff.discountFormatted,
        full_amount: tariff.fullAmountDisplay,
        accommodation_type: booking.accommodation_type || "resort"
      });
    } catch (emailError) {
      console.error("Email sending failed (booking already saved):", emailError);
      // Don't fail the request if email fails - booking is already saved
    }

    res.json({
      success: true,

      data: {
        booking,

        owner_email: ownerEmail,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Error creating booking:", error);

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,

      error:
        statusCode === 409 || statusCode === 400 || statusCode === 404
          ? error.message
          : "Failed to create booking",

      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    // Check if booking exists
    const [existing] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Delete booking
    await pool.execute('DELETE FROM bookings WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message,
    });
  }
});

router.post("/payments/payu", async (req, res) => {
  try {
    const { amount, firstname, email, phone, booking_id, productinfo, coupon_code } = req.body;

    // --- Validation ---
    if (!amount || !firstname || !email || !booking_id || !productinfo) {
      return res.status(400).json({ success: false, error: "Missing required payment parameters" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }
    const formattedAmount = numericAmount.toFixed(2); // PayU requires "100.00"

    const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Valid 10-digit phone required" });
    }

    // --- Check booking ---
    const [booking] = await pool.execute(
      'SELECT id FROM bookings WHERE id = ? AND payment_status = "pending"',
      [booking_id]
    );
    if (booking.length === 0) {
      return res.status(404).json({ success: false, error: "Pending booking not found" });
    }

    // --- Generate txnid ---
    const txnid = `PAYU-${uuidv4()}`;

    // --- UDF fields (all required in live) ---
    const udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "";
    const udf6 = "", udf7 = "", udf8 = "", udf9 = "", udf10 = "";

    // --- Truncate fields ---
    const truncatedProductinfo = productinfo.substring(0, 100);
    const truncatedFirstname = firstname.substring(0, 60);
    const truncatedEmail = email.substring(0, 50);

    // --- Hash string (include all UDFs) ---
    const hashString =
      `${payu_key}|${txnid}|${formattedAmount}|${truncatedProductinfo}|${truncatedFirstname}|${truncatedEmail}|` +
      `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${payu_salt}`;

    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    console.log("📑 PayU Hash String:", hashString);
    console.log("🔐 Generated Hash:", hash);

    // --- Save txnid ---
    await pool.execute(
      'UPDATE bookings SET payment_txn_id = ?, payment_status = "pending" WHERE id = ?',
      [txnid, booking_id]
    );

    // --- Payment payload ---
    const paymentData = {
      key: payu_key,
      txnid,
      amount: formattedAmount,
      productinfo: truncatedProductinfo,
      firstname: truncatedFirstname,
      email: truncatedEmail,
      phone: cleanPhone.substring(0, 10),
      surl: `https://api.nirwanastays.com/admin/bookings/success/verify/${txnid}`, // ✅ backend route
      furl: `https://api.nirwanastays.com/admin/bookings/failed/verify/${txnid}`,  // ✅ backend route
      hash,
      currency: "INR",
      udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10
    };

    // --- Respond to frontend ---
    res.json({
      success: true,
      message: "Payment initiated",
      payu_url: `${PAYU_BASE_URL}/_payment`, // test: https://test.payu.in/_payment | live: https://secure.payu.in/_payment
      payment_data: paymentData,
    });

  } catch (error) {
    console.error("💥 PayU initiation error:", error);
    res.status(500).json({ success: false, error: "Payment initiation failed" });
  }
});

router.post("/success/verify/:txnid", async (req, res) => {
  console.log("✅ Payment verification callback received");

  const { txnid } = req.params;
  // const responseData = req.body; // PayU posts txn details here
  // console.log("🔍 PayU Callback Data:", responseData);

  try {
    // --- Rebuild Hash from PayU callback ---
    // const {
    //   status, firstname, email, amount, productinfo,
    //   mihpayid, txnid: payuTxnId,
    //   hash: payuHash,
    //   udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10
    // } = responseData;

    // const hashSequence =
    //   `${payu_salt}|${status}||||||${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${payuTxnId}|${payu_key}`;

    // const calcHash = crypto.createHash("sha512").update(hashSequence).digest("hex");

    // console.log("🔐 PayU Provided Hash:", payuHash);
    // console.log("🔐 Server Calculated Hash:", calcHash);

    // if (calcHash !== payuHash) {
    //   console.error("❌ Hash mismatch – possible tampering!");
    //   return res.redirect(`${FRONTEND_BASE_URL}/payment/failed/${txnid}`);
    // }

    // --- Update DB ---
    const newStatus = "success";
    await pool.execute(
      "UPDATE bookings SET payment_status = ? WHERE payment_txn_id = ?",
      [newStatus, txnid]
    );
    console.log("✅ Booking updated with status:", newStatus);
    const [bookings] = await pool.execute(`
      SELECT guest_email, id, guest_name, guest_phone, rooms, adults, children, 
             food_veg, food_nonveg, food_jain, check_in, check_out, 
             total_amount, advance_amount,coupon_used,Discount, accommodation_id 
      FROM bookings WHERE payment_txn_id = ?`,
      [txnid]
    );
    console.log("📦 Bookings fetched:", bookings);

    if (newStatus === "success" && bookings && bookings.length > 0) {
      const bk = bookings[0];
      console.log("🎟️ Booking details:", bk);

      const tariff = computeEmailTariffLines({
        total_amount: bk.total_amount,
        Discount: bk.Discount,
        advance_amount: bk.advance_amount,
      });
      console.log("💰 Remaining amount:", tariff.remainingAmount);

      const formatDate = (dateValue) => {
        if (!dateValue) return "Invalid date";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) throw new Error("Invalid date");
          return format(date, "dd/MM/yyyy");
        } catch (e) {
          console.error("❌ Invalid date format:", dateValue);
          return "Invalid date";
        }
      };

      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      console.log("📅 Booking date formatted:", formattedDate);

      const recipientEmail = bk.guest_email?.trim();
      console.log("📧 Guest email:", recipientEmail);

      const [accommodations] = await pool.execute(`
        SELECT name, address, latitude, longitude, owner_id, type 
        FROM accommodations WHERE id = ?`,
        [bk.accommodation_id]
      );
      console.log("🏠 Accommodation fetched:", accommodations);

      const acc = accommodations[0] || {};
      console.log("🏡 Selected accommodation:", acc);

      const owner_id = acc.owner_id;
      console.log("👤 Owner ID:", owner_id);

      const [users] = await pool.execute(`SELECT email,name,phoneNumber FROM users WHERE id = ?`, [
        owner_id,
      ]);

      const user = users[0] || {};

      const ownerEmail = user.email;
      const ownerName = user.name;
      const ownerMobile = user.phoneNumber;

      // If you want to enable email sending later, you can log like this:

      console.log("🚀 Attempting to send confirmation email...");
      try {
        await sendPdfEmail({
          email: recipientEmail,
          name: bk.guest_name,
          BookingId: bk.id,
          BookingDate: formattedDate,
          CheckinDate: formatDate(bk.check_in),
          CheckoutDate: formatDate(bk.check_out),
          totalPrice: tariff.netPayableFormatted,
          advancePayable: bk.advance_amount,
          remainingAmount: tariff.remainingAmount,
          mobile: bk.guest_phone,
          totalPerson: bk.adults + bk.children,
          adult: bk.adults,
          child: bk.children,
          vegCount: bk.food_veg,
          nonvegCount: bk.food_nonveg,
          joinCount: bk.food_jain,
          accommodationName: acc.name || "",
          accommodationAddress: acc.address || "",
          latitude: acc.latitude || "",
          longitude: acc.longitude || "",
          ownerEmail: ownerEmail || "",
          ownerName: ownerName || "",
          ownerPhone: ownerMobile || "",
          rooms: bk.rooms || 0,
          coupons: bk.coupon_used || 0,
          full_amount: tariff.fullAmountDisplay,
          discount: tariff.discountFormatted,
          accommodation_type: acc.type || "resort",
        });
        console.log("✅ Confirmation email sent to:", recipientEmail);
        console.log("testing")
      } catch (e) {
        console.error("❌ Email sending failed:", e.message);
      }
    }

    // (Optional) fetch booking + send email logic (your existing code)

    return res.redirect(`${FRONTEND_BASE_URL}/payment/${newStatus}/${txnid}`);

  } catch (error) {
    console.error("💥 Verification error:", error);
    return res.redirect(`${FRONTEND_BASE_URL}/payment/failed/${txnid}`);
  }
});

router.post("/failed/verify/:txnid", async (req, res) => {
  const { txnid } = req.params;
  console.log("❌ Payment failed callback received");
  return res.redirect(`${FRONTEND_BASE_URL}/payment/failed/${txnid}`);
});


router.get("/details/:txnid", async (req, res) => {
  const { txnid } = req.params;

  try {
    await ensureSelectedDatesColumn();
    // Step 1: Fetch booking by txnid

    const [bookings] = await pool.execute(
      `SELECT guest_email, id, guest_name, guest_phone, rooms, adults, children, food_veg, food_nonveg,

              food_jain, check_in, check_out, selected_dates, total_amount, advance_amount, accommodation_id, Discount, coupon_used

       FROM bookings 

       WHERE payment_txn_id = ?`,

      [txnid]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    // Step 2: Fetch accommodation details

    const [accommodations] = await pool.execute(
      `SELECT name, address, latitude, longitude ,owner_id, type FROM accommodations WHERE id = ?`,

      [booking.accommodation_id]
    );

    const accommodation = accommodations[0] || {};

    const owner_id = accommodation.owner_id;

    const [users] = await pool.execute(`SELECT email,name,phoneNumber FROM users WHERE id = ?`, [
      owner_id,
    ]);

    const user = users[0] || {};

    const ownerEmail = user.email;
    const ownerName = user.name;
    const ownerMobile = user.phoneNumber;

    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");

    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based

    const year = today.getFullYear();

    const bookedDate = `${year}-${month}-${day}`;

    // Step 3: Combine and return

    return res.json({
      booking,

      accommodation,

      ownerEmail,
      ownerName,
      ownerMobile,

      bookedDate,
    });
  } catch (err) {
    console.error("Error fetching booking details:", err);

    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/bookings/manualMailer - Manually send email using transaction ID
router.post("/manualMailer", async (req, res) => {

  try {
    const { txn_id } = req.body;

    if (!txn_id) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID (txn_id) is required",
      });
    }

    const mailParams = await getBookingConfirmationMailParams(pool, {
      paymentTxnId: txn_id,
    });

    if (!mailParams) {
      return res.status(404).json({
        success: false,
        error:
          "Booking, accommodation, or owner not found for the provided transaction ID",
      });
    }

    const recipientEmail = mailParams.email?.trim();

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        error: "Guest email not found for this booking",
      });
    }

    console.log("🚀 Attempting to send manual email for transaction:", txn_id);

    try {
      await sendPdfEmail(mailParams);

      console.log("✅ Manual email sent successfully to:", recipientEmail);

      return res.json({
        success: true,
        message: "Email sent successfully",
        data: {
          email: recipientEmail,
          booking_id: mailParams.BookingId,
          transaction_id: txn_id,
        },
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        details:
          process.env.NODE_ENV === "development" ? emailError.message : undefined,
      });
    }
  } catch (error) {
    console.error("❌ Manual mailer error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT /admin/bookings/:id/status - Manually update payment status

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;

    const { payment_status } = req.body;

    if (!payment_status) {
      return res
        .status(400)
        .json({ success: false, error: "Payment status is required" });
    }

    const validStatuses = ["pending", "success", "failed", "expired"];

    if (!validStatuses.includes(payment_status)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid payment status" });
    }

    const [result] = await pool.execute(
      "UPDATE bookings SET payment_status = ? WHERE id = ?",
      [payment_status, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error("Error updating payment status:", error);

    res
      .status(500)
      .json({ success: false, error: "Failed to update payment status" });
  }
});

// GET /admin/bookings/room-occupancy - Get total rooms booked for a specific date

router.get("/room-occupancy", async (req, res) => {
  try {
    const { check_in, id } = req.query;

    // Validate date parameter

    if (!check_in || !/^\d{4}-\d{2}-\d{2}$/.test(check_in)) {
      return res.status(400).json({
        success: false,

        error: "Valid check_in date (YYYY-MM-DD) is required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Accommodation id is required",
      });
    }

    const availability = await getAvailabilityForDates(pool, id, [check_in]);
    const day = availability.dates[0] || {
      booked_rooms: 0,
      available_rooms: 0,
      total_rooms: availability.baseRooms,
    };

    res.json({
      success: true,

      date: check_in,

      // Keep total_rooms as booked count for existing calendar/admin clients
      total_rooms: day.booked_rooms,
      booked_rooms: day.booked_rooms,
      available_rooms: day.available_rooms,
      inventory_rooms: day.total_rooms,
    });
  } catch (error) {
    console.error("Error fetching room occupancy:", error);

    res.status(error.statusCode || 500).json({
      success: false,

      error:
        error.statusCode === 404
          ? error.message
          : "Failed to fetch room occupancy data",

      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /admin/bookings/multi-date-availability
router.get("/multi-date-availability", async (req, res) => {
  try {
    const { dates, id } = req.query;

    if (!dates || !id) {
      return res.status(400).json({
        success: false,
        error: "dates (comma-separated YYYY-MM-DD) and id are required",
      });
    }

    let dateArray = [];
    if (typeof dates === "string") {
      dateArray = dates.split(",").map((value) => value.trim()).filter(Boolean);
    } else if (Array.isArray(dates)) {
      dateArray = dates;
    }

    if (!dateArray.length) {
      return res.status(400).json({
        success: false,
        error: "At least one date is required",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const invalidDates = dateArray.filter((value) => !dateRegex.test(value));
    if (invalidDates.length) {
      return res.status(400).json({
        success: false,
        error: `Invalid date format. Dates must be YYYY-MM-DD. Invalid: ${invalidDates.join(", ")}`,
      });
    }

    const availability = await getAvailabilityForDates(pool, id, dateArray);

    res.json({
      success: true,
      accommodation_id: id,
      base_rooms: availability.baseRooms,
      dates: availability.dates,
      min_available_rooms: availability.minAvailableRooms,
    });
  } catch (error) {
    console.error("Error fetching multi-date availability:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      error:
        error.statusCode === 404
          ? error.message
          : "Failed to fetch multi-date availability data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
