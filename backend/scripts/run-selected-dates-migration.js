#!/usr/bin/env node
const {
  ensureSelectedDatesColumn,
} = require("../utils/bookingInventory");
const pool = require("../dbcon");

async function main() {
  try {
    const exists = await ensureSelectedDatesColumn(pool);
    console.log(
      exists
        ? "bookings.selected_dates is ready."
        : "Could not add bookings.selected_dates. Check DB permissions."
    );
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch {
      // ignore
    }
    process.exit(process.exitCode || 0);
  }
}

main();
