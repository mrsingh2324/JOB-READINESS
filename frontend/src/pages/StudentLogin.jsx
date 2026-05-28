import React, { useState } from 'react';

export default function StudentLogin({ onSubmit, error, loading }) {
  const [identifier, setIdentifier] = useState('');

  function handle(e) {
    e.preventDefault();
    if (!identifier.trim()) return;
    onSubmit(identifier);
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <p className="brand">Job Readiness</p>
        <p className="brand-sub">
          Enter your mobile number to view your placement status, scores, and feedback.
        </p>
        <form onSubmit={handle}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 6281702728"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
