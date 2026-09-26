const express = require("express");
const routes = express.Router();
const pool = require("../dbcon");
const app = express();
const {
    generateUniqueAccommodationSlug,
} = require("../utils/generateSlug");
const {
    ensureAccommodationSchema,
} = require("../utils/ensureAccommodationSchema");

// Helper function to create database connection
const createConnection = async () => {
    return await pool.getConnection();
};

// Helper function to close database connection
const closeConnection = async (connection) => {
    if (connection) connection.release();
};

app.use(express.json());

function resolveRoomGuestCap(row) {
    const capacity = Number(row?.capacity) || 0;
    if (capacity > 0) return capacity;
    return Number(row?.max_guests) || 2;
}

// GET /admin/properties/accommodations - Fetch all accommodations
routes.get("/accommodations", async (req, res) => {
    const connection = await createConnection();

    try {
        // Validate and parse query parameters
        const {
            type,
            min_capacity,
            max_capacity,
            is_available,
            min_price,
            max_price,
            search,
            amenities,
            page = 1,
            limit = 500,
            sort = "created_at",
            order = "DESC",
        } = req.query;

        // Validate numeric parameters
        const pageNum = Math.max(1, parseInt(page)) || 1;
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))) || 10;
        const offset = (pageNum - 1) * limitNum;

        // Base query selecting only from accommodations table
        let query = `
            SELECT 
                id,
                slug,
                name,
                meta_title,
                meta_description,
                meta_keywords,
                schema_markup,
                canonical_url,
                breadcrumbs,
                type,
                description,
                price,
                capacity,
                rooms,
                available,
                features,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(ai.imgUrl ORDER BY ai.imgPosition ASC, ai.imageId ASC)
                        FROM accommodation_images ai
                        WHERE ai.accommodationId = accommodations.id AND ai.isDeleted = 0
                    ),
                    JSON_ARRAY()
                ) AS images,
                amenity_ids,
                owner_id,
                city_id,
                address,
                latitude,
                longitude,
                package_name,
                package_description,
                package_images,
                adult_price,
                child_price,
                max_guests,
                MaxPersonVilla,
                RatePersonVilla,
                created_at,
                updated_at
            FROM accommodations
        `;

        const conditions = [];
        const params = [];

        // Add filters (all from accommodations table)
        if (type) {
            conditions.push("type = ?");
            params.push(type);
        }

        if (min_capacity) {
            conditions.push("capacity >= ?");
            params.push(min_capacity);
        }

        if (max_capacity) {
            conditions.push("capacity <= ?");
            params.push(max_capacity);
        }

        if (is_available === "true") {
            conditions.push("available = TRUE");
        } else if (is_available === "false") {
            conditions.push("available = FALSE");
        }

        if (min_price) {
            conditions.push("price >= ?");
            params.push(min_price);
        }

        if (max_price) {
            conditions.push("price <= ?");
            params.push(max_price);
        }

        if (search) {
            conditions.push("(name LIKE ? OR description LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        if (amenities) {
            const amenityIds = amenities
                .split(",")
                .map((id) => parseInt(id.trim()));
            conditions.push(`JSON_OVERLAPS(amenity_ids, ?)`);
            params.push(JSON.stringify(amenityIds));
        }

        // Add WHERE clause if conditions exist
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // Validate sort field against actual table columns
        const validSortFields = [
            "id",
            "name",
            "type",
            "price",
            "capacity",
            "rooms",
            "available",
            "created_at",
            "updated_at",
        ];
        const sortField = validSortFields.includes(sort) ? sort : "created_at";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Add sorting
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        // Add pagination
        query += " LIMIT ? OFFSET ?";
        params.push(limitNum, offset);

        // Execute main query
        const [rows] = await connection.execute(query, params);

        // Get total count (using same conditions)
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM accommodations
            ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}
        `;
        const [countRows] = await connection.execute(
            countQuery,
            params.slice(0, -2),
        );
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limitNum);

        // Process JSON fields
        const processJsonField = (field, defaultValue) => {
            try {
                return field ? JSON.parse(field) : defaultValue;
            } catch (e) {
                console.error("JSON parse error:", e.message);
                return defaultValue;
            }
        };

        // Format response (all fields from accommodations table)
        const formattedRows = rows.map((row) => ({
            id: row.id,
            slug: row.slug || null,
            name: row.name,
            metaTitle: row.meta_title || null,
            metaDescription: row.meta_description || null,
            metaKeywords: row.meta_keywords || null,
            schemaMarkup: row.schema_markup || null,
            canonicalUrl: row.canonical_url || null,
            breadcrumbs: processJsonField(row.breadcrumbs, row.breadcrumbs || null),
            type: row.type,
            description: row.description,
            price: row.price,
            capacity: row.capacity,
            rooms: row.rooms,
            available: Boolean(row.available),
            features: processJsonField(row.features, []),
            images: processJsonField(row.images, []),
            amenities: processJsonField(row.amenity_ids, []),
            maxPerson: row.MaxPersonVilla || null,
            ratePerPerson: row.RatePersonVilla || null,
            location: {
                address: row.address,
                coordinates: {
                    latitude: row.latitude,
                    longitude: row.longitude,
                },
            },
            ownerId: row.owner_id,
            cityId: row.city_id,
            package: {
                name: row.package_name,
                description: row.package_description,
                images: processJsonField(row.package_images, []),
                pricing: {
                    adult: row.adult_price,
                    child: row.child_price,
                    maxGuests: resolveRoomGuestCap(row),
                },
            },
            timestamps: {
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            },
        }));

        res.json({
            data: formattedRows,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                perPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to fetch accommodations",
            ...(process.env.NODE_ENV === "development" && {
                details: {
                    message: error.message,
                    sqlMessage: error.sqlMessage,
                },
            }),
        });
    } finally {
        await closeConnection(connection);
    }
});
// GET /admin/properties/accommodations/:id - Fetch single accommodation by id or slug
routes.get("/accommodations/:id", async (req, res) => {
    const { id } = req.params;
    const isNumericId = /^\d+$/.test(id);
    console.log(
        isNumericId
            ? `Fetching accommodation with ID: ${id}`
            : `Fetching accommodation with slug: ${id}`,
    );

    const connection = await createConnection();

    try {
        const whereClause = isNumericId ? "a.id = ?" : "a.slug = ?";
        const [rows] = await connection.execute(
            `SELECT 
                a.*,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(ai.imgUrl ORDER BY ai.imgPosition ASC, ai.imageId ASC)
                        FROM accommodation_images ai
                        WHERE ai.accommodationId = a.id AND ai.isDeleted = 0
                    ),
                    JSON_ARRAY()
                ) AS gallery_images,
                u.name as owner_name,
                c.name as city_name,
                c.country as country
            FROM accommodations a
            LEFT JOIN users u ON a.owner_id = u.id
            LEFT JOIN cities c ON a.city_id = c.id
            WHERE ${whereClause}`,
            [id],
        );
        // console.log('Getting Rows Info: ', rows);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Accommodation not found" });
        }

        const accommodation = rows[0];

        // Helper function to safely parse JSON fields
        const parseJSONField = (field, defaultValue) => {
            try {
                if (field === null || field === undefined) return defaultValue;
                if (typeof field === "object") return field;
                return JSON.parse(field);
            } catch (e) {
                console.warn(`Failed to parse JSON field ${field}:`, e.message);
                return defaultValue;
            }
        };

        // Determine availability - you might need to adjust this logic based on your actual business rules
        const isAvailable = true; // Replace with your actual availability logic

        const galleryImgs = parseJSONField(accommodation.gallery_images, []);
        const staticImgs = parseJSONField(accommodation.images, []);
        const propertyImages = galleryImgs.length > 0 ? galleryImgs : staticImgs;

        // Transform database fields to frontend structure
        const response = {
            id: accommodation.id,
            slug: accommodation.slug || null,
            basicInfo: {
                name: accommodation.name || "",
                description: accommodation.description || "",
                type: accommodation.type || "",
                capacity: accommodation.capacity || 2,
                MaxPersonVilla: accommodation.MaxPersonVilla ?? null,
                RatePersonVilla: accommodation.RatePersonVilla ?? null,
                rooms: accommodation.rooms || 1,
                price: accommodation.price || 0,
                weekendPrice: accommodation.weekend_price ?? null,
                available: isAvailable, // Using the availability flag
                features: parseJSONField(accommodation.features, []),
                images: propertyImages,
                metaTitle: accommodation.meta_title || null,
                metaDescription: accommodation.meta_description || null,
                metaKeywords: accommodation.meta_keywords || null,
                schemaMarkup: accommodation.schema_markup || null,
                canonicalUrl: accommodation.canonical_url || null,
                breadcrumbs: parseJSONField(accommodation.breadcrumbs, accommodation.breadcrumbs || null),
            },
            location: {
                owner: {
                    id: accommodation.owner_id,
                    name: accommodation.owner_name,
                },
                city: {
                    id: accommodation.city_id,
                    name: accommodation.city_name,
                    country: accommodation.country,
                },
                address: accommodation.address || "",
                coordinates: {
                    latitude: accommodation.latitude,
                    longitude: accommodation.longitude,
                },
            },
            amenities: {
                ids: parseJSONField(accommodation.amenity_ids, []),
                // You could add full amenity objects here if needed
            },
            packages: {
                name: accommodation.package_name || "",
                description: accommodation.package_description || "",
                images: parseJSONField(accommodation.package_images, []),
                pricing: {
                    adult: accommodation.adult_price || 0,
                    child: accommodation.child_price || 0,
                    weekendAdult: accommodation.weekend_adult_price ?? null,
                    weekendChild: accommodation.weekend_child_price ?? null,
                    maxGuests: resolveRoomGuestCap(accommodation),
                },
            },
            metadata: {
                createdAt: accommodation.created_at,
                updatedAt: accommodation.updated_at,
            },
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching accommodation:", error);
        // console.log(error.message);
        // Handle specific SQL errors
        if (
            error.code === "ER_PARSE_ERROR" ||
            error.code === "ER_BAD_FIELD_ERROR"
        ) {
            return res.status(500).json({
                error: "Database query error",
                details:
                    process.env.NODE_ENV === "development"
                        ? {
                              message: error.message,
                              sql: error.sql,
                              code: error.code,
                          }
                        : undefined,
            });
        }

        res.status(500).json({
            error: "Failed to fetch accommodation",
            ...(process.env.NODE_ENV === "development" && {
                details: {
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                },
            }),
        });
    } finally {
        await closeConnection(connection);
    }
});

// POST /admin/properties/accommodations - Create new accommodation
routes.post("/accommodations", async (req, res) => {
    try {
        // Destructure nested structure from frontend
        const { basicInfo, location, amenities, ownerId, packages } = req.body;

        // Validate required fields
        if (
            !basicInfo ||
            !basicInfo.name ||
            !basicInfo.type ||
            !basicInfo.capacity ||
            !basicInfo.rooms ||
            !basicInfo.price
        ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const connection = await createConnection();

        // Extract values from nested structure
        const {
            name,
            description,
            type,
            capacity,
            rooms,
            price,
            features = [],
            images = [],
            available = true,
            MaxPersonVilla,
            RatePersonVilla,
            metaTitle = null,
            metaDescription = null,
            metaKeywords = null,
            schemaMarkup = null,
            canonicalUrl = null,
            breadcrumbs = null,
        } = basicInfo;

        const rawCanonicalUrl = canonicalUrl || req.body.canonicalUrl || null;
        const rawBreadcrumbs = breadcrumbs || req.body.breadcrumbs || null;
        const formattedBreadcrumbs = rawBreadcrumbs ? (typeof rawBreadcrumbs === "string" ? rawBreadcrumbs : JSON.stringify(rawBreadcrumbs)) : null;

        const address = location?.address || null;
        const cityId = location?.cityId || null;
        const latitude = location?.coordinates?.latitude || null;
        const longitude = location?.coordinates?.longitude || null;
        const amenityIds = amenities?.ids || [];

        const packageName = packages?.name || null;
        const packageDescription = packages?.description || null;
        const packageImages = packages?.images || [];
        const adultPrice = packages?.pricing?.adult || 0;
        const childPrice = packages?.pricing?.child || 0;
        const weekendPrice = basicInfo?.weekendPrice ?? packages?.pricing?.weekendPrice ?? null;
        const weekendAdultPrice = packages?.pricing?.weekendAdult ?? null;
        const weekendChildPrice = packages?.pricing?.weekendChild ?? null;
        const maxGuests = capacity || packages?.pricing?.maxGuests || 2;

        const slug = await generateUniqueAccommodationSlug(connection, name);

        // Insert into database
        const [result] = await connection.execute(
            `INSERT INTO accommodations 
            (name, slug, meta_title, meta_description, meta_keywords, schema_markup, canonical_url, breadcrumbs, description, type, capacity, rooms, price, weekend_price, features, images, available, owner_id, city_id, 
             address, latitude, longitude, amenity_ids, package_name, package_description, package_images,
             adult_price, child_price, weekend_adult_price, weekend_child_price, max_guests, MaxPersonVilla, RatePersonVilla) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                slug,
                metaTitle,
                metaDescription,
                metaKeywords,
                schemaMarkup,
                rawCanonicalUrl,
                formattedBreadcrumbs,
                description || null,
                type,
                capacity,
                rooms,
                price,
                weekendPrice,
                JSON.stringify(features),
                JSON.stringify(images),
                available,
                ownerId || null,
                cityId || null,
                address,
                latitude,
                longitude,
                JSON.stringify(amenityIds),
                packageName,
                packageDescription,
                JSON.stringify(packageImages),
                adultPrice,
                childPrice,
                weekendAdultPrice,
                weekendChildPrice,
                maxGuests,
                MaxPersonVilla || null,
                RatePersonVilla || null,
            ],
        );
        const accommodationId = result.insertId;

        // If there are images, also insert them into the accommodation_images table
        if (Array.isArray(images) && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const imgUrl = images[i];
                await connection.execute(
                    `INSERT INTO accommodation_images 
                    (accommodationId, imgUrl, accommCategory, imgTitle, imgAltText, imgDescription, imgPosition) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        accommodationId,
                        imgUrl,
                        "Accommodation", // Default category
                        `${name} - Image ${i + 1}`, // Default title
                        name, // Default alt text
                        null, // Default description
                        i + 1, // Position
                    ],
                );
            }
        }

        await closeConnection(connection);

        res.status(201).json({
            message: "Accommodation created successfully",
            id: accommodationId,
            slug,
            name: name,
        });
    } catch (error) {
        console.error("Error creating accommodation:", error);
        res.status(500).json({
            error: "Failed to create accommodation",
            details: process.env.NODE_ENV === "development" ? error : undefined,
        });
    } finally {
        await closeConnection(connection);
    }
});

function toSqlValue(value) {
    return value === undefined ? null : value;
}

// PUT /admin/properties/accommodations/:id - Update accommodation
routes.put("/accommodations/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Updating accommodation with ID:", id);
    let connection;

    try {
        await ensureAccommodationSchema();
        connection = await createConnection();
        await connection.beginTransaction();

        try {
            // Check if accommodation exists
            const [existing] = await connection.execute(
                "SELECT * FROM accommodations WHERE id = ? FOR UPDATE",
                [id],
            );

            if (existing.length === 0) {
                await connection.rollback();
                return res
                    .status(404)
                    .json({ error: "Accommodation not found" });
            }

            const current = existing[0];
            const requestBody = req.body;
            // console.log(requestBody);
            // Input validation function
            const validateInput = (field, type, required = false) => {
                if (required && field === undefined) {
                    throw new Error(`Missing required field`);
                }

                switch (type) {
                    case "number":
                        if (field !== undefined && isNaN(Number(field))) {
                            throw new Error(`Invalid number value`);
                        }
                        return field !== undefined ? Number(field) : field;
                    case "array":
                        if (field && !Array.isArray(field)) {
                            try {
                                return JSON.parse(field);
                            } catch (e) {
                                throw new Error(`Invalid array format`);
                            }
                        }
                        return field;
                    case "boolean":
                        return Boolean(field);
                    default:
                        return field;
                }
            };

            // Extract values from nested structure
            const basicInfo = requestBody.basicInfo || {};
            const location = requestBody.location || {};
            const amenities = requestBody.amenities || {};
            const packages = requestBody.packages || {};

            // Prepare update data with validation
            const updateData = {
                name: validateInput(
                    basicInfo.name ?? current.name,
                    "string",
                    true,
                ),
                meta_title: validateInput(
                    basicInfo.metaTitle ?? current.meta_title,
                    "string",
                ),
                meta_description: validateInput(
                    basicInfo.metaDescription ?? current.meta_description,
                    "string",
                ),
                meta_keywords: validateInput(
                    basicInfo.metaKeywords ?? current.meta_keywords,
                    "string",
                ),
                schema_markup: validateInput(
                    basicInfo.schemaMarkup ?? current.schema_markup,
                    "string",
                ),
                canonical_url: validateInput(
                    basicInfo.canonicalUrl ?? req.body.canonicalUrl ?? current.canonical_url,
                    "string",
                ),
                breadcrumbs: (() => {
                    const raw = basicInfo.breadcrumbs ?? req.body.breadcrumbs ?? current.breadcrumbs;
                    if (!raw) return null;
                    return typeof raw === "string" ? raw : JSON.stringify(raw);
                })(),
                description: validateInput(
                    basicInfo.description ?? current.description,
                    "string",
                    true,
                ),
                type: validateInput(
                    basicInfo.type ?? current.type,
                    "string",
                    true,
                ),
                capacity: validateInput(
                    basicInfo.capacity ?? current.capacity,
                    "number",
                    true,
                ),
                rooms: validateInput(
                    basicInfo.rooms ?? current.rooms,
                    "number",
                    true,
                ),
                price: validateInput(
                    basicInfo.price ?? current.price,
                    "number",
                    true,
                ),
                weekend_price: validateInput(
                    basicInfo.weekendPrice ??
                        packages.pricing?.weekendPrice ??
                        current.weekend_price,
                    "number",
                ),
                features: JSON.stringify(
                    validateInput(
                        basicInfo.features ?? current.features,
                        "array",
                    ),
                ),
                images: JSON.stringify(
                    validateInput(basicInfo.images ?? current.images, "array"),
                ),
                available: validateInput(
                    basicInfo.available ?? current.available,
                    "boolean",
                ),
                owner_id: validateInput(
                    requestBody.ownerId ?? current.owner_id,
                    "number",
                ),
                city_id: validateInput(
                    location.cityId ?? current.city_id,
                    "number",
                ),
                address: validateInput(
                    location.address ?? current.address,
                    "string",
                ),
                latitude: validateInput(
                    location.coordinates?.latitude ?? current.latitude,
                    "number",
                ),
                longitude: validateInput(
                    location.coordinates?.longitude ?? current.longitude,
                    "number",
                ),
                amenity_ids: JSON.stringify(
                    validateInput(
                        amenities.ids ?? current.amenity_ids,
                        "array",
                    ),
                ),
                package_name: validateInput(
                    packages.name ?? current.package_name,
                    "string",
                ),
                package_description: validateInput(
                    packages.description ?? current.package_description,
                    "string",
                ),
                package_images: JSON.stringify(
                    validateInput(
                        packages.images ?? current.package_images,
                        "array",
                    ),
                ),
                adult_price: validateInput(
                    packages.pricing?.adult ?? current.adult_price,
                    "number",
                ),
                child_price: validateInput(
                    packages.pricing?.child ?? current.child_price,
                    "number",
                ),
                weekend_adult_price: validateInput(
                    packages.pricing?.weekendAdult ??
                        current.weekend_adult_price,
                    "number",
                ),
                weekend_child_price: validateInput(
                    packages.pricing?.weekendChild ??
                        current.weekend_child_price,
                    "number",
                ),
                max_guests: validateInput(
                    basicInfo.capacity ??
                        packages.pricing?.maxGuests ??
                        current.max_guests,
                    "number",
                ),
                MaxPersonVilla: validateInput(
                    basicInfo.MaxPersonVilla ?? current.MaxPersonVilla,
                    "number",
                ),
                RatePersonVilla: validateInput(
                    basicInfo.RatePersonVilla ?? current.RatePersonVilla,
                    "number",
                ),
            };

            // Additional validation
            if (
                updateData.capacity <= 0 ||
                updateData.rooms <= 0 ||
                updateData.price <= 0
            ) {
                throw new Error(
                    "Capacity, rooms, and price must be positive numbers",
                );
            }

            const slug =
                updateData.name !== current.name || !current.slug
                    ? await generateUniqueAccommodationSlug(
                          connection,
                          updateData.name,
                          Number(id),
                      )
                    : current.slug;

            // Execute update
            const [result] = await connection.execute(
                `UPDATE accommodations SET
                    name = ?,
                    slug = ?,
                    meta_title = ?,
                    meta_description = ?,
                    meta_keywords = ?,
                    schema_markup = ?,
                    canonical_url = ?,
                    breadcrumbs = ?,
                    description = ?, 
                    type = ?, 
                    capacity = ?, 
                    rooms = ?,
                    price = ?,
                    weekend_price = ?,
                    features = ?,
                    images = ?, 
                    available = ?, 
                    owner_id = ?,
                    city_id = ?, 
                    address = ?, 
                    latitude = ?, 
                    longitude = ?, 
                    amenity_ids = ?,
                    package_name = ?, 
                    package_description = ?, 
                    package_images = ?,
                    adult_price = ?, 
                    child_price = ?, 
                    weekend_adult_price = ?,
                    weekend_child_price = ?,
                    max_guests = ?,
                    MaxPersonVilla = ?,
                    RatePersonVilla = ?,
                    updated_at = CURRENT_TIMESTAMP()
                WHERE id = ?`,
                [
                    updateData.name,
                    slug,
                    updateData.meta_title,
                    updateData.meta_description,
                    updateData.meta_keywords,
                    updateData.schema_markup,
                    updateData.canonical_url,
                    updateData.breadcrumbs,
                    updateData.description,
                    updateData.type,
                    updateData.capacity,
                    updateData.rooms,
                    updateData.price,
                    updateData.weekend_price,
                    updateData.features,
                    updateData.images,
                    updateData.available,
                    updateData.owner_id,
                    updateData.city_id,
                    updateData.address,
                    updateData.latitude,
                    updateData.longitude,
                    updateData.amenity_ids,
                    updateData.package_name,
                    updateData.package_description,
                    updateData.package_images,
                    updateData.adult_price,
                    updateData.child_price,
                    updateData.weekend_adult_price,
                    updateData.weekend_child_price,
                    updateData.max_guests,
                    updateData.MaxPersonVilla,
                    updateData.RatePersonVilla,
                    id,
                ].map(toSqlValue),
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ error: "No changes made" });
            }

            await connection.commit();

            res.status(200).json({
                id: id,
                message: "Accommodation updated successfully",
            });
        } catch (error) {
            await connection.rollback();
            console.error("Error updating accommodation:", error);

            if (
                error.message.includes("Missing required") ||
                error.message.includes("Invalid number") ||
                error.message.includes("must be positive")
            ) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({
                error: "Failed to update accommodation",
                details: error.sqlMessage || error.message,
            });
        }
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({
            error: "Database connection failed",
            details: error.sqlMessage || error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// DELETE /admin/properties/accommodations/:id - Delete accommodation
routes.delete("/accommodations/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Deleting accommodation with ID:", id);
    // Validate ID is a positive integer
    if (!Number.isInteger(Number(id)) || id <= 0) {
        return res
            .status(400)
            .json({ error: "Invalid accommodation ID format" });
    }

    const connection = await createConnection();

    try {
        await connection.beginTransaction();

        // 1. Check if accommodation exists
        const [accommodation] = await connection.execute(
            "SELECT id FROM accommodations WHERE id = ? FOR UPDATE",
            [id],
        );

        if (accommodation.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Accommodation not found" });
        }

        // 2. Delete from all child tables
        const childTables = [
            "blocked_dates",
            "accommodation_amenities",
            "bookings",
            "reviews",
            "packages",
        ];

        for (const table of childTables) {
            try {
                await connection.execute(
                    `DELETE FROM ${table} WHERE accommodation_id = ?`,
                    [id],
                );
            } catch (err) {
                // Ignore "table doesn't exist" errors
                if (err.code !== "ER_NO_SUCH_TABLE") throw err;
            }
        }

        // 3. Finally delete the accommodation
        const [result] = await connection.execute(
            "DELETE FROM accommodations WHERE id = ?",
            [id],
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "No accommodation deleted" });
        }

        await connection.commit();
        res.json({
            message: "Accommodation and all related data deleted successfully",
            deletedId: id,
        });
    } catch (error) {
        await connection.rollback();
        console.error("Database error deleting accommodation:", error);

        // More specific error handling
        let errorMessage = "Failed to delete accommodation";
        let errorDetails = {};

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            errorMessage =
                "Cannot delete - accommodation is referenced by other records";
            errorDetails = {
                hint: "Please delete related bookings or reviews first",
            };
        } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
            errorMessage = "Referenced record not found";
            errorDetails = { hint: "Database consistency issue detected" };
        } else if (error.code === "ER_NO_SUCH_TABLE") {
            errorMessage = "Database table missing";
            errorDetails = {
                missingTable: error.sqlMessage.match(/Table '(.+)'/)[1],
            };
        }

        res.status(500).json({
            error: errorMessage,
            ...errorDetails,
            // Always include debug info in development
            ...(process.env.NODE_ENV !== "production" && {
                details: {
                    code: error.code,
                    message: error.message,
                    sql: error.sql,
                },
            }),
        });
    } finally {
        await closeConnection(connection);
    }
});
// PATCH /admin/properties/accommodations/:id/toggle-availability - Toggle availability
routes.patch("/accommodations/:id/toggle-availability", async (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;

        const connection = await createConnection();

        // If setting to available, set available_rooms to 1, if unavailable set to 0
        const available_rooms = available ? 1 : 0;

        const [result] = await connection.execute(
            "UPDATE accommodations SET available_rooms = ? WHERE id = ?",
            [available_rooms, id],
        );

        if (result.affectedRows === 0) {
            await closeConnection(connection);
            return res.status(404).json({ error: "Accommodation not found" });
        }

        // await closeConnection(connection);
        res.json({
            message: "Availability updated successfully",
            available: available,
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ error: "Failed to update availability" });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/accommodations/stats - Get accommodation statistics
routes.get("/accommodations/stats", async (req, res) => {
    try {
        const connection = await createConnection();

        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN available_rooms > 0 THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN available_rooms = 0 THEN 1 ELSE 0 END) as unavailable,
                AVG(price) as avg_price,
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM accommodations
        `);

        // await closeConnection(connection);
        res.json(stats[0]);
    } catch (error) {
        console.error("Error fetching accommodation stats:", error);
        res.status(500).json({
            error: "Failed to fetch accommodation statistics",
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/users
routes.get("/users", async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            "SELECT id, name, email FROM users",
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/cities
routes.get("/cities", async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            "SELECT id, name, country FROM cities WHERE active = 1",
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cities" });
    } finally {
        await closeConnection(connection);
    }
});

// Add Accommodation Images
routes.post("/accommodations/upload-image", async (req, res) => {
    const connection = await createConnection();
    try {
        const {
            accommodationId,
            category,
            imgUrl,
            imgAltText,
            imgDescription,
            imgPosition,
            imgTitle,
        } = req.body;
        // console.log("PARAMS: ", req);
        // console.log("BODY: ", req.body);

        if (!imgUrl) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // Insert into database
        const [result] = await connection.execute(
            `INSERT INTO accommodation_images 
            (accommodationId, imgUrl, accommCategory, imgTitle, imgAltText, imgDescription, imgPosition) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                accommodationId,
                imgUrl,
                category,
                imgTitle,
                imgAltText,
                imgDescription,
                imgPosition,
            ],
        );

        // await closeConnection(connection);
        res.json({
            success: true,
            message: "Image added successfully",
            imageId: result.insertId,
            imgUrl: imgUrl,
        });
    } catch (error) {
        console.error("Error adding image:", error);
        const errorMsg = error.message.includes("Duplicate entry")
            ? "Image already exists"
            : error.message;
        res.status(500).json({
            success: false,
            message: errorMsg || "Failed to add image",
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/image-upload
routes.get("/accommodations/:id/fetch-position", async (req, res) => {
    const connection = await createConnection();

    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                error: "Bad Request: Missing accommodation ID",
            });
        }
        const sqlQuery = `
                        SELECT
                            imgPosition
                        FROM
                            accommodation_images
                        WHERE
                            isDeleted = 0
                            AND accommodationId = ${id}
                        ORDER BY
                            imgPosition DESC
                        LIMIT 1`;
        const [rows] = await connection.execute(sqlQuery);
        if (rows.length === 0) {
            return res.status(200).json({
                imgPositionId: 0,
            });
        }
        res.status(200).json({
            imgPositionId: rows[0].imgPosition,
        });
    } catch (error) {
        console.error("Error fetching image Position: ", error);
        const errorMsg = error.message || "Image position does not exist";
        res.status(500).json({
            success: false,
            message: errorMsg || "Failed to add image",
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/accommodations/:id/images
routes.get("/accommodations/:id/images", async (req, res) => {
    const connection = await createConnection();

    try {
        const { id } = req.params;
        console.log("Fetching images for accommodation ID:", id);

        const [rows] = await connection.execute(
            `SELECT
                imageId,
                accommodationId,
                imgUrl,
                accommCategory,
                imgTitle,
                imgAltText,
                imgDescription,
                imgPosition
            FROM
                accommodation_images
            WHERE
                isDeleted = 0
                AND accommodationId = ?
            ORDER BY
                imgPosition ASC`,
            [id],
        );
        // await closeConnection(connection);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching images:", error);
        const errorMsg = error.message.includes("doesn't exist")
            ? "Accommodation not found"
            : error.message;
        res.status(500).json({
            success: false,
            message: errorMsg || "Failed to fetch images",
        });
    } finally {
        await closeConnection(connection);
    }
});

// PUT /admin/properties/accommodations/images-position-reorder - Update image positions
routes.patch("/accommodations/images-position-reorder", async (req, res) => {
    const connection = await createConnection();
    try {
        // console.log(req.body);
        const Positions = req.body;
        // console.log("Updating image positions:", Positions);

        if (!Array.isArray(Positions)) {
            return res.status(400).json({
                error: "Invalid input: imagePositions must be an array",
            });
        }
        // Perform batch update
        for (const { imageId, imgPosition } of Positions) {
            await connection.execute(
                "UPDATE accommodation_images SET imgPosition = ? WHERE imageId = ?",
                [imgPosition, imageId],
            );
        }

        // await closeConnection(connection);
        res.json({ message: "Image positions updated successfully" });
    } catch (error) {
        console.error("Error updating image positions:", error);
        res.status(500).json({
            error: "Failed to update image positions",
        });
    } finally {
        await closeConnection(connection);
    }
});

// DELETE /admin/properties/accommodations/delete-image/:imageId - Delete accommodation image
routes.delete("/accommodations/delete-image/:imageId", async (req, res) => {
    const connection = await createConnection();
    try {
        const { imageId } = req.params;
        console.log("Deleting image with ID:", imageId);

        // First, get the image details for logging
        const [imageDetails] = await connection.execute(
            "SELECT imgUrl FROM accommodation_images WHERE imageId = ?",
            [imageId],
        );

        if (imageDetails.length === 0) {
            await closeConnection(connection);
            return res.status(404).json({ error: "Image not found" });
        }

        // Mark as deleted instead of actually deleting
        await connection.execute(
            "UPDATE accommodation_images SET isDeleted = 1 WHERE imageId = ?",
            [imageId],
        );

        res.json({
            message: "Image marked as deleted successfully",
            deletedImage: imageDetails[0].imgUrl,
        });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ error: "Failed to delete image" });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/accommodations/gallery-images/:id
routes.get("/accommodations/gallery-images/:id", async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        console.log("Fetching images for accommodation ID:", id);

        const [rows] = await connection.execute(
            `SELECT
                imageId,                
                imgUrl,
                accommCategory,
                imgTitle,
                imgAltText,
                imgPosition
            FROM
                accommodation_images
            WHERE
                isDeleted = 0
                AND accommodationId = ?
            ORDER BY
                imgPosition ASC, imageId ASC`,
            [id],
        );
        // await closeConnection(connection);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching images:", error);
        const errorMsg = error.message.includes("doesn't exist")
            ? "Accommodation not found"
            : error.message;
        res.status(500).json({
            success: false,
            message: errorMsg || "Failed to fetch images",
        });
    } finally {
        await closeConnection(connection);
    }
});

// GET /admin/properties/accommodation-details/:id
routes.get("/accommodation-details/:id/:typeId", async (req, res) => {
    const connection = await createConnection();
    try {
        const { id, typeId } = req.params;
        // const { typeId } = req.body;
        let sqlQuery = `SELECT
                              a.id,
                              a.name,
                              a.description,
                              LOWER(a.type) AS type,
                              a.capacity,
                              a.price,
                              a.features AS amenities,
                              COALESCE(
                                      JSON_ARRAYAGG(
                                              JSON_OBJECT('imgUrl', ai.imgUrl, 'imgAltText', ai.imgAltText)
                                                  ORDER BY ai.imgPosition
                                      ),
                                      JSON_ARRAY()
                              ) AS images
                          FROM
                              accommodations a
                              INNER JOIN accommodation_images ai ON a.id = ai.accommodationId AND ai.isDeleted = 0`;

        const whereCondition = [];
        const params = [];

        if(id) {
            whereCondition.push("a.city_id = ?");
            params.push(id);
        }
        if(typeId && typeId !== 'all') {
            whereCondition.push("a.type = ?");
            params.push(typeId);
        }
        // Add WHERE clause if conditions exist
        if (whereCondition.length > 0) {
            sqlQuery += " WHERE " + whereCondition.join(" AND ");
        }

        // Add sorting
        sqlQuery += ` GROUP BY a.id
                    ORDER BY
                        a.displayOrder ASC,
                        a.name ASC`;

        const [rows] = await connection.execute( sqlQuery, params );
        // await closeConnection(connection);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching images:", error);
        const errorMsg = error.message.includes("doesn't exist")
            ? "Accommodation not found"
            : error.message;
        res.status(500).json({
            success: false,
            message: errorMsg || "Failed to fetch accommodations",
        });
    } finally {
        await closeConnection(connection);
    }
});

function detectMediaType(url) {
    const ext = String(url || "").split(".").pop()?.toLowerCase() || "";
    if (ext === "gif") return "gif";
    if (["mp4", "webm", "mov"].includes(ext)) return "video";
    return "image";
}

// GET /admin/properties/accommodations/:id/stories - Fetch property stories
routes.get("/accommodations/:id/stories", async (req, res) => {
    const { id } = req.params;
    const connection = await createConnection();

    try {
        await ensureAccommodationSchema(connection);
        const isNumericId = /^\d+$/.test(id);
        let accommodationId = isNumericId ? Number(id) : null;

        if (!accommodationId) {
            const [rows] = await connection.execute(
                "SELECT id FROM accommodations WHERE slug = ? LIMIT 1",
                [id],
            );
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Accommodation not found",
                });
            }
            accommodationId = rows[0].id;
        }

        const [stories] = await connection.execute(
            `SELECT id, accommodation_id, media_url, media_type, thumbnail_url, title, position
             FROM accommodation_stories
             WHERE accommodation_id = ? AND is_active = 1
             ORDER BY position ASC, id ASC`,
            [accommodationId],
        );

        res.status(200).json({ success: true, data: stories });
    } catch (error) {
        console.error("Error fetching stories:", error);
        if (error.code === "ER_NO_SUCH_TABLE") {
            return res.status(200).json({ success: true, data: [] });
        }
        res.status(500).json({
            success: false,
            message: "Failed to fetch stories",
        });
    } finally {
        await closeConnection(connection);
    }
});

// POST /admin/properties/accommodations/:id/stories - Add story
routes.post("/accommodations/:id/stories", async (req, res) => {
    const { id } = req.params;
    const { mediaUrl, mediaType, thumbnailUrl, title } = req.body;
    const connection = await createConnection();

    try {
        if (!mediaUrl) {
            return res.status(400).json({
                success: false,
                message: "mediaUrl is required",
            });
        }

        const [existing] = await connection.execute(
            "SELECT id FROM accommodations WHERE id = ?",
            [id],
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Accommodation not found",
            });
        }

        const [positionRows] = await connection.execute(
            "SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition FROM accommodation_stories WHERE accommodation_id = ?",
            [id],
        );
        const nextPosition = positionRows[0]?.nextPosition || 1;

        const [result] = await connection.execute(
            `INSERT INTO accommodation_stories
            (accommodation_id, media_url, media_type, thumbnail_url, title, position)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                mediaUrl,
                mediaType || detectMediaType(mediaUrl),
                thumbnailUrl || null,
                title || null,
                nextPosition,
            ],
        );

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                accommodation_id: Number(id),
                media_url: mediaUrl,
                media_type: mediaType || detectMediaType(mediaUrl),
                thumbnail_url: thumbnailUrl || null,
                title: title || null,
                position: nextPosition,
            },
        });
    } catch (error) {
        console.error("Error creating story:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create story",
        });
    } finally {
        await closeConnection(connection);
    }
});

// DELETE /admin/properties/accommodations/stories/:storyId - Delete story
routes.delete("/accommodations/stories/:storyId", async (req, res) => {
    const { storyId } = req.params;
    const connection = await createConnection();

    try {
        const [result] = await connection.execute(
            "DELETE FROM accommodation_stories WHERE id = ?",
            [storyId],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Story not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Story deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting story:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete story",
        });
    } finally {
        await closeConnection(connection);
    }
});

// PATCH /admin/properties/accommodations/stories/reorder - Reorder stories
routes.patch("/accommodations/stories/reorder", async (req, res) => {
    const { stories } = req.body;
    const connection = await createConnection();

    try {
        if (!Array.isArray(stories) || stories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "stories array is required",
            });
        }

        await connection.beginTransaction();
        for (const story of stories) {
            await connection.execute(
                "UPDATE accommodation_stories SET position = ? WHERE id = ?",
                [story.position, story.id],
            );
        }
        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Stories reordered successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error reordering stories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reorder stories",
        });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = routes;
