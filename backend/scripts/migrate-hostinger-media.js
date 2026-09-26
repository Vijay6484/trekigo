#!/usr/bin/env node
/**
 * Download every public media URL stored in the database and host it on VPS.
 * New URLs become: https://api.nirwanastays.com/storage/{folder}/{file}
 *
 * Run on VPS (after backend deploy):
 *   npm run migrate:media
 *   npm run migrate:media:dry-run
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pool = require("../dbcon");
const {
    STORAGE_ROOT,
    ensureStorageDir,
    buildPublicUrl,
    getPublicBaseUrl,
} = require("../utils/mediaStorage");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const DOWNLOAD_ONLY = args.has("--download-only");
const UPDATE_ONLY = args.has("--update-only");
const VERBOSE = args.has("--verbose");

const PUBLIC_BASE = getPublicBaseUrl();
const PUBLIC_HOST = new URL(PUBLIC_BASE).hostname.toLowerCase();

// Used only to resolve old relative paths like /uploads/photo.jpg
const RELATIVE_URL_BASE = (
    process.env.LEGACY_MEDIA_BASE_URL || "https://plumeriaretreat.com"
).replace(/\/$/, "");

const STOCK_IMAGE_HOSTS = new Set(
    (
        process.env.SKIP_MEDIA_HOSTS ||
        "images.unsplash.com,images.pexels.com,placehold.co,via.placeholder.com"
    )
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean),
);

const urlCache = new Map();
const stats = {
    scanned: 0,
    skipped: 0,
    downloaded: 0,
    copied: 0,
    reused: 0,
    failed: 0,
    updated: 0,
};

const TABLE_SOURCES = [
    {
        table: "accommodation_images",
        idColumn: "imageId",
        column: "imgUrl",
        folder: "accommodations",
    },
    {
        table: "gallery_images",
        idColumn: "id",
        column: "src",
        folder: "gallery",
    },
    {
        table: "offers_promotional_banners",
        idColumn: "offerId",
        column: "bannerUrl",
        folder: "promotions",
    },
    {
        table: "hero_section",
        idColumn: "heroId",
        column: "imgUrl",
        folder: "hero",
    },
    {
        table: "blogs",
        idColumn: "id",
        column: "image",
        folder: "blogs",
    },
    {
        table: "testimonials",
        idColumn: "id",
        column: "image",
        folder: "ratings",
    },
    {
        table: "accommodations",
        idColumn: "id",
        column: "images",
        folder: "accommodations",
        jsonArray: true,
    },
    {
        table: "accommodations",
        idColumn: "id",
        column: "package_images",
        folder: "accommodations",
        jsonArray: true,
    },
    {
        table: "activities",
        idColumn: "id",
        column: "image",
        folder: "services",
    },
];

function log(...parts) {
    console.log("[migrate-media]", ...parts);
}

function isAlreadyOnVpsStorage(url) {
    const value = String(url || "").trim();
    if (value.startsWith("/storage/")) return true;

    try {
        const parsed = new URL(value);
        return (
            parsed.hostname.toLowerCase() === PUBLIC_HOST &&
            parsed.pathname.startsWith("/storage/")
        );
    } catch {
        return false;
    }
}

function normalizeSourceUrl(raw) {
    if (!raw) return null;
    let value = String(raw).trim();
    if (!value) return null;
    if (value.startsWith("data:") || value.startsWith("blob:")) return null;

    if (value.startsWith("//")) {
        value = `https:${value}`;
    } else if (value.startsWith("/storage/")) {
        return null;
    } else if (value.startsWith("/uploads/")) {
        value = `${PUBLIC_BASE}${value}`;
    } else if (value.startsWith("/")) {
        value = `${RELATIVE_URL_BASE}${value}`;
    } else if (!/^https?:\/\//i.test(value)) {
        return null;
    }

    try {
        return new URL(value).href;
    } catch {
        return null;
    }
}

function shouldMigrate(rawUrl) {
    if (!rawUrl || isAlreadyOnVpsStorage(rawUrl)) return false;

    const normalized = normalizeSourceUrl(rawUrl);
    if (!normalized) return false;

    try {
        const host = new URL(normalized).hostname.toLowerCase();
        if (STOCK_IMAGE_HOSTS.has(host)) return false;
    } catch {
        return false;
    }

    return true;
}

function extFromContentType(contentType) {
    const map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
    };
    const key = String(contentType || "").split(";")[0].trim().toLowerCase();
    return map[key] || ".jpg";
}

function safeFilename(url, fallback = "media") {
    try {
        const parsed = new URL(url);
        const base = path.basename(parsed.pathname);
        const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
        if (cleaned && cleaned.includes(".")) return cleaned;
    } catch {
        // ignore
    }
    return `${fallback}-${Date.now()}.jpg`;
}

function uniqueFilename(folder, filename) {
    const dir = ensureStorageDir(folder);
    let candidate = filename;
    let counter = 1;
    while (fs.existsSync(path.join(dir, candidate))) {
        const ext = path.extname(filename);
        const stem = path.basename(filename, ext);
        candidate = `${stem}-${counter}${ext}`;
        counter += 1;
    }
    return candidate;
}

function tryCopyLocalUpload(sourceUrl, folder, filename) {
    try {
        const parsed = new URL(sourceUrl);
        if (parsed.hostname.toLowerCase() !== PUBLIC_HOST) return null;
        if (!parsed.pathname.startsWith("/uploads/")) return null;

        const sourcePath = path.join(__dirname, "..", parsed.pathname);
        const uploadsRoot = path.join(__dirname, "..", "uploads");
        if (!sourcePath.startsWith(uploadsRoot)) return null;
        if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
            return null;
        }

        const targetPath = path.join(STORAGE_ROOT, folder, filename);
        fs.copyFileSync(sourcePath, targetPath);
        return targetPath;
    } catch {
        return null;
    }
}

async function fetchRemoteFile(sourceUrl) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            const response = await axios.get(sourceUrl, {
                responseType: "arraybuffer",
                timeout: 90000,
                maxRedirects: 5,
                validateStatus: (status) => status >= 200 && status < 400,
                headers: {
                    "User-Agent": "NirwanaStays-MediaMigration/1.0",
                    Accept: "image/*,*/*",
                },
            });
            return response;
        } catch (error) {
            lastError = error;
            if (attempt < 3) {
                await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
            }
        }
    }

    throw lastError;
}

async function downloadToStorage(sourceUrl, folder) {
    if (urlCache.has(sourceUrl)) {
        return urlCache.get(sourceUrl);
    }

    let filename = uniqueFilename(folder, safeFilename(sourceUrl));
    let relativePath = `/storage/${folder}/${filename}`;
    let targetPath = path.join(STORAGE_ROOT, folder, filename);
    let publicUrl = buildPublicUrl(relativePath);

    if (UPDATE_ONLY && fs.existsSync(targetPath)) {
        stats.reused += 1;
        urlCache.set(sourceUrl, publicUrl);
        return publicUrl;
    }

    if (DRY_RUN) {
        log("would download:", sourceUrl, "->", publicUrl);
        urlCache.set(sourceUrl, publicUrl);
        return publicUrl;
    }

    ensureStorageDir(folder);

    const localCopy = tryCopyLocalUpload(sourceUrl, folder, filename);
    if (localCopy) {
        stats.copied += 1;
        urlCache.set(sourceUrl, publicUrl);
        if (VERBOSE) log("copied local upload:", localCopy);
        return publicUrl;
    }

    const response = await fetchRemoteFile(sourceUrl);

    const contentType = response.headers["content-type"];
    if (!filename.includes(".")) {
        filename = uniqueFilename(
            folder,
            `${path.basename(filename, path.extname(filename))}${extFromContentType(contentType)}`,
        );
        relativePath = `/storage/${folder}/${filename}`;
        targetPath = path.join(STORAGE_ROOT, folder, filename);
        publicUrl = buildPublicUrl(relativePath);
    }

    fs.writeFileSync(targetPath, response.data);
    stats.downloaded += 1;
    urlCache.set(sourceUrl, publicUrl);

    if (VERBOSE) {
        log("saved", targetPath);
    }

    return publicUrl;
}

async function migrateUrl(sourceUrl, folder) {
    stats.scanned += 1;

    const normalized = normalizeSourceUrl(sourceUrl);
    if (!normalized || !shouldMigrate(sourceUrl)) {
        stats.skipped += 1;
        return sourceUrl;
    }

    try {
        return await downloadToStorage(normalized, folder);
    } catch (error) {
        stats.failed += 1;
        log("FAILED", normalized, "-", error.message);
        return sourceUrl;
    }
}

async function updateScalarRow(source, row) {
    const oldValue = row[source.column];
    if (!oldValue) return;

    const newValue = await migrateUrl(oldValue, source.folder);
    if (newValue === oldValue || DOWNLOAD_ONLY || DRY_RUN) return;

    await pool.execute(
        `UPDATE \`${source.table}\` SET \`${source.column}\` = ? WHERE \`${source.idColumn}\` = ?`,
        [newValue, row[source.idColumn]],
    );
    stats.updated += 1;
    log(`updated ${source.table}.${source.column} #${row[source.idColumn]}`);
}

function parseJsonArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function updateJsonArrayRow(source, row) {
    const oldItems = parseJsonArray(row[source.column]);
    if (!oldItems.length) return;

    let changed = false;
    const newItems = [];

    for (const item of oldItems) {
        if (typeof item !== "string" || !item.trim()) {
            newItems.push(item);
            continue;
        }

        const migrated = await migrateUrl(item, source.folder);
        if (migrated !== item) changed = true;
        newItems.push(migrated);
    }

    if (!changed || DOWNLOAD_ONLY || DRY_RUN) return;

    await pool.execute(
        `UPDATE \`${source.table}\` SET \`${source.column}\` = ? WHERE \`${source.idColumn}\` = ?`,
        [JSON.stringify(newItems), row[source.idColumn]],
    );
    stats.updated += 1;
    log(`updated ${source.table}.${source.column} #${row[source.idColumn]}`);
}

async function processSource(source) {
    log(`scanning ${source.table}.${source.column}...`);

    const [rows] = await pool.execute(
        `SELECT \`${source.idColumn}\`, \`${source.column}\` FROM \`${source.table}\``,
    );

    for (const row of rows) {
        if (source.jsonArray) {
            await updateJsonArrayRow(source, row);
        } else {
            await updateScalarRow(source, row);
        }
    }
}

async function tableExists(tableName) {
    const [rows] = await pool.execute(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        [tableName]
    );
    return rows.length > 0;
}

async function main() {
    log("public base:", PUBLIC_BASE);
    log("storage root:", STORAGE_ROOT);
    log("method: download every public DB image URL -> api storage");

    if (DRY_RUN) log("mode: DRY RUN");
    if (DOWNLOAD_ONLY) log("mode: DOWNLOAD ONLY (no DB updates)");
    if (UPDATE_ONLY) log("mode: UPDATE ONLY (skip existing files)");

    ensureStorageDir("general");

    for (const source of TABLE_SOURCES) {
        if (!(await tableExists(source.table))) {
            log(`skip missing table: ${source.table}`);
            continue;
        }
        await processSource(source);
    }

    log("--- summary ---");
    log("scanned:", stats.scanned);
    log("skipped:", stats.skipped);
    log("downloaded:", stats.downloaded);
    log("copied:", stats.copied);
    log("reused:", stats.reused);
    log("failed:", stats.failed);
    log("db rows updated:", stats.updated);

    if (stats.failed > 0) {
        process.exitCode = 1;
    }
}

main()
    .catch((error) => {
        console.error("[migrate-media] fatal:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await pool.end();
        } catch {
            // ignore
        }
        process.exit(process.exitCode || 0);
    });
