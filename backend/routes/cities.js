const express = require("express");
const router = express.Router();
const pool = require("../dbcon");
const app = express();

// Helper function to create database connection
const createConnection = async () => {
    return await pool.getConnection();
};

// Helper function to close database connection
const closeConnection = async (connection) => {
    if (connection) connection.release();
};

// IMPORTANT: Specific routes MUST come before parameterized routes
// GET /admin/locations/search - Search locations (MUST BE BEFORE /:id)
router.get("/search", async (req, res) => {
    const connection = await createConnection();
    try {
        const { q, country, active } = req.query;

        let query = "SELECT * FROM cities WHERE 1=1";
        const params = [];

        if (q) {
            query += " AND name LIKE ?";
            params.push(`%${q}%`);
        }

        if (country) {
            query += " AND country = ?";
            params.push(country);
        }

        if (active !== undefined) {
            query += " AND active = ?";
            params.push(active === "true" ? 1 : 0);
        }

        query += " ORDER BY name ASC";

        const [rows] = await connection.execute(query, params);

        res.json({
            success: true,
            data: rows,
            message: "Locations fetched successfully",
        });
    } catch (error) {
        console.error("Error searching locations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search locations",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/locations/countries - Get all unique countries (MUST BE BEFORE /:id)
router.get("/countries", async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            "SELECT DISTINCT country FROM cities ORDER BY country ASC",
        );
        console.log("Fetched countries:", rows);

        res.json({
            success: true,
            data: rows.map((row) => row.country),
            message: "Countries fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching countries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch countries",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/locations - Get all locations with consistent response format
router.get("/", async (req, res) => {
    const connection = await createConnection();
    try {
        console.log("🚀 Fetching all locations from database...");
        const [rows] = await connection.execute(
            "SELECT * FROM cities ORDER BY name ASC",
        );
        console.log("📋 Database returned:", rows.length, "locations");
        console.log("📄 Sample data:", rows.slice(0, 2));

        // Return consistent format - always as success wrapper
        res.json({
            success: true,
            data: rows,
            message: "Locations fetched successfully",
        });
    } catch (error) {
        console.error("💥 Error fetching locations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch locations",
            error: error.message,
            data: [],
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/locations/:id - Get a specific location (MUST BE AFTER specific routes)
router.get("/:id", async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;

        // Validate that id is a number
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid location ID",
            });
        }

        const [rows] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [id],
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        res.json({
            success: true,
            data: rows[0],
            message: "Location fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch location",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// POST /admin/locations - Create a new location
router.post("/", async (req, res) => {
    const connection = await createConnection();
    try {
        const { name, country, active = true } = req.body;

        if (!name || !country) {
            return res.status(400).json({
                success: false,
                message: "Name and country are required",
            });
        }

        const [existing] = await connection.execute(
            "SELECT id FROM cities WHERE name = ? AND country = ?",
            [name, country],
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Location already exists in this country",
            });
        }

        const [result] = await connection.execute(
            "INSERT INTO cities (name, country, active) VALUES (?, ?, ?)",
            [name, country, active],
        );

        const [newLocation] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [result.insertId],
        );

        res.status(201).json({
            success: true,
            data: newLocation[0],
            message: "Location created successfully",
        });
    } catch (error) {
        console.error("Error creating location:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create location",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// PUT /admin/locations/:id - Update a location
router.put("/:id", async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        const { name, country, active } = req.body;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid location ID",
            });
        }

        const [existing] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [id],
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        if (!name || !country) {
            return res.status(400).json({
                success: false,
                message: "Name and country are required",
            });
        }

        const [duplicate] = await connection.execute(
            "SELECT id FROM cities WHERE name = ? AND country = ? AND id != ?",
            [name, country, id],
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Location already exists in this country",
            });
        }

        await pool.execute(
            "UPDATE cities SET name = ?, country = ?, active = ? WHERE id = ?",
            [name, country, active, id],
        );

        const [updated] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [id],
        );
        res.json({
            success: true,
            data: updated[0],
            message: "Location updated successfully",
        });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update location",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// PATCH /admin/locations/:id/toggle - Toggle location active status
router.patch("/:id/toggle", async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid location ID",
            });
        }

        const [existing] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [id],
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        const currentStatus = existing[0].active;
        const newStatus = !currentStatus;

        await connection.execute("UPDATE cities SET active = ? WHERE id = ?", [
            newStatus,
            id,
        ]);

        const [updated] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [id],
        );
        res.json({
            success: true,
            data: updated[0],
            message: `Location ${newStatus ? "activated" : "deactivated"} successfully`,
        });
    } catch (error) {
        console.error("Error toggling location status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle location status",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// DELETE /admin/locations/:id - Delete a location
router.delete("/:id", async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid location ID",
            });
        }

        const [existing] = await connection.execute(
            "SELECT * FROM cities WHERE id = ?",
            [id],
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        await connection.execute("DELETE FROM cities WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "Location deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting location:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete location",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;
