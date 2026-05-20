const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  getStudent: (uid) => req(`/api/student/${encodeURIComponent(uid)}`),
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
