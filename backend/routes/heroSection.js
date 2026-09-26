const express = require('express');
const router = express.Router();
const pool = require('../dbcon');

// POST //admin/hero-section/save
router.post('/save', async (req, res) => {
    try {
        const { accommodationId, title, price, location, imgUrl, isActive, startDate, endDate } = req.body;

        if(!accommodationId || !title || !price || !location || !imgUrl) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Insert Data into table hero_section
        const [result] = await pool.execute(
            `INSERT INTO hero_section
             (accommodationId, title, price, location, imgUrl, isActive, startDate, endDate)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                accommodationId,
                title,
                price || null,
                location || null,
                imgUrl || null,
                isActive || 1,
                startDate || null,
                endDate || null,
            ],
        );

        res.status(201).json({
            success: true,
            message: "Hero section banner created successfully",
            id: result.insertId,
            title: title,
        });
    } catch (error) {
        console.error('Error saving hero section banner:', error);
        res.status(500).json({ success: false, error: 'Failed to save Hero section banner' });
    }
})

// GET /admin/hero-section/get-all-banners-info --Get All Hero section banners
router.get('/get-all-banners-info', async (req, res) => {

    try {
        const {
            isActive,
            search,
            page = 1,
            limit = 10,
            sort = 'hero.createdAt',
            order = 'DESC'
        } = req.query;

        const pageNum = Math.max(1, parseInt(page)) || 1;
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;
        const offset1 = (pageNum - 1) * limitNum;

        let sqlQuery = `
            SELECT 
                hero.*,
                accomm.\`name\`
            FROM 
                hero_section hero
                INNER JOIN accommodations accomm ON accomm.id = hero.accommodationId
                            `;
        const conditions = [];
        const params = [];

        if(isActive === 0) {
            conditions.push("hero.isActive = 0");
        } else if(isActive === 1) {
            conditions.push("hero.isActive = 1");
        }

        if (search) {
            conditions.push("(hero.title LIKE ? OR hero.location LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add WHERE clause if conditions exist
        if (conditions.length > 0) {
            sqlQuery += " WHERE " + conditions.join(" AND ");
        }
        const validSortFields = [
            "hero.title",
            "hero.price",
            "hero.location",
        ]
        const sortField = validSortFields.includes(sort) ? sort : "hero.createdAt";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Add sorting
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        // Add pagination
        sqlQuery += " LIMIT ? OFFSET ?";
        params.push(limitNum, offset1);

        // Execute main query
        const [rows] = await pool.execute(sqlQuery, params);

        // Get Total Count
        let countQuery = `SELECT 
                                    COUNT(hero.heroId) AS totalCount
                                FROM 
                                    hero_section hero
                                    INNER JOIN accommodations accomm ON accomm.id = hero.accommodationId`
        if (conditions.length > 0) {
            countQuery += " WHERE " + conditions.join(" AND ");
        }

        const [countRows] = await pool.execute(
            countQuery,
            params.slice(0, -2),
        );

        const total = countRows[0].totalCount;
        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: rows,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                perPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        });

    } catch(error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch Offers and Promotion",
        });
    }
});

// PUT /admin/hero-section/update/:id - Update Hero Section banner
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const {
            accommodationId,
            title,
            price,
            location,
            imgUrl,
            isActive,
            startDate,
            endDate
        } = req.body;

        if(!accommodationId || !title || !price || !location || !imgUrl) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // FIXED HERE
        const [existingBanner] = await pool.execute(
            "SELECT * FROM hero_section WHERE heroId = ? FOR UPDATE",
            [id]
        );

        if (existingBanner.length === 0) {
            return res.status(404).json({ error: "Offer not found" });
        }

        const current = existingBanner[0];

        const formattedStartDate = startDate
            ? new Date(startDate).toISOString().split("T")[0]
            : current.startDate;

        const formattedEndDate = endDate
            ? new Date(endDate).toISOString().split("T")[0]
            : current.endDate;

        const [result] = await pool.execute(
            `UPDATE hero_section SET
                   accommodationId = ?,
                   title = ?,
                   price = ?,
                   location = ?,
                   imgUrl = ?,
                   isActive = ?,                   
                   startDate = ?,
                   endDate = ?
             WHERE heroId = ?`,
            [
                accommodationId ?? current.accommodationId,
                title ?? current.title,
                price ?? current.price,
                location ?? current.location,
                imgUrl ?? current.imgUrl,
                isActive ?? current.isActive,
                formattedStartDate ?? current.startDate,
                formattedEndDate ?? current.endDate,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No changes made" });
        }

        res.status(200).json({
            success: true,
            id,
            message: "Hero Section banner updated successfully",
        });

    } catch (error) {
        console.error("Error updating Hero Section banner:", error);
        res.status(500).json({ success: false, error: "Failed to update Hero Section banner" });
    }
});

// DELETE /admin/hero-section/delete/:id - Delete Hero section banner
router.delete("/delete/:id", async (req, res) => {
    const {id} = req.params;
    // Validate ID is a positive integer
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res
            .status(400)
            .json({ error: "Invalid hero ID format" });
    }

    try {
        // Check heroId exist or not
        const [existingHero] = await pool.execute(
            "SELECT * FROM hero_section WHERE heroId = ? FOR UPDATE",
            [id]
        );

        if (existingHero.length === 0) {
            return res.status(404).json({ error: "Hero Id not found" });
        }

        const [result] = await pool.execute(
            "DELETE FROM hero_section WHERE heroId = ?",
            [id],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No accommodation deleted" });
        }

        res.json({
            success: true,
            message: "Hero Section banner data deleted successfully",
            deletedId: id,
        });

    } catch(error) {
        console.error("Error deleting Hero Section banner:", error);
        res.status(500).json({ success: false, error: "Failed to delete Hero Section banner" });
    }
});

// GET /admin/hero-section/get-active-hero-banners - Get active Hero Section banner
router.get("/get-active-hero-banners", async (req, res) => {
    try {
        const sqlQuery = `
            SELECT 
                *
            FROM 
                hero_section
            WHERE 
                isActive = 1
                AND (
                        (startDate IS NULL AND endDate IS NULL)
                        OR
                        (startDate IS NOT NULL AND endDate IS NOT NULL AND CURDATE() BETWEEN startDate AND endDate)
                    )
            ORDER BY 
                heroId ASC
        `

        const [rows] = await pool.execute(sqlQuery);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error("Error getting Hero Section banner:", error);
        res.status(500).json({ success: false, error: "Failed to get active Hero Section banner" });
    }
})

module.exports = router;