#!/usr/bin/env node
const pool = require("../dbcon");

async function addColumn(connection, table, column, definition) {
    try {
        await connection.query(
            `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        );
        console.log(`Created column "${column}" on ${table}.`);
    } catch (e) {
        if (e.code === "ER_DUP_FIELDNAME") {
            console.log(`Column "${column}" already exists on ${table}.`);
        } else {
            throw e;
        }
    }
}

async function main() {
    const connection = await pool.getConnection();
    try {
        console.log("Adding weekend pricing columns...");
        await addColumn(
            connection,
            "accommodations",
            "weekend_price",
            "DECIMAL(10,2) NULL AFTER price",
        );
        await addColumn(
            connection,
            "accommodations",
            "weekend_adult_price",
            "DECIMAL(10,2) NULL AFTER adult_price",
        );
        await addColumn(
            connection,
            "accommodations",
            "weekend_child_price",
            "DECIMAL(10,2) NULL AFTER child_price",
        );

        console.log("Creating accommodation_stories table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS accommodation_stories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                accommodation_id INT NOT NULL,
                media_url VARCHAR(500) NOT NULL,
                media_type ENUM('image', 'gif', 'video') NOT NULL DEFAULT 'video',
                thumbnail_url VARCHAR(500) NULL,
                title VARCHAR(255) NULL,
                position INT NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_accommodation_stories_accommodation (accommodation_id),
                INDEX idx_accommodation_stories_position (accommodation_id, position)
            )
        `);
        console.log("accommodation_stories table ready.");

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
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
