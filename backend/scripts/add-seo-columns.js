#!/usr/bin/env node
const pool = require('../dbcon');

async function main() {
  const connection = await pool.getConnection();
  try {
    console.log('Adding SEO columns to accommodations table...');

    const columnsToAdd = [
      { name: 'meta_title', type: 'VARCHAR(255) NULL AFTER name' },
      { name: 'meta_description', type: 'TEXT NULL AFTER description' },
      { name: 'meta_keywords', type: 'TEXT NULL AFTER features' },
      { name: 'schema_markup', type: 'TEXT NULL AFTER images' }
    ];

    for (const col of columnsToAdd) {
      try {
        console.log(`Adding column "${col.name}"...`);
        await connection.query(`ALTER TABLE accommodations ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Column "${col.name}" added successfully.`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column "${col.name}" already exists.`);
        } else {
          throw e;
        }
      }
    }

    console.log('Database schema migration completed successfully!');
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
