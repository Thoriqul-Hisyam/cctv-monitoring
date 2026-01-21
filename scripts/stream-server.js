import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const activeStreams = new Map();

// Configuration
const HLS_DIR = path.join(__dirname, "../streams");
const PORT = 3001;
const SEGMENT_DURATION = 2; // Duration of each segment in seconds
const PLAYLIST_SIZE = 5; // Number of segments to keep in the playlist

// Ensure HLS directory exists
if (!fs.existsSync(HLS_DIR)) {
    fs.mkdirSync(HLS_DIR, { recursive: true });
}

// Simple HTTP server to serve the streams

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const filePath = path.join(HLS_DIR, req.url);

    // Basic security: ensure the path is within HLS_DIR
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(HLS_DIR))) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404);
            res.end("Not Found");
            return;
        }

        const ext = path.extname(filePath);
        let contentType = "application/octet-stream";
        let cacheControl = "no-cache, no-store, must-revalidate"; // Default for index.m3u8

        if (ext === ".m3u8") {
            contentType = "application/vnd.apple.mpegurl";
        } else if (ext === ".ts") {
            contentType = "video/MP2T";
            cacheControl = "no-cache, no-store, must-revalidate"; // Disable cache to prevent "maju mundur" issue
        }

        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": cacheControl
        });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 Stream server listening on http://0.0.0.0:${PORT}`);
});

async function startStream(cctv) {
    if (activeStreams.has(cctv.id)) {
        return; // Stream already running
    }

    const streamDir = path.join(HLS_DIR, `cctv_${cctv.id}`);
    if (!fs.existsSync(streamDir)) {
        fs.mkdirSync(streamDir, { recursive: true });
    }

    // Construct FFmpeg command
    // 102 = SD, 101 = HD (assuming default channel structure based on schema comments)
    // Construct RTSP URL if streamUrl is not set. 
    // Assuming a standard RTSP format or using the one provided in streamUrl

    let rtspUrl = cctv.ipAddress; // User confirmed ipAddress contains the full RTSP URL
    // Legacy support or fallback if needed
    if (!rtspUrl) {
        rtspUrl = cctv.streamUrl;
    }

    if (!rtspUrl) {
        console.error(`❌ [Stream ${cctv.id}] No valid URL found (checked ipAddress and streamUrl)`);
        return;
    }

    console.log(`🎬 [Stream ${cctv.id}] Starting FFmpeg for ${cctv.name}...`);
    console.log(`   URL: ${rtspUrl}`);

    const ffmpegArgs = [
        "-nostdin",
        "-rtsp_transport", "tcp",
        "-loglevel", "warning",
        "-i", rtspUrl,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-pix_fmt", "yuv420p",
        "-r", "20", // Lower framerate for stability
        "-g", "40", // Keyframe every 2 seconds
        "-vf", "scale=-2:480",
        "-an", // Disable audio to prevent "Queue input is backward in time" errors
        "-hls_time", "2",
        "-hls_list_size", "180", // 180 segments * 2s = 360s (6 minutes buffer) to support 5-min delay
        "-hls_flags", "delete_segments+independent_segments",
        "-hls_segment_filename", path.join(streamDir, "segment_%d.ts"),
        path.join(streamDir, "index.m3u8")
    ];

    console.log(`[Stream ${cctv.id}] Cmd: ffmpeg ${ffmpegArgs.join(" ")}`);

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    activeStreams.set(cctv.id, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
        const output = data.toString();
        // Log all FFmpeg output for now to see what's wrong during startup
        console.log(`[FFmpeg ${cctv.id}] ${output.trim()}`);
    });

    ffmpeg.on("close", (code) => {
        console.log(`⚠️ [Stream ${cctv.id}] FFmpeg exited with code ${code}`);

        // Only restart if the stream is still tracked in activeStreams
        // (If it was manually stopped via stopStream, it would have been removed already)
        if (activeStreams.has(cctv.id)) {
            activeStreams.delete(cctv.id);

            console.log(`🔄 [Stream ${cctv.id}] Stream died unexpectedly. Restarting in 2s...`);
            setTimeout(() => {
                startStream(cctv);
            }, 2000);
        }
    });
}

function stopStream(id) {
    const ffmpeg = activeStreams.get(id);
    if (ffmpeg) {
        ffmpeg.kill("SIGKILL");
        activeStreams.delete(id);
        console.log(`🛑 [Stream ${id}] Stopped`);
    }
}

async function syncStreams() {
    try {
        // Fetch all CCTVs, ignoring isActive status as requested
        const cctvs = await prisma.cctv.findMany({});

        console.log(`📋 Found ${cctvs.length} active CCTVs`);

        const activeIds = new Set(cctvs.map((c) => c.id));

        // Stop streams that are no longer active
        for (const [id] of activeStreams) {
            if (!activeIds.has(id)) {
                stopStream(id);
            }
        }

        // Start new streams sequentially with a delay to avoid CPU/Network spikes
        let delay = 0;
        for (const cctv of cctvs) {
            setTimeout(() => {
                startStream(cctv);
            }, delay);
            delay += 1500; // 1.5 second delay between streams
        }
    } catch (error) {
        console.error("❌ Sync error:", error);
    }
}

// Initial sync
console.log("🚀 Stream server starting...");
syncStreams();

// Periodic sync (every 60 seconds) to check for DB changes
setInterval(syncStreams, 60000);

// Cleanup on exit
process.on("SIGINT", () => {
    console.log("Shutting down...");
    for (const [id] of activeStreams) {
        stopStream(id);
    }
    server.close();
    prisma.$disconnect();
    process.exit();
});
