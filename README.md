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

## Deployment

- Backend → Render (free tier). Set `MONGODB_URI`, `ADMIN_KEY`, `PORT=3001`.
- Frontend → Vercel. Set `VITE_API_URL` to the Render URL.
- MongoDB Atlas → free cluster, whitelist `0.0.0.0/0`, use SRV connection string.

## Architecture notes

- **Storage abstraction:** `backend/server.js` exposes a single `store` object. When `MONGODB_URI` is set and reachable, it uses Mongoose; otherwise it reads/writes `backend/data/{students,configs}.json`. The same API works either way.
- **Role tracks** (Associate SE, Frontend, SDE) are computed client-side from offline scores. Edit `frontend/src/roleTracks.js` to add tracks or change thresholds.
- **Column normalization:** sheet headers are lowercased and spaces/hyphens converted to underscores, so minor header variations are tolerated.
