import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

function StatusBadge({ value, type }) {
  const goodValues = { online: 'qualified', offline: 'qualified', tr: 'cleared', final: 'offered' };
  const badValues = { online: 'not_qualified', offline: 'not_qualified', tr: 'not_cleared', final: 'rejected' };
  let cls = 'pill gray';
  if (value === goodValues[type]) cls = 'pill green';
  else if (value === badValues[type]) cls = 'pill red';
  return <span className={cls}>{value || 'pending'}</span>;
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('sync');
  const [sheetUrl, setSheetUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [students, setStudents] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [waking, setWaking] = useState(false);

  async function login(e) {
    e?.preventDefault?.();
    setAuthError('');
    setWaking(true);
    try {
      const { sheetUrl } = await api.admin.getSheetUrl(adminKey);
      setSheetUrl(sheetUrl || '');
      localStorage.setItem('adminKey', adminKey);
      setAuthed(true);
      loadStudents();
    } catch (e) {
      setAuthError(e.message || 'Invalid admin key');
    } finally {
      setWaking(false);
    }
  }

  async function loadStudents() {
    try {
      const list = await api.admin.list(adminKey);
      setStudents(list);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    if (adminKey && !authed) login();
    // eslint-disable-next-line
  }, []);

  async function saveSheetUrl() {
    setMsg(''); setErr(''); setBusy(true);
    try {
      await api.admin.setSheetUrl(adminKey, sheetUrl);
      setMsg('Sheet URL saved.');
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  async function doPreview() {
    setMsg(''); setErr(''); setPreview(null); setBusy(true);
    try {
      const data = await api.admin.preview(adminKey, sheetUrl);
      setPreview(data);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  async function doSync() {
    setMsg(''); setErr(''); setSyncResult(null); setBusy(true);
    try {
      const data = await api.admin.sync(adminKey, sheetUrl);
      setSyncResult(data);
      await loadStudents();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  async function doDelete(uid) {
    if (!confirm(`Delete student ${uid}?`)) return;
    try {
      await api.admin.remove(adminKey, uid);
      await loadStudents();
    } catch (e) { setErr(e.message); }
  }

  if (!authed) {
    return (
      <div className="login-wrap">
        <div className="card login-card">
          <p className="brand">Admin Login</p>
          <p className="brand-sub">Enter the ADMIN_KEY configured on the backend.</p>
          <form onSubmit={login}>
            <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} autoFocus />
            {authError && <div className="error">{authError}</div>}
            {waking && <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Waking up the backend… (first request after idle can take up to 50s on free tier)</div>}
            <div style={{ marginTop: 14 }}>
              <button type="submit" disabled={waking}>{waking ? 'Signing in…' : 'Sign in'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const totals = {
    total: students.length,
    online: students.filter((s) => s.onlineStatus === 'qualified').length,
    offline: students.filter((s) => s.offlineStatus === 'qualified').length,
    tr1: students.filter((s) => s.tr1Status === 'cleared').length,
  };

  return (
    <div className="container">
      <div className="stats">
        <div className="stat-card"><div className="num">{totals.total}</div><div className="lbl">Total Students</div></div>
        <div className="stat-card"><div className="num">{totals.online}</div><div className="lbl">Online Qualified</div></div>
        <div className="stat-card"><div className="num">{totals.offline}</div><div className="lbl">Offline Qualified</div></div>
        <div className="stat-card"><div className="num">{totals.tr1}</div><div className="lbl">TR1 Cleared</div></div>
      </div>

      <div className="tabs">
        <button className={tab === 'sync' ? 'active' : ''} onClick={() => setTab('sync')}>Sheet Sync</button>
        <button className={tab === 'students' ? 'active' : ''} onClick={() => { setTab('students'); loadStudents(); }}>All Students</button>
      </div>

      {(msg || err) && (
        <div className="card" style={{ borderColor: err ? '#f5d6c5' : '#d8efdf', background: err ? '#fdf3ee' : '#f1faf4', marginBottom: 16 }}>
          {err ? <span style={{ color: 'var(--red)' }}>{err}</span> : <span style={{ color: '#1c6e58' }}>{msg}</span>}
        </div>
      )}

      {tab === 'sync' && (
        <div className="card">
          <div className="section-label">Data Source</div>
          <h2 className="section-title">Google Sheet</h2>
          <p className="muted">Paste the public Google Sheet URL. The sheet must be shared as "Anyone with the link can view".</p>

          <div className="row-input">
            <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={saveSheetUrl} disabled={busy}>Save URL</button>
            <button className="secondary" onClick={doPreview} disabled={busy || !sheetUrl}>Preview Sheet</button>
            <button onClick={doSync} disabled={busy || !sheetUrl}>Push to MongoDB</button>
          </div>

          {preview && (
            <div style={{ marginTop: 20 }}>
              <div className="section-label">Preview</div>
              <p className="muted">{preview.total} rows total · {preview.columns.length} columns</p>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr>{preview.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {preview.sample.map((r, i) => (
                      <tr key={i}>{preview.columns.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {syncResult && (
            <div style={{ marginTop: 16 }}>
              <span className="pill green">✓ {syncResult.success} rows synced</span>{' '}
              {syncResult.failed > 0 && <span className="pill red">{syncResult.failed} failed</span>}
            </div>
          )}
        </div>
      )}

      {tab === 'students' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>All Students</h2>
            <button className="secondary" onClick={loadStudents}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>UID</th><th>Name</th><th>Online</th><th>Offline</th><th>Role</th><th>TR1</th><th>TR2</th><th>Final</th><th>Updated</th><th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.uid}>
                    <td><strong>{s.uid}</strong></td>
                    <td>{s.name}</td>
                    <td><StatusBadge value={s.onlineStatus} type="online" /></td>
                    <td><StatusBadge value={s.offlineStatus} type="offline" /></td>
                    <td>{s.roleMapped ? <span className="pill blue">mapped</span> : <span className="pill gray">no</span>}</td>
                    <td><StatusBadge value={s.tr1Status} type="tr" /></td>
                    <td><StatusBadge value={s.tr2Status} type="tr" /></td>
                    <td><StatusBadge value={s.finalOutcome} type="final" /></td>
                    <td className="muted">{s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString() : '—'}</td>
                    <td><button className="danger" onClick={() => doDelete(s.uid)}>Delete</button></td>
                  </tr>
                ))}
                {!students.length && (
                  <tr><td colSpan="10" className="muted" style={{ textAlign: 'center', padding: 24 }}>No students yet. Sync from a Google Sheet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
