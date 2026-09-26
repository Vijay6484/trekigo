#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const pool = require('../dbcon');
const { generateUniqueAccommodationSlug } = require('../utils/generateSlug');

async function main() {
  const connection = await pool.getConnection();
  try {
    console.log('Adding slug column to accommodations table...');
    try {
      await connection.query("ALTER TABLE accommodations ADD COLUMN slug VARCHAR(255) NULL AFTER name");
      console.log('Created column "slug".');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column "slug" already exists.');
      } else {
        throw e;
      }
    }

    console.log('Creating unique index on slug column...');
    try {
      await connection.query("CREATE UNIQUE INDEX idx_accommodations_slug ON accommodations (slug)");
      console.log('Created unique index "idx_accommodations_slug".');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('Unique index "idx_accommodations_slug" already exists.');
      } else {
        throw e;
      }
    }

    console.log('Starting slug backfill...');
    const [rows] = await connection.execute(
      "SELECT id, name, slug FROM accommodations WHERE slug IS NULL OR slug = ''"
    );

    console.log(`Found ${rows.length} accommodations needing backfill.`);
    for (const row of rows) {
      const slug = await generateUniqueAccommodationSlug(
        connection,
        row.name,
        row.id
      );
      await connection.execute(
        "UPDATE accommodations SET slug = ? WHERE id = ?",
        [slug, row.id]
      );
      console.log(`-> Backfilled accommodation #${row.id} (${row.name}) -> ${slug}`);
    }

    console.log('Migration and backfill completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    connection.release();
    try {
      await pool.end();
    } catch (e) {}
    process.exit(process.exitCode || 0);
  }
}

main().catch(console.error);
