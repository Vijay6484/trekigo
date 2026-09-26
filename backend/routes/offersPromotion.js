const express = require('express');
const router = express.Router();
const pool = require('../dbcon');

router.get('/', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to offersPromotion",
    });
})

// POST /admin/offers-promotion/save
router.post('/save', async (req, res) => {
    try {
        const { accommodationId, badgeLabel, bannerUrl,badgeColor, ctaLink, ctaText, description, endDate, isActive, sortOrder, startDate, subTitle, title, type, } = req.body;

        if(!accommodationId || !title || !bannerUrl || !subTitle || !description) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const [result] = await pool.execute(
            `INSERT INTO offers_promotional_banners
             (accommodationId, title, subTitle, description, bannerUrl, type, badgeLabel, badgeColor, ctaText, ctaLink, sortOrder,
              startDate, endDate, isActive)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                accommodationId,
                title,
                subTitle || null,
                description || null,
                bannerUrl || null,
                type || null ,
                badgeLabel || null,
                badgeColor || null,
                ctaText || null,
                ctaLink || null,
                sortOrder || null,
                startDate || null,
                endDate || null,
                isActive || 1,
            ],
        );

        res.status(201).json({
            success: true,
            message: "Offer/Promotion created successfully",
            id: result.insertId,
            title: title,
        });
    } catch (error) {
        console.error('Error saving offer/promotion:', error);
        res.status(500).json({ success: false, error: 'Failed to save Offer/Promotion' });
    }
});

// GET /admin/offers-promotion/get-all-offers --Get All Offers and Promotions
router.get('/get-all-offers', async (req, res) => {

    try {
        const {
            type,
            isActive,
            search,
            page = 1,
            limit = 10,
            sort = 'banner.createdAt',
            order = 'DESC'
        } = req.query;

        const pageNum = Math.max(1, parseInt(page)) || 1;
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;
        const offset1 = (pageNum - 1) * limitNum;

        let sqlQuery = `
                            SELECT
                                banner.*,
                                accomm.\`name\`
                            FROM
                                offers_promotional_banners banner
                                INNER JOIN accommodations accomm ON accomm.id = banner.accommodationId
                            `;
        const conditions = [];
        const params = [];

        if(isActive === 0) {
            conditions.push("banner.isActive = 0");
        } else if(isActive === 1) {
            conditions.push("banner.isActive = 1");
        }

        if(type) {
            conditions.push("banner.type = ?");
            params.push(type);
        }

        if (search) {
            conditions.push("(banner.title LIKE ? OR banner.subTitle LIKE ? OR banner.description LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add WHERE clause if conditions exist
        if (conditions.length > 0) {
            sqlQuery += " WHERE " + conditions.join(" AND ");
        }
        const validSortFields = [
            "banner.title",
            "banner.type",
            "banner.badgeLabel",
            "banner.sortOrder",
        ]
        const sortField = validSortFields.includes(sort) ? sort : "banner.createdAt";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Add sorting
        sqlQuery += ` ORDER BY ${sortField} ${sortOrder}`;

        // Add pagination
        sqlQuery += " LIMIT ? OFFSET ?";
        params.push(limitNum, offset1);

        // Execute main query
        const [rows] = await pool.execute(sqlQuery, params);

        // Get Total Count
        let countQuery = `SELECT COUNT(banner.offerId) AS totalCount
                            FROM offers_promotional_banners banner
                                     INNER JOIN accommodations accomm ON accomm.id = banner.accommodationId`
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
            ...(process.env.NODE_ENV === "development" && {
                details: {
                    message: error.message,
                    sqlMessage: error.sqlMessage,
                },
            }),
        });
    }
});

// PUT /admin/offers-promotion/update/:id - Update Offer / Promotion
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const {
            accommodationId,
            badgeLabel,
            bannerUrl,
            badgeColor,
            ctaLink,
            ctaText,
            description,
            endDate,
            isActive,
            sortOrder,
            startDate,
            subTitle,
            title,
            type
        } = req.body;

        if (!accommodationId || !title || !bannerUrl || !subTitle || !description) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // FIXED HERE
        const [existingOffer] = await pool.execute(
            "SELECT * FROM offers_promotional_banners WHERE offerId = ? FOR UPDATE",
            [id]
        );

        if (existingOffer.length === 0) {
            return res.status(404).json({ error: "Offer not found" });
        }

        const current = existingOffer[0];

        const formattedStartDate = startDate
            ? new Date(startDate).toISOString().split("T")[0]
            : current.startDate;

        const formattedEndDate = endDate
            ? new Date(endDate).toISOString().split("T")[0]
            : current.endDate;

        const [result] = await pool.execute(
            `UPDATE offers_promotional_banners SET
                   accommodationId = ?,
                   title = ?,
                   subTitle = ?,
                   description = ?,
                   bannerUrl = ?,
                   type = ?,
                   badgeLabel = ?,
                   badgeColor = ?,
                   ctaText = ?,
                   ctaLink = ?,
                   sortOrder = ?,
                   startDate = ?,
                   endDate = ?,
                   isActive = ?
             WHERE offerId = ?`,
            [
                accommodationId ?? current.accommodationId,
                title ?? current.title,
                subTitle ?? current.subTitle,
                description ?? current.description,
                bannerUrl ?? current.bannerUrl,
                type ?? current.type,
                badgeLabel ?? current.badgeLabel,
                badgeColor ?? current.badgeColor,
                ctaText ?? current.ctaText,
                ctaLink ?? current.ctaLink,
                sortOrder ?? current.sortOrder,
                formattedStartDate ?? current.startDate,
                formattedEndDate ?? current.endDate,
                isActive ?? current.isActive,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No changes made" });
        }

        res.status(200).json({
            success: true,
            id,
            message: "Offer and Promotion updated successfully",
        });

    } catch (error) {
        console.error("Error updating offer/promotion:", error);
        res.status(500).json({ success: false, error: "Failed to update Offer/Promotion" });
    }
});

// DELETE /admin/offers-promotion/delete/:id - Delete Offer / Promotion
router.delete("/delete/:id", async (req, res) => {
    const {id} = req.params;
    // Validate ID is a positive integer
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res
            .status(400)
            .json({ error: "Invalid offer ID format" });
    }

    try {
        // Check offerId exist or not
        const [existingOffer] = await pool.execute(
            "SELECT * FROM offers_promotional_banners WHERE offerId = ? FOR UPDATE",
            [id]
        );

        if (existingOffer.length === 0) {
            return res.status(404).json({ error: "Offer not found" });
        }

        const [result] = await pool.execute(
            "DELETE FROM offers_promotional_banners WHERE offerId = ?",
            [id],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No accommodation deleted" });
        }

        res.json({
            success: true,
            message: "Offer/Promotion data deleted successfully",
            deletedId: id,
        });

    } catch(error) {
        console.error("Error deleting offer/promotion:", error);
        res.status(500).json({ success: false, error: "Failed to delete Offer/Promotion" });
    }
});

// GET /admin/offers-promotion/get-active-offers - Get active Offers and Promotions
router.get("/get-active-offers", async (req, res) => {
    try {
        const sqlQuery = `
            SELECT 
                *
            FROM
                offers_promotional_banners
            WHERE 
                isActive = 1
                AND (startDate IS NULL OR CURDATE() >= DATE(startDate))
                AND (endDate IS NULL OR CURDATE() <= DATE(endDate))
            ORDER BY
                sortOrder ASC
        `

        const [rows] = await pool.execute(sqlQuery);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error("Error getting Hero Section banner:", error);
        res.status(500).json({ success: false, error: "Failed to get active Hero Section banner" });
    }
})

module.exports = router;