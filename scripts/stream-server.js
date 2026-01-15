import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const activeStreams = new Map();

// Configuration
const HLS_DIR = path.join(__dirname, "../public/stream");
const SEGMENT_DURATION = 2; // Duration of each segment in seconds
const PLAYLIST_SIZE = 5; // Number of segments to keep in the playlist

// Ensure HLS directory exists
if (!fs.existsSync(HLS_DIR)) {
    fs.mkdirSync(HLS_DIR, { recursive: true });
}

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
        "-rtsp_transport", "tcp",
        "-probesize", "10M",
        "-analyzeduration", "10M",
        "-fflags", "+genpts+discardcorrupt", // Generate pts if missing and discard corrupt packets
        "-err_detect", "ignore_err", // Ignore decoding errors
        "-i", rtspUrl,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-profile:v", "baseline",
        "-bf", "0",
        "-r", "25",
        "-vf", "setpts=N/25/TB", // 🔥 FORCE rewrite video timestamps based on frame count (Fixes looping)
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-ac", "2",
        "-ar", "44100",
        "-af", "asetpts=N/SR/TB", // 🔥 FORCE rewrite audio timestamps
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "4", // Slightly larger buffer
        "-hls_flags", "delete_segments+omit_endlist",
        "-hls_segment_filename", path.join(streamDir, "segment_%03d.ts"),
        path.join(streamDir, "index.m3u8")
    ];

    console.log(`[Stream ${cctv.id}] Cmd: ffmpeg ${ffmpegArgs.join(" ")}`);

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    activeStreams.set(cctv.id, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
        // Log error output to debug crash
        console.log(`[FFmpeg ${cctv.id}] ${data.toString()}`);
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

        // Start new streams
        for (const cctv of cctvs) {
            startStream(cctv);
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
    prisma.$disconnect();
    process.exit();
});
