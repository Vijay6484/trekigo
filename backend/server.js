const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const process = require("process");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const safeParse = require("./utils/safeParse");
const pool = require("./dbcon");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
// Setup logging
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" },
);
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev")); // Log to console in development

// CORS: listed origins only. If the browser shows "CORS" + 502 together, the failure is
// usually nginx (502) returning an error page without CORS headers — fix PM2/upstream first.
const DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5001",
    "http://127.0.0.1:5050",
];
const extraOrigins = (process.env.CORS_EXTRA_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const allowedCorsOrigins = new Set([...DEFAULT_CORS_ORIGINS, ...extraOrigins]);

// Middleware
app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedCorsOrigins.has(origin)) {
                return callback(null, true);
            }
            console.warn("[CORS] Blocked origin:", origin);
            return callback(null, false);
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
        optionsSuccessStatus: 200,
    }),
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Serve media files from VPS storage (new) and legacy uploads folder
const storageDir = path.join(__dirname, "storage");
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}
app.use("/storage", express.static(storageDir));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Make safeParse globally available
app.use((req, res, next) => {
    req.safeParse = safeParse;
    next();
});

// Request timeout handling. Story videos can be hundreds of MB and are
// compressed after upload, so that route needs a much longer idle window.
app.use((req, res, next) => {
    const isLargeMediaUpload =
        req.method === "POST" &&
        (req.path === "/upload/media" || req.path === "/admin/upload/media");
    const timeoutMs = isLargeMediaUpload ? 20 * 60 * 1000 : 30000;
    req.setTimeout(timeoutMs, () => {
        if (!res.headersSent) {
            res.status(504).json({ error: "Request timeout" });
        }
    });
    res.setTimeout(timeoutMs);
    next();
});

// // Database connection middleware
// app.use(async (req, res, next) => {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         req.db = conn;
//         next();
//     } catch (err) {
//         console.error("DB Connection Error:", err);
//         if (conn)
//             await conn
//                 .release()
//                 .catch((e) => console.error("Release error:", e));
//         res.status(503).json({
//             error: "Service unavailable",
//             message: "Database connection failed",
//         });
//     }
// });

// // Ensure connections are released
// app.use((req, res, next) => {
//     res.on("finish", async () => {
//         if (req.db) {
//             try {
//                 await req.db.release();
//             } catch (err) {
//                 console.error("Connection release error:", err);
//             }
//         }
//     });
//     next();
// });

// Health check endpoints
app.get("/health", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS health_check");
        res.status(200).json({
            status: "healthy",
            database: "connected",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(503).json({
            status: "unhealthy",
            database: "disconnected",
            error: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// Safe route loader function
const loadRoutes = (routePath, routePrefix) => {
    try {
        const router = require(routePath);
        app.use(routePrefix, router);
        console.log(`✅ Route loaded: ${routePath}`);
    } catch (err) {
        console.error(`❌ Failed to load route ${routePath}:`, err.message);
        if (err.message.includes("Missing parameter name")) {
            console.error(
                "This error typically indicates a malformed route path with missing parameter names",
            );
        }
    }
};

// Load all routes with error handling
loadRoutes("./routes/dashboard", "/admin/dashboard");
loadRoutes("./routes/properties", "/admin/properties");
loadRoutes("./routes/gallery", "/admin/gallery");
loadRoutes("./routes/users", "/admin/users");
loadRoutes("./routes/coupons", "/admin/coupons");
loadRoutes("./routes/cities", "/admin/cities");
loadRoutes("./routes/ammenities", "/admin/amenities");
// Bookings API: canonical prefix + alias for admin frontends that call `/bookings`
const bookingsRouter = require("./routes/bookings");
app.use("/admin/bookings", bookingsRouter);
app.use("/bookings", bookingsRouter);
console.log("✅ Route loaded: ./routes/bookings (/admin/bookings + /bookings)");
loadRoutes("./routes/ratings", "/admin/ratings");
loadRoutes("./routes/calendar", "/admin/calendar");
loadRoutes("./routes/blogs", "/admin/blogs");
loadRoutes("./routes/heroSection", "/admin/hero-section");
loadRoutes("./routes/offersPromotion", "/admin/offers-promotion");
loadRoutes("./routes/upload", "/upload");
loadRoutes("./routes/upload", "/admin/upload");

const {
    mostLovedRouter,
    experiencesRouter,
    packagesRouter,
    publicRouter,
} = require("./routes/siteContent");
app.use("/admin/most-loved", mostLovedRouter);
app.use("/admin/experiences", experiencesRouter);
app.use("/admin/packages", packagesRouter);
app.use("/api", publicRouter);
console.log("✅ Route loaded: site content + public /api");

// Public blog endpoints (for frontend)
loadRoutes("./routes/blogs", "/api/blogs");

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `The requested resource ${req.path} was not found`,
        timestamp: new Date().toISOString(),
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error:", err);

    if (
        err instanceof TypeError &&
        err.message.includes("Missing parameter name")
    ) {
        return res.status(500).json({
            error: "Invalid route configuration",
            message: "Server route configuration error",
            timestamp: new Date().toISOString(),
        });
    }

    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        timestamp: new Date().toISOString(),
    });
});

// Graceful shutdown
const shutdown = async () => {
    console.log("\n[Shutdown] Starting graceful shutdown...");

    try {
        await pool.end();
        console.log("[Shutdown] Database pool closed successfully");
        process.exit(0);
    } catch (err) {
        console.error("[Shutdown] Error closing pool:", err);
        process.exit(1);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start the server
const server = app.listen(port, async () => {
    server.requestTimeout = 20 * 60 * 1000;
    server.headersTimeout = 60 * 1000;
    console.log(`Server is running on http://localhost:${port}`);

    try {
        // Ensure canonical_url and breadcrumbs columns exist on accommodations table
        try {
            await pool.execute("ALTER TABLE accommodations ADD COLUMN canonical_url VARCHAR(500) NULL AFTER schema_markup");
            console.log("[db] Added canonical_url column to accommodations");
        } catch (e) {
            // Column already exists or error
        }
        try {
            await pool.execute("ALTER TABLE accommodations ADD COLUMN breadcrumbs TEXT NULL AFTER canonical_url");
            console.log("[db] Added breadcrumbs column to accommodations");
        } catch (e) {
            // Column already exists or error
        }

        try {
            const { ensureSiteContent } = require("./utils/ensureSiteContent");
            await ensureSiteContent(pool);
        } catch (e) {
            console.warn("[db] Site content schema check failed:", e.message);
        }

        try {
            const {
                ensureAccommodationSchema,
            } = require("./utils/ensureAccommodationSchema");
            await ensureAccommodationSchema(pool);
        } catch (e) {
            console.warn(
                "[db] Weekend pricing / stories schema check failed:",
                e.message,
            );
        }

        const {
            generateUniqueAccommodationSlug,
        } = require("./utils/generateSlug");
        const [rows] = await pool.execute(
            "SELECT id, name, slug FROM accommodations WHERE slug IS NULL OR slug = ''",
        );

        for (const row of rows) {
            const connection = await pool.getConnection();
            try {
                const slug = await generateUniqueAccommodationSlug(
                    connection,
                    row.name,
                    row.id,
                );
                await connection.execute(
                    "UPDATE accommodations SET slug = ? WHERE id = ?",
                    [slug, row.id],
                );
                console.log(
                    `[slug] Backfilled accommodation ${row.id}: ${slug}`,
                );
            } finally {
                connection.release();
            }
        }
    } catch (err) {
        if (err.code === "ER_BAD_FIELD_ERROR") {
            console.warn(
                "[slug] accommodations.slug column missing — run migrations/add_accommodation_slug.sql",
            );
        } else {
            console.error("[slug] Backfill failed:", err.message);
        }
    }
});

// Handle server errors
server.on("error", (err) => {
    console.error("Server error:", err);
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
    }
});
