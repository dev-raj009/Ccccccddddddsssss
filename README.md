# 🕷️ SpidyUniverse API

A local REST API to access all CDS / NDA / AFCAT / CAPF batch video data from SpidyUniverse and CDSJourney.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Open browser
open http://localhost:3000
```

---

## 📡 API Endpoints

### `GET /API/batches`
Returns all 12 batches list.

**Response:**
```json
{
  "success": true,
  "total": 12,
  "batches": [
    { "id": 78, "name": "NDA-2 2025 Full Batch", "price": "Free", "source": "spidyuniverse" },
    ...
  ]
}
```

---

### `GET /API/batch/:id`
Full batch detail — all videos grouped by subject.

**Example:** `/API/batch/78`

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": 78,
    "batch_name": "NDA-2 2025 Full Batch",
    "source_platform": "spidyuniverse",
    "total_videos": 339,
    "total_subjects": 16,
    "subjects": ["Maths", "English Grammar", ...],
    "videos_by_subject": {
      "Maths": [ { "index": 1, "subject": "Maths", "title": "Logarithm Class 1", "url": "https://..." } ]
    },
    "videos": [...]
  }
}
```

---

### `GET /API/subjects/:id`
Subject-wise video count for a batch.

**Example:** `/API/subjects/39`

```json
{
  "total_subjects": 12,
  "subjects": [
    { "name": "Indian Geography", "video_count": 19 },
    ...
  ]
}
```

---

### `GET /API/search?q=<query>&batch_id=<optional>`
Search across all videos.

**Example:** `/API/search?q=percentage`  
**Example:** `/API/search?q=geography&batch_id=78`

```json
{
  "query": "percentage",
  "total_results": 8,
  "results": [
    {
      "batch_id": 78,
      "batch_name": "...",
      "subject": "Maths",
      "title": "Percentage Class 1",
      "url": "https://zoom.us/..."
    }
  ]
}
```

---

### `GET /API/stats`
Global statistics.

```json
{
  "stats": {
    "total_batches": 12,
    "total_videos": 851,
    "batches_by_platform": {
      "spidyuniverse": 4,
      "cdsjourney": 8
    }
  }
}
```

---

## 📦 Batch IDs Reference

| ID  | Batch Name                                  | Platform      | Videos |
|-----|---------------------------------------------|---------------|--------|
| 78  | NDA-2 2025 Full Batch                       | SpidyUniverse | 339    |
| 56  | AFCAT-2 2025 Batch                          | SpidyUniverse | 65     |
| 120 | Maths Classes (CDS-2 2025)                  | SpidyUniverse | 92     |
| 112 | CDS-2 2025 Batch                            | SpidyUniverse | 233    |
| 39  | CAPF Paper 1 + Paper 2 Delta (CAPF 2026)    | CDSJourney    | 216    |
| 40  | CAPF Paper 2 Delta (CAPF 2026)              | CDSJourney    | 54     |
| 43  | ECHO BATCH (AFCAT 2 2026)                   | CDSJourney    | 24     |
| 44  | GOLF OTA BATCH (CDS-2 2026)                 | CDSJourney    | 0      |
| 45  | HOTEL BATCH (NDA-2 2026)                    | CDSJourney    | 0      |
| 46  | GOLF MATH BATCH (CDS-2 2026)                | CDSJourney    | 0      |
| 47  | FOXTROT BATCH (AFCAT 2 2026)                | CDSJourney    | 0      |
| 28  | Example batch 1 - Testing                   | CDSJourney    | 2      |

---

## 🗂️ Project Structure

```
spidyuniverse-api/
├── api/
│   └── server.js          ← Express server (all routes)
├── data/
│   ├── batches.json       ← All batches list
│   └── batch_details.json ← Full video data per batch
├── public/
│   └── index.html         ← Dashboard UI
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Data:** Static JSON (pre-extracted from HTML/JSON sources)
- **Dashboard:** Vanilla HTML/CSS/JS

---

*Built for SpidyUniverse — Your hub for defence exam preparation 🕷️*
