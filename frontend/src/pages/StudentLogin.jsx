import React, { useState } from 'react';

export default function StudentLogin({ onSubmit, error, loading }) {
  const [uid, setUid] = useState('');

  function handle(e) {
    e.preventDefault();
    if (!uid.trim()) return;
    onSubmit(uid);
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <p className="brand">Job Readiness</p>
        <p className="brand-sub">
          Enter your Student UID to view your placement status, scores, and feedback.
        </p>
        <form onSubmit={handle}>
          <input
            type="text"
            placeholder="e.g. NW2024001"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            autoFocus
          />
          {error && <div className="error">{error}</div>}
          {loading && <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Loading… first request after idle can take up to 50s.</div>}
          <div style={{ marginTop: 14 }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'View My Results →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
