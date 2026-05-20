const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Render free-tier instances spin down after inactivity. The first request
// after sleep hits Render's edge with no server, returning a CORS-less 404.
// We retry transient failures so the user just sees a slow-but-successful load.
async function req(path, opts = {}, attempt = 0) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });
    // Distinguish cold-start gateway 404 (plain-text "Not Found" from Render edge)
    // from legitimate app 404s (JSON body with error field).
    const ct = res.headers.get('content-type') || '';
    if (res.status === 404 && !ct.includes('application/json') && attempt < 6) {
      await new Promise((r) => setTimeout(r, 5000));
      return req(path, opts, attempt + 1);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  } catch (err) {
    const isNetworkErr = err instanceof TypeError || /failed to fetch|network/i.test(err.message || '');
    if (isNetworkErr && attempt < 6) {
      await new Promise((r) => setTimeout(r, 5000));
      return req(path, opts, attempt + 1);
    }
    throw err;
  }
}

export function isWaking(err) {
  return err && /failed to fetch|network/i.test(err.message || '');
}

export const api = {
  getStudent: (uid) => req(`/api/student/${encodeURIComponent(uid)}`),
  submitFeedback: (uid, rating) =>
    req(`/api/student/${encodeURIComponent(uid)}/feedback`, { method: 'POST', body: JSON.stringify({ rating }) }),
  admin: {
    getSheetUrl: (adminKey) => req(`/api/config/sheet-url?adminKey=${encodeURIComponent(adminKey)}`),
    setSheetUrl: (adminKey, sheetUrl) =>
      req(`/api/config/sheet-url`, { method: 'POST', body: JSON.stringify({ adminKey, sheetUrl }) }),
    preview: (adminKey, sheetUrl) =>
      req(`/api/sheet/preview`, { method: 'POST', body: JSON.stringify({ adminKey, sheetUrl }) }),
    sync: (adminKey, sheetUrl) =>
      req(`/api/sheet/sync`, { method: 'POST', body: JSON.stringify({ adminKey, sheetUrl }) }),
    list: (adminKey) => req(`/api/admin/students?adminKey=${encodeURIComponent(adminKey)}`),
    remove: (adminKey, uid) =>
      req(`/api/admin/student/${encodeURIComponent(uid)}?adminKey=${encodeURIComponent(adminKey)}`, { method: 'DELETE' }),
  },
};
