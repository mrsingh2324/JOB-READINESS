import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Papa from 'papaparse';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const CONFIG_FILE = path.join(DATA_DIR, 'configs.json');

const PORT = process.env.PORT || 3001;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const MONGODB_URI = process.env.MONGODB_URI;

// ---------- Mongoose models ----------
const studentSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    onlineAssessment: {
      status: { type: String, enum: ['qualified', 'not_qualified', 'pending'], default: 'pending' },
      score: Number,
      maxScore: { type: Number, default: 100 },
    },
    offlineExam: {
      status: { type: String, enum: ['qualified', 'not_qualified', 'pending'], default: 'pending' },
      codingScore: Number,
      codingMax: { type: Number, default: 120 },
      dsaMcqScore: Number,
      dsaMcqMax: { type: Number, default: 10 },
      technicalMcqScore: Number,
      technicalMcqMax: { type: Number, default: 30 },
      aptitudeScore: Number,
      aptitudeMax: { type: Number, default: 30 },
      coreCSScore: Number,
      coreCSMax: { type: Number, default: 40 },
      totalSectionsCleared: Number,
      examDate: String,
    },
    roleTrack: {
      mapped: { type: Boolean, default: false },
      assignedRole: String,
    },
    tr1: {
      attempted: Boolean,
      status: { type: String, enum: ['cleared', 'not_cleared', 'pending'], default: 'pending' },
      score: Number,
      maxScore: { type: Number, default: 100 },
      feedback: String,
      areasOfImprovement: [String],
      date: String,
    },
    tr2: {
      attempted: Boolean,
      status: { type: String, enum: ['cleared', 'not_cleared', 'pending'], default: 'pending' },
      score: Number,
      maxScore: { type: Number, default: 100 },
      feedback: String,
      areasOfImprovement: [String],
      date: String,
    },
    finalReport: {
      generated: Boolean,
      outcome: { type: String, enum: ['offered', 'rejected', 'in_progress', 'pending'], default: 'pending' },
      summary: String,
      whatWentWell: [String],
      whatWentWrong: [String],
      recommendations: [String],
    },
    lastUpdated: Date,
  },
  { timestamps: true }
);

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: String,
  updatedAt: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', studentSchema);
const Config = mongoose.model('Config', configSchema);

// ---------- Storage abstraction: Mongo when connected, JSON file otherwise ----------
let useMongo = false;

async function connectMongo() {
  if (!MONGODB_URI) {
    console.log('[storage] No MONGODB_URI set — using JSON file fallback.');
    return false;
  }
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('[storage] Connected to MongoDB.');
    return true;
  } catch (err) {
    console.warn('[storage] MongoDB connection failed, falling back to JSON file:', err.message);
    return false;
  }
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const file of [STUDENTS_FILE, CONFIG_FILE]) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, file.endsWith('students.json') ? '[]' : '{}');
    }
  }
}

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw || (file.endsWith('students.json') ? '[]' : '{}'));
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

const store = {
  async getStudent(uid) {
    if (useMongo) return Student.findOne({ uid }).lean();
    const all = await readJson(STUDENTS_FILE);
    return all.find((s) => s.uid === uid) || null;
  },
  async listStudents() {
    if (useMongo) return Student.find().sort({ uid: 1 }).lean();
    const all = await readJson(STUDENTS_FILE);
    return all.sort((a, b) => (a.uid > b.uid ? 1 : -1));
  },
  async upsertStudent(uid, doc) {
    if (useMongo) {
      return Student.findOneAndUpdate({ uid }, { ...doc, uid, lastUpdated: new Date() }, { upsert: true, new: true }).lean();
    }
    const all = await readJson(STUDENTS_FILE);
    const idx = all.findIndex((s) => s.uid === uid);
    const merged = { ...(idx >= 0 ? all[idx] : {}), ...doc, uid, lastUpdated: new Date().toISOString() };
    if (idx >= 0) all[idx] = merged;
    else all.push(merged);
    await writeJson(STUDENTS_FILE, all);
    return merged;
  },
  async patchStudent(uid, patch) {
    return store.upsertStudent(uid, patch);
  },
  async deleteStudent(uid) {
    if (useMongo) {
      const res = await Student.deleteOne({ uid });
      return res.deletedCount > 0;
    }
    const all = await readJson(STUDENTS_FILE);
    const idx = all.findIndex((s) => s.uid === uid);
    if (idx < 0) return false;
    all.splice(idx, 1);
    await writeJson(STUDENTS_FILE, all);
    return true;
  },
  async getConfig(key) {
    if (useMongo) {
      const c = await Config.findOne({ key }).lean();
      return c?.value || null;
    }
    const all = await readJson(CONFIG_FILE);
    return all[key] || null;
  },
  async setConfig(key, value) {
    if (useMongo) {
      await Config.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { upsert: true });
      return value;
    }
    const all = await readJson(CONFIG_FILE);
    all[key] = value;
    await writeJson(CONFIG_FILE, all);
    return value;
  },
};

// ---------- Sheet helpers ----------
function sheetIdFromUrl(url) {
  const m = String(url || '').match(/\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

function sheetCsvUrl(url) {
  const id = sheetIdFromUrl(url);
  if (!id) return null;
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=0`;
}

function normKey(k) {
  return String(k || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toBool(v) {
  const s = String(v ?? '').trim().toLowerCase();
  return ['yes', 'y', 'true', '1'].includes(s);
}

// Map various representations to qualified|not_qualified|pending
function toQualStatus(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return 'pending';
  if (['y', 'yes', 'qualified', 'true', '1', 'pass', 'passed'].includes(s)) return 'qualified';
  if (['n', 'no', 'not_qualified', 'notqualified', 'false', '0', 'fail', 'failed'].includes(s)) return 'not_qualified';
  return s;
}

// Map various representations to cleared|not_cleared|pending
function toClearStatus(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return 'pending';
  if (['y', 'yes', 'cleared', 'true', '1', 'pass', 'passed'].includes(s)) return 'cleared';
  if (['n', 'no', 'not_cleared', 'notcleared', 'false', '0', 'fail', 'failed'].includes(s)) return 'not_cleared';
  return s;
}

function pick(row, ...keys) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== '') return v;
  }
  return undefined;
}

function toNum(v) {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toList(v) {
  if (!v) return [];
  return String(v)
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean);
}

function rowToStudent(rowRaw) {
  const row = {};
  for (const k of Object.keys(rowRaw)) row[normKey(k)] = rowRaw[k];

  const uid = String(pick(row, 'uid', 'student_uid', 'studentuid', 'student_id') || '').trim();
  if (!uid) return null;

  const name = String(pick(row, 'name', 'student_name', 'full_name') || `Student ${uid}`).trim();

  const onlineStatus = toQualStatus(pick(row, 'online_status', 'online_qualified', 'online'));
  const offlineStatus = toQualStatus(pick(row, 'offline_status', 'offline_qualified', 'offline'));

  const tr1StatusRaw = pick(row, 'tr1_status', 'tr1_qualified_not', 'tr1_qualified', 'tr1');
  const tr2StatusRaw = pick(row, 'tr2_status', 'tr2_qualified_not', 'tr2_qualified', 'tr2');

  return {
    uid,
    name,
    onlineAssessment: {
      status: onlineStatus,
      score: toNum(pick(row, 'online_score')),
      maxScore: toNum(pick(row, 'online_max')) ?? 100,
    },
    offlineExam: {
      status: offlineStatus,
      codingScore: toNum(pick(row, 'coding_score')),
      codingMax: toNum(pick(row, 'coding_max')) ?? 120,
      dsaMcqScore: toNum(pick(row, 'dsa_mcq_score')),
      dsaMcqMax: toNum(pick(row, 'dsa_mcq_max')) ?? 10,
      technicalMcqScore: toNum(pick(row, 'technical_mcq_score')),
      technicalMcqMax: toNum(pick(row, 'technical_mcq_max')) ?? 30,
      aptitudeScore: toNum(pick(row, 'aptitude_score')),
      aptitudeMax: toNum(pick(row, 'aptitude_max')) ?? 30,
      coreCSScore: toNum(pick(row, 'core_cs_score')),
      coreCSMax: toNum(pick(row, 'core_cs_max')) ?? 40,
      totalSectionsCleared: toNum(pick(row, 'sections_cleared')),
      examDate: pick(row, 'exam_date') || '',
    },
    roleTrack: {
      mapped: toBool(pick(row, 'role_mapped')),
      assignedRole: pick(row, 'assigned_role') || '',
    },
    tr1: {
      attempted: tr1StatusRaw != null && String(tr1StatusRaw).trim() !== '' ? true : toBool(pick(row, 'tr1_attempted')),
      status: toClearStatus(tr1StatusRaw),
      score: toNum(pick(row, 'tr1_score')),
      maxScore: toNum(pick(row, 'tr1_max')) ?? 100,
      feedback: pick(row, 'tr1_feedback', 'tr1_feedback_remarks', 'tr1_remarks') || '',
      areasOfImprovement: toList(pick(row, 'tr1_areas', 'areas_of_improvement_after_tr1', 'tr1_improvement')),
      date: pick(row, 'tr1_date') || '',
    },
    tr2: {
      attempted: tr2StatusRaw != null && String(tr2StatusRaw).trim() !== '' ? true : toBool(pick(row, 'tr2_attempted')),
      status: toClearStatus(tr2StatusRaw),
      score: toNum(pick(row, 'tr2_score')),
      maxScore: toNum(pick(row, 'tr2_max')) ?? 100,
      feedback: pick(row, 'tr2_feedback', 'tr2_feedback_remarks', 'tr2_remarks') || '',
      areasOfImprovement: toList(pick(row, 'tr2_areas', 'areas_of_improvement_after_tr2', 'tr2_improvement')),
      date: pick(row, 'tr2_date') || '',
    },
    finalReport: {
      generated: toBool(pick(row, 'final_report')),
      outcome: pick(row, 'final_outcome') || 'pending',
      summary: pick(row, 'final_summary') || '',
      whatWentWell: toList(pick(row, 'what_went_well')),
      whatWentWrong: toList(pick(row, 'what_went_wrong')),
      recommendations: toList(pick(row, 'recommendations')),
    },
  };
}

async function fetchSheetRows(sheetUrl) {
  const csvUrl = sheetCsvUrl(sheetUrl);
  if (!csvUrl) throw new Error('Invalid Google Sheet URL — could not extract sheet ID.');
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Failed to fetch sheet (${res.status}). Make sure the sheet is shared publicly.`);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) console.warn('[sheet] CSV parse warnings:', parsed.errors.slice(0, 3));
  return parsed.data || [];
}

// ---------- Express app ----------
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function requireAdmin(req, res, next) {
  const key = req.body?.adminKey || req.query?.adminKey;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/', (_req, res) => res.json({ status: 'ok', storage: useMongo ? 'mongo' : 'json' }));

app.get('/api/student/:uid', async (req, res) => {
  try {
    const student = await store.getStudent(req.params.uid.trim());
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config/sheet-url', requireAdmin, async (_req, res) => {
  const sheetUrl = await store.getConfig('sheetUrl');
  res.json({ sheetUrl: sheetUrl || process.env.DEFAULT_SHEET_URL || '' });
});

app.post('/api/config/sheet-url', requireAdmin, async (req, res) => {
  const { sheetUrl } = req.body;
  await store.setConfig('sheetUrl', sheetUrl || '');
  res.json({ ok: true, sheetUrl });
});

app.post('/api/sheet/preview', requireAdmin, async (req, res) => {
  try {
    const rows = await fetchSheetRows(req.body.sheetUrl);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    res.json({ columns, sample: rows.slice(0, 3), total: rows.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/sheet/sync', requireAdmin, async (req, res) => {
  try {
    const rows = await fetchSheetRows(req.body.sheetUrl);
    let success = 0;
    const errors = [];
    for (const raw of rows) {
      try {
        const doc = rowToStudent(raw);
        if (!doc) {
          errors.push({ row: raw, error: 'Missing UID' });
          continue;
        }
        await store.upsertStudent(doc.uid, doc);
        success += 1;
      } catch (e) {
        errors.push({ row: raw, error: e.message });
      }
    }
    res.json({ success, failed: errors.length, errors: errors.slice(0, 10) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/students', requireAdmin, async (_req, res) => {
  const list = await store.listStudents();
  res.json(
    list.map((s) => ({
      uid: s.uid,
      name: s.name,
      onlineStatus: s.onlineAssessment?.status || 'pending',
      offlineStatus: s.offlineExam?.status || 'pending',
      roleMapped: !!s.roleTrack?.mapped,
      tr1Status: s.tr1?.status || 'pending',
      tr2Status: s.tr2?.status || 'pending',
      finalOutcome: s.finalReport?.outcome || 'pending',
      lastUpdated: s.lastUpdated,
    }))
  );
});

app.patch('/api/admin/student/:uid', requireAdmin, async (req, res) => {
  try {
    const { adminKey, ...patch } = req.body;
    const updated = await store.patchStudent(req.params.uid, patch);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/student/:uid', requireAdmin, async (req, res) => {
  const ok = await store.deleteStudent(req.params.uid);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- Boot ----------
(async () => {
  await ensureDataFiles();
  useMongo = await connectMongo();
  app.listen(PORT, () => console.log(`[server] listening on :${PORT} (storage=${useMongo ? 'mongo' : 'json'})`));
})();
