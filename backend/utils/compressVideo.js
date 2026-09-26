const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".qt"]);

// CRF 18 is visually lossless for H.264. Size drops because phone videos
// are usually 4K at a very high bitrate; stories only need 1080p.
const CRF = "18";
const MAX_DIMENSION = 1920;
const ALREADY_SMALL_BYTES = 20 * 1024 * 1024;

function isVideoUpload(filePath, mimetype) {
    const ext = path.extname(filePath || "").toLowerCase();
    if (VIDEO_EXTENSIONS.has(ext)) return true;
    return typeof mimetype === "string" && mimetype.startsWith("video/");
}

function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        if (!ffmpegPath) {
            reject(new Error("ffmpeg binary is not available"));
            return;
        }

        const proc = spawn(ffmpegPath, args, {
            stdio: ["ignore", "ignore", "pipe"],
        });
        let stderr = "";
        proc.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
            if (stderr.length > 40000) stderr = stderr.slice(-20000);
        });
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0) resolve(stderr);
            else {
                const tail = stderr.trim().split("\n").slice(-6).join("\n");
                reject(new Error(tail || `ffmpeg exited with code ${code}`));
            }
        });
    });
}

function probeVideo(inputPath) {
    return new Promise((resolve) => {
        const proc = spawn(ffmpegPath, ["-hide_banner", "-i", inputPath], {
            stdio: ["ignore", "ignore", "pipe"],
        });
        let stderr = "";
        proc.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        proc.on("error", () => resolve(null));
        proc.on("close", () => {
            const videoLine = stderr
                .split("\n")
                .find((line) => /Video:/.test(line));
            if (!videoLine) {
                resolve(null);
                return;
            }
            const codec = videoLine.match(/Video:\s+([a-z0-9]+)/i)?.[1] || "";
            const pix = videoLine.match(/yuvj?\d+p/)?.[0] || "";
            const dims = videoLine.match(/(\d{2,5})x(\d{2,5})/);
            resolve({
                codec: codec.toLowerCase(),
                pix,
                width: dims ? Number(dims[1]) : 0,
                height: dims ? Number(dims[2]) : 0,
            });
        });
    });
}

function isAlreadyWebReady(inputPath, info, size) {
    if (!info) return false;
    const ext = path.extname(inputPath).toLowerCase();
    return (
        ext === ".mp4" &&
        info.codec === "h264" &&
        (info.pix === "yuv420p" || info.pix === "yuvj420p") &&
        info.width > 0 &&
        info.height > 0 &&
        info.width <= MAX_DIMENSION &&
        info.height <= MAX_DIMENSION &&
        size <= ALREADY_SMALL_BYTES
    );
}

/**
 * Re-encode a story video to a fast-start H.264 MP4 that browsers can play.
 * Returns the file that should be stored (compressed, or the original when
 * it is already a small web-ready MP4).
 */
async function compressStoryVideo(inputPath) {
    const inputSize = fs.statSync(inputPath).size;
    const info = await probeVideo(inputPath);

    if (isAlreadyWebReady(inputPath, info, inputSize)) {
        return {
            filename: path.basename(inputPath),
            outputPath: inputPath,
            originalBytes: inputSize,
            outputBytes: inputSize,
            optimized: false,
        };
    }

    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(dir, `${base}.mp4`);
    const tempPath = path.join(dir, `${base}.compressing.mp4`);

    try {
        await runFfmpeg([
            "-y",
            "-i",
            inputPath,
            "-map",
            "0:v:0",
            "-map",
            "0:a:0?",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            CRF,
            "-pix_fmt",
            "yuv420p",
            "-vf",
            `scale=w='min(${MAX_DIMENSION},iw)':h='min(${MAX_DIMENSION},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`,
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-movflags",
            "+faststart",
            tempPath,
        ]);

        if (!fs.existsSync(tempPath) || fs.statSync(tempPath).size === 0) {
            throw new Error("Compressed video was empty");
        }

        const outputSize = fs.statSync(tempPath).size;
        const alreadyH264Mp4 =
            path.extname(inputPath).toLowerCase() === ".mp4" &&
            info?.codec === "h264";

        if (alreadyH264Mp4 && outputSize >= inputSize) {
            fs.unlinkSync(tempPath);
            return {
                filename: path.basename(inputPath),
                outputPath: inputPath,
                originalBytes: inputSize,
                outputBytes: inputSize,
                optimized: false,
            };
        }

        if (path.resolve(inputPath) !== path.resolve(tempPath)) {
            fs.unlinkSync(inputPath);
        }
        if (fs.existsSync(outputPath) && path.resolve(outputPath) !== path.resolve(tempPath)) {
            fs.unlinkSync(outputPath);
        }
        fs.renameSync(tempPath, outputPath);

        return {
            filename: path.basename(outputPath),
            outputPath,
            originalBytes: inputSize,
            outputBytes: outputSize,
            optimized: true,
        };
    } catch (error) {
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        throw error;
    }
}

module.exports = {
    isVideoUpload,
    compressStoryVideo,
};
