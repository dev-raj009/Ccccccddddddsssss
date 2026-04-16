
/**
 * =============================================
 *   SPIDYUNIVERSE API SERVER
 *   Version: 1.0.0
 *   Routes:
 *     GET /API/batches        → All batches list
 *     GET /API/batch/:id      → Batch detail by ID
 *     GET /API/search?q=...   → Search across batches
 *     GET /API/subjects/:id   → Subjects in a batch
 *     GET /               → Dashboard (HTML)
 * =============================================
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── Load Data ─────────────────────────────────
const DATA_DIR = path.join(__dirname, "../data");

function loadBatches() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, "batches.json"), "utf8"));
}

function loadBatchDetails() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, "batch_details.json"), "utf8"));
}

// ── Helper: parse video entry ─────────────────
function parseVideo(entry) {
  const colonIdx = entry.lastIndexOf(" : ");
  if (colonIdx === -1) return { subject: "", title: entry, url: "" };
  const url = entry.slice(colonIdx + 3).trim();
  const meta = entry.slice(0, colonIdx).trim();
  const parenOpen = meta.indexOf("(");
  const parenClose = meta.lastIndexOf(")");
  if (parenOpen !== -1 && parenClose !== -1) {
    return {
      subject: meta.slice(0, parenOpen).trim(),
      title: meta.slice(parenOpen + 1, parenClose).trim(),
      url,
    };
  }
  return { subject: "", title: meta, url };
}

// ── Route: GET /API/batches ───────────────────
app.get("/API/batches", (req, res) => {
  try {
    const data = loadBatches();
    res.json({
      success: true,
      source: "spidyuniverse-api",
      total: data.total,
      batches: data.batches,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: "Failed to load batches" });
  }
});

// ── Route: GET /API/batch/:id ─────────────────
app.get("/API/batch/:id", (req, res) => {
  try {
    const { id } = req.params;
    const details = loadBatchDetails();

    if (!details[id]) {
      return res.status(404).json({
        success: false,
        error: `Batch with ID ${id} not found`,
        available_ids: Object.keys(details).map(Number).sort((a, b) => a - b),
      });
    }

    const batch = details[id];

    // Parse videos into structured objects
    const parsedVideos = batch.videos.map((v, idx) => ({
      index: idx + 1,
      ...parseVideo(v),
    }));

    // Group by subject
    const bySubject = {};
    parsedVideos.forEach((v) => {
      const subj = v.subject || "General";
      if (!bySubject[subj]) bySubject[subj] = [];
      bySubject[subj].push(v);
    });

    res.json({
      success: true,
      source: "spidyuniverse-api",
      data: {
        batch_id: batch.batch_id,
        batch_name: batch.batch_name,
        source_platform: batch.source,
        course_url: batch.course_url,
        teachers: batch.teachers,
        total_videos: batch.total_videos,
        total_subjects: batch.subjects.length,
        subjects: batch.subjects,
        videos_by_subject: bySubject,
        videos: parsedVideos,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: "Server error: " + e.message });
  }
});

// ── Route: GET /API/subjects/:id ──────────────
app.get("/API/subjects/:id", (req, res) => {
  try {
    const { id } = req.params;
    const details = loadBatchDetails();

    if (!details[id]) {
      return res.status(404).json({ success: false, error: `Batch ID ${id} not found` });
    }

    const batch = details[id];
    const subjectStats = {};
    batch.videos.forEach((v) => {
      const { subject } = parseVideo(v);
      const s = subject || "General";
      subjectStats[s] = (subjectStats[s] || 0) + 1;
    });

    res.json({
      success: true,
      batch_id: batch.batch_id,
      batch_name: batch.batch_name,
      total_subjects: batch.subjects.length,
      subjects: batch.subjects.map((s) => ({
        name: s,
        video_count: subjectStats[s] || 0,
      })),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── Route: GET /API/search?q=&batch_id= ───────
app.get("/API/search", (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase().trim();
    const batchFilter = req.query.batch_id;

    if (!q) {
      return res.status(400).json({ success: false, error: "Query param 'q' is required" });
    }

    const details = loadBatchDetails();
    const results = [];

    const idsToSearch = batchFilter ? [batchFilter] : Object.keys(details);

    for (const id of idsToSearch) {
      if (!details[id]) continue;
      const batch = details[id];
      batch.videos.forEach((v) => {
        if (v.toLowerCase().includes(q)) {
          results.push({
            batch_id: batch.batch_id,
            batch_name: batch.batch_name,
            ...parseVideo(v),
          });
        }
      });
    }

    res.json({
      success: true,
      query: q,
      total_results: results.length,
      results,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── Route: GET /API/stats ─────────────────────
app.get("/API/stats", (req, res) => {
  try {
    const batches = loadBatches();
    const details = loadBatchDetails();

    let totalVideos = 0;
    const platformCount = {};
    Object.values(details).forEach((b) => {
      totalVideos += b.total_videos;
      const p = b.source || "unknown";
      platformCount[p] = (platformCount[p] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        total_batches: batches.total,
        total_videos: totalVideos,
        batches_by_platform: platformCount,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── Route: Dashboard ──────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ── 404 Handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    available_routes: [
      "GET /API/batches",
      "GET /API/batch/:id",
      "GET /API/subjects/:id",
      "GET /API/search?q=<query>&batch_id=<optional>",
      "GET /API/stats",
      "GET /  (Dashboard)",
    ],
  });
});

// ── Start Server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🕷️  SPIDYUNIVERSE API running on http://localhost:${PORT}`);
  console.log(`📋  Dashboard: http://localhost:${PORT}/`);
  console.log(`📦  Batches:   http://localhost:${PORT}/API/batches`);
  console.log(`🔍  Search:    http://localhost:${PORT}/API/search?q=maths\n`);
});

module.exports = app;
      
