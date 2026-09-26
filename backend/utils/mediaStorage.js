const fs = require("fs");
const path = require("path");

const STORAGE_ROOT = path.join(__dirname, "..", "storage");

const ALLOWED_FOLDERS = new Set([
    "accommodations",
    "gallery",
    "promotions",
    "hero",
    "ratings",
    "services",
    "blogs",
    "stories",
    "videos",
    "packages",
    "experiences",
    "general",
]);

function getPublicBaseUrl() {
    return (
        process.env.PUBLIC_API_URL ||
        process.env.ADMIN_BASE_URL ||
        "http://localhost:5001"
    ).replace(/\/$/, "");
}

function normalizeFolder(folder) {
    const value = String(folder || "general")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
    return ALLOWED_FOLDERS.has(value) ? value : "general";
}

function ensureStorageDir(folder) {
    const dir = path.join(STORAGE_ROOT, normalizeFolder(folder));
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function buildPublicUrl(relativePath) {
    const normalized = relativePath.startsWith("/")
        ? relativePath
        : `/${relativePath}`;
    return `${getPublicBaseUrl()}${normalized}`;
}

function toStorageRelativePath(publicOrRelativeUrl) {
    if (!publicOrRelativeUrl) return null;

    let value = String(publicOrRelativeUrl).trim();
    if (!value) return null;

    try {
        if (/^https?:\/\//i.test(value)) {
            const parsed = new URL(value);
            value = parsed.pathname;
        }
    } catch {
        return null;
    }

    const storageIndex = value.indexOf("/storage/");
    if (storageIndex >= 0) {
        return value.slice(storageIndex);
    }

    if (value.startsWith("/storage/")) {
        return value;
    }

    return null;
}

function deleteStoredFile(publicOrRelativeUrl) {
    const relativePath = toStorageRelativePath(publicOrRelativeUrl);
    if (!relativePath) return false;

    const absolutePath = path.join(
        STORAGE_ROOT,
        relativePath.replace(/^\/storage\//, ""),
    );

    if (!absolutePath.startsWith(STORAGE_ROOT)) {
        return false;
    }

    if (!fs.existsSync(absolutePath)) {
        return false;
    }

    fs.unlinkSync(absolutePath);
    return true;
}

module.exports = {
    STORAGE_ROOT,
    ALLOWED_FOLDERS,
    getPublicBaseUrl,
    normalizeFolder,
    ensureStorageDir,
    buildPublicUrl,
    toStorageRelativePath,
    deleteStoredFile,
};
