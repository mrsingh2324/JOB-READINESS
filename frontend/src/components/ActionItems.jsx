import React from 'react';

const ICONS = ['📘', '📝', '📋', '💬', '🎯', '⏱️', '🔗'];

export default function ActionItems({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="card">
      <div className="section-label">Action Items</div>
      <h2 className="section-title">What to do next</h2>
      <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
        A few quick items to keep your placement journey moving.
      </p>
      <div className="actions-list">
        {items.map((it, i) => (
          <div className="action-row" key={i}>
            <div className="action-icon">{ICONS[i % ICONS.length]}</div>
            <div className="action-body">
              <div className="action-title">{it}</div>
            </div>
            <div className="action-chev">›</div>
          </div>
        ))}
      </div>
    </div>
  );
}
