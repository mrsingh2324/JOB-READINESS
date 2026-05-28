# Placement App — Job Readiness Tracker

Full-stack student placement tracker per the [PRD](../PRD.txt). Two interfaces:
- `/` — student portal (enter UID, view journey + scores + feedback)
- `/admin` — password-protected admin (Google Sheet sync to DB)

## Quick start (local)

### 1. Backend

```bash
cd backend
cp .env.example .env       # edit ADMIN_KEY; MONGODB_URI optional
npm install
npm run dev
```

Server runs on `http://localhost:3001`. If `MONGODB_URI` is missing or unreachable, the backend automatically falls back to a local JSON file at `backend/data/students.json` — useful for dev without Atlas.

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

Open `http://localhost:5173`. Admin is at `http://localhost:5173/admin` (or `/?admin=1`).

## Loading data from a Google Sheet

1. Open `sample-sheet-template.csv` — copy headers + sample rows into a new Google Sheet.
2. Share → Anyone with the link → Viewer.
3. In the Admin dashboard:
   - Paste the sheet URL → **Save URL**
   - **Preview Sheet** to verify columns
   - **Push to MongoDB** to sync

Try UID `NW2024001` on the student portal to see a fully-qualified student. Other sample UIDs (`NW2024002`–`NW2024005`) cover offered, rejected, partial, and pending states.

## Showing HTML interview reports

The workbook tab `Reports` can contain `Candidate UID`, `Candidate Name`, `Number`, and a local HTML file path. Browser users cannot open `file:///Users/...` paths from an online app, so the files must be moved into the app or uploaded to storage.

For this local setup, the reports from `Bucket A.xlsx` were copied into:

```text
backend/public/reports/
```

Their UID/mobile mapping is stored in:

```text
backend/reports.json
```

The backend serves those files at `/reports/<file>.html`, and the student login accepts either a mobile number or a Student UID. A mobile number that exists in `backend/reports.json` opens the HTML report directly inside the app.

For production, use the same model: either deploy `backend/public/reports` with the backend, or upload the HTML files to a storage/CDN service and store those HTTPS URLs in the manifest/database. Do not use `file://` links in production.

## Deployment

- Backend → Render (free tier). Set `MONGODB_URI`, `ADMIN_KEY`, `PORT=3001`.
- Frontend → Vercel. Set `VITE_API_URL` to the Render URL.
- MongoDB Atlas → free cluster, whitelist `0.0.0.0/0`, use SRV connection string.

## Architecture notes

- **Storage abstraction:** `backend/server.js` exposes a single `store` object. When `MONGODB_URI` is set and reachable, it uses Mongoose; otherwise it reads/writes `backend/data/{students,configs}.json`. The same API works either way.
- **Role tracks** (Associate SE, Frontend, SDE) are computed client-side from offline scores. Edit `frontend/src/roleTracks.js` to add tracks or change thresholds.
- **Column normalization:** sheet headers are lowercased and spaces/hyphens converted to underscores, so minor header variations are tolerated.
