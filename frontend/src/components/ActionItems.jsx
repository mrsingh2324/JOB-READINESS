import React from 'react';

const ICONS = ['📅', '📝', '📋', '💬', '🎯', '⏱️', '🔗'];

// Allow rich items: "Title — description" or "Title | description"
function parseItem(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^([^|—]+?)\s*[|—]\s*(.+)$/);
  if (m) return { title: m[1].trim(), desc: m[2].trim() };
  return { title: s, desc: '' };
}

export default function ActionItems({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="card">
      <div className="section-label">Action Items</div>
      <h2 className="section-title">What to do this week</h2>
      <p className="muted" style={{ marginTop: -6, marginBottom: 14 }}>
        A few quick items to get you interview-ready. Complete them before your next round is scheduled.
      </p>
      <div className="actions-list">
        {items.map((raw, i) => {
          const { title, desc } = parseItem(raw);
          return (
            <div className={`action-row ${i === 0 ? 'action-row--featured' : ''}`} key={i}>
              <div className="action-icon">{ICONS[i % ICONS.length]}</div>
              <div className="action-body">
                <div className="action-title">{title}</div>
                {desc && <div className="action-sub">{desc}</div>}
              </div>
              <div className="action-chev">›</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
