import React from 'react';

export default function TRCard({ title, round }) {
  if (!round || !round.attempted) return null;
  const status = round.status || 'pending';
  const score = Number(round.score ?? 0);
  const max = Number(round.maxScore ?? 100);
  const pct = Math.min(100, (score / max) * 100);
  const cleared = status === 'cleared';
  const pillCls = cleared ? 'green' : status === 'not_cleared' ? 'red' : 'gray';
  const pillLbl = cleared ? '✓ Cleared' : status === 'not_cleared' ? 'Not Cleared' : 'Pending';

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="section-label">Interview Round</div>
          <h2 className="section-title">{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={`pill ${pillCls}`}>{pillLbl}</span>
          {round.date && <span className="muted">{round.date}</span>}
        </div>
      </div>

      <div className="score-head" style={{ marginTop: 6 }}>
        <div className="score-name">Score</div>
        <div className="score-val">{score}<span style={{ color: '#999', fontWeight: 500 }}>/{max}</span></div>
      </div>
      <div className="bar-wrap">
        <div className={`bar-fill ${cleared ? '' : 'bad'}`} style={{ width: `${pct}%` }} />
      </div>

      {round.feedback && (
        <div className="tr-feedback">{round.feedback}</div>
      )}

      {Array.isArray(round.areasOfImprovement) && round.areasOfImprovement.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 16 }}>Areas to Improve</div>
          <div className="areas">
            {round.areasOfImprovement.map((a, i) => (
              <span key={i} className="pill amber">{a}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
