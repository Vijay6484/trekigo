const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const {
    ensureStorageDir,
    buildPublicUrl,
    normalizeFolder,
} = require("../utils/mediaStorage");
const {
    isVideoUpload,
    compressStoryVideo,
} = require("../utils/compressVideo");

const MAX_STORY_MEDIA_BYTES = 800 * 1024 * 1024;
const MEDIA_UPLOAD_TIMEOUT_MS = 20 * 60 * 1000;

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        try {
            const folder = normalizeFolder(req.query.folder || req.body.folder);
            cb(null, ensureStorageDir(folder));
        } catch (error) {
            cb(error);
        }
    },
    filename(req, file, cb) {
        const folder = normalizeFolder(req.query.folder || req.body.folder);
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${folder}-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase(),
        );
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed"));
    },
});

const uploadMedia = multer({
    storage,
    limits: { fileSize: MAX_STORY_MEDIA_BYTES },
    fileFilter(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|quicktime/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase(),
        );
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image, GIF, or video files are allowed"));
    },
});

function sendUploadSuccess(res, folder, filename, extra = {}) {
    const relativePath = `/storage/${folder}/${filename}`;
    const url = buildPublicUrl(relativePath);

    res.status(201).json({
        success: true,
        filename,
        url,
        imageUrl: url,
        path: relativePath,
        ...extra,
    });
}

function handleUpload(req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "No image uploaded",
            message: "No image uploaded",
        });
    }

    const folder = normalizeFolder(req.query.folder || req.body.folder);
    sendUploadSuccess(res, folder, req.file.filename);
}

async function handleMediaUpload(req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "No media uploaded",
            message: "No media uploaded",
        });
    }

    const folder = normalizeFolder(req.query.folder || req.body.folder);
    let filename = req.file.filename;
    let compression = {};

    try {
        if (isVideoUpload(req.file.path, req.file.mimetype)) {
            const result = await compressStoryVideo(req.file.path);
            filename = result.filename;
            compression = {
                optimized: result.optimized,
                originalBytes: result.originalBytes,
                outputBytes: result.outputBytes,
            };
        }
    } catch (error) {
        console.error("Story video compression failed:", error);
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            success: false,
            error: "Could not prepare this video for the web",
            message:
                "Could not prepare this video for the web. Try again, or export it as an MP4.",
        });
    }

    sendUploadSuccess(res, folder, filename, compression);
}

function extendMediaUploadTimeout(req, res, next) {
    req.setTimeout(MEDIA_UPLOAD_TIMEOUT_MS);
    res.setTimeout(MEDIA_UPLOAD_TIMEOUT_MS);
    next();
}

router.post("/", upload.single("image"), handleUpload);
router.post("/upload", upload.single("image"), handleUpload);
router.post(
    "/media",
    extendMediaUploadTimeout,
    uploadMedia.single("media"),
    handleMediaUpload,
);

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message =
            err.code === "LIMIT_FILE_SIZE"
                ? "File is too large. Maximum size is 800 MB."
                : err.message;
        return res.status(400).json({
            success: false,
            error: message,
            message,
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message || "Upload failed",
            message: err.message || "Upload failed",
        });
    }
    next();
});

module.exports = router;
