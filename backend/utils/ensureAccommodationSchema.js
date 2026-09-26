const pool = require("../dbcon");

let schemaReady = false;
let schemaPromise = null;

async function addColumn(connection, table, column, definition) {
    try {
        await connection.execute(
            `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        );
        console.log(`[db] Added ${table}.${column}`);
    } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") {
            throw error;
        }
    }
}

async function ensureAccommodationSchema(connection = pool) {
    if (schemaReady) return true;
    if (schemaPromise) return schemaPromise;

    schemaPromise = (async () => {
        if (process.env.USE_SQLITE === "1") {
            schemaReady = true;
            return true;
        }

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

        await connection.execute(`
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

        schemaReady = true;
        return true;
    })().catch((error) => {
        schemaPromise = null;
        console.error("[db] Failed to ensure accommodation schema:", error.message);
        throw error;
    });

    return schemaPromise;
}

module.exports = {
    ensureAccommodationSchema,
};
