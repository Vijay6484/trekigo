#!/usr/bin/env node
/**
 * Writes the booking confirmation HTML to a local file using the same DB → template
 * pipeline as POST /admin/bookings/manualMailer (real booking row + accommodation + owner).
 *
 * Requires DB credentials in .env (same as the API).
 *
 * Usage:
 *   node scripts/preview-booking-email.js --booking-id 123
 *   node scripts/preview-booking-email.js --txn <payment_txn_id>
 *
 * By default the HTML matches the PayU success confirmation email (`payuSuccess` payload).
 * Use `--manual-mailer` to match POST /admin/bookings/manualMailer instead (booking date from DB created_at).
 *   npm run email:preview-booking -- --booking-id 123
 *
 * Optional:
 *   --out ./preview.html   (default: preview/booking-confirmation-preview.html)
 */

"use strict";

const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = require("../dbcon");
const {
  getBookingConfirmationMailParams,
} = require("../services/bookingConfirmationPayload");
const {
  buildBookingConfirmationBodies,
} = require("../services/sendBookingConfirmationEmail");

function parseArgs(argv) {
  const args = argv.slice(2);
  let outPath = path.join(
    __dirname,
    "..",
    "preview",
    "booking-confirmation-preview.html"
  );
  let bookingId = null;
  let paymentTxnId = null;
  let variant = "payuSuccess";

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--out" && args[i + 1]) {
      outPath = path.resolve(process.cwd(), args[++i]);
    } else if (a === "--booking-id" && args[i + 1]) {
      bookingId = args[++i];
    } else if (a === "--txn" && args[i + 1]) {
      paymentTxnId = args[++i];
    } else if (a === "--manual-mailer") {
      variant = "manualMailer";
    }
  }

  return { outPath, bookingId, paymentTxnId, variant };
}

async function main() {
  const { outPath, bookingId, paymentTxnId, variant } = parseArgs(process.argv);

  const params = await getBookingConfirmationMailParams(pool, {
    bookingId,
    paymentTxnId,
    variant,
  });

  if (!params) {
    console.error(
      "Could not load booking (missing row, accommodation, or owner), or invalid args.\n" +
        "Provide exactly one of:\n" +
        "  --booking-id <id>\n" +
        "  --txn <payment_txn_id>"
    );
    process.exitCode = 1;
    return;
  }

  const { html, html_villa } = buildBookingConfirmationBodies(params);
  const body =
    String(params.accommodation_type || "").toLowerCase() === "villa"
      ? html_villa
      : html;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, body, "utf8");

  console.log("Booking ID:", params.BookingId);
  console.log("Payload variant:", variant);
  console.log(
    "Template:",
    String(params.accommodation_type || "").toLowerCase() === "villa"
      ? "Villa"
      : "Resort"
  );
  console.log("Wrote:", outPath);
  console.log("Open that file in a browser — same HTML as the confirmation email body.");

  try {
    await pool.end();
  } catch (_) {
    /* ignore */
  }
  process.exit(process.exitCode || 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
