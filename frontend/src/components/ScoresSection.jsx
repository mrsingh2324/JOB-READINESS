import React from 'react';

const SECTIONS = [
  { key: 'coding', label: 'Coding Exam', icon: '💻', scoreField: 'codingScore', maxField: 'codingMax', cutoff: 25,
    desc: 'First-round filter at Accenture, Cognizant, Oracle and most service MNCs.' },
  { key: 'dsa', label: 'DSA MCQs', icon: '🧩', scoreField: 'dsaMcqScore', maxField: 'dsaMcqMax', cutoff: 4,
    desc: 'Shortlisting filter at product companies and service MNCs.' },
  { key: 'tmcq', label: 'Technical MCQs', icon: '⚙️', scoreField: 'technicalMcqScore', maxField: 'technicalMcqMax', cutoff: 18,
    desc: 'Written test standard used by companies hiring for frontend and full-stack roles.' },
  { key: 'apt', label: 'Aptitude (Verbal, Logical, Quantitative)', icon: '📊', scoreField: 'aptitudeScore', maxField: 'aptitudeMax', cutoff: 18,
    desc: 'TCS, Infosys, Wipro, Goldman Sachs — every major IT company screens on aptitude.' },
  { key: 'cs', label: 'Core CS Subjects', icon: '📚', scoreField: 'coreCSScore', maxField: 'coreCSMax', cutoff: 10,
    desc: 'OS, DBMS, networking — technical round filter at product companies and GCCs.' },
];

export default function ScoresSection({ student }) {
  const offline = student.offlineExam || {};
  if (offline.status === 'pending' && offline.codingScore == null) return null;

  const cleared = SECTIONS.filter((s) => Number(offline[s.scoreField] ?? 0) >= s.cutoff).length;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="section-label">Your Performance</div>
          <h2 className="section-title">Your Scores</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700 }}>
            <strong>{cleared} of {SECTIONS.length}</strong> <span className="muted">sections cleared</span>
          </div>
          <div className="muted">{offline.examDate || ''}</div>
        </div>
      </div>

      {SECTIONS.map((s) => {
        const score = Number(offline[s.scoreField] ?? 0);
        const max = Number(offline[s.maxField] ?? 100);
        const isCleared = score >= s.cutoff;
        const pct = Math.min(100, (score / max) * 100);
        const cutoffPct = Math.min(100, (s.cutoff / max) * 100);
        return (
          <div key={s.key} className={`score-row ${isCleared ? 'cleared' : ''}`}>
            <div className="score-head">
              <div className="score-name">
                <span>{s.icon}</span> {s.label}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className={`score-val ${isCleared ? '' : 'bad'}`}>
                  {score}<span style={{ color: '#999', fontWeight: 500 }}>/{max}</span>
                </div>
                {isCleared ? (
                  <span className="pill green">✓ Cleared</span>
                ) : (
                  <span className="pill gray">cutoff {s.cutoff}</span>
                )}
              </div>
            </div>
            <div className="bar-wrap">
              <div className={`bar-fill ${isCleared ? '' : 'bad'}`} style={{ width: `${pct}%` }} />
              <div className="bar-cutoff" style={{ left: `${cutoffPct}%` }}>
                <span className="lbl">{s.cutoff}</span>
              </div>
            </div>
            <div className="score-desc">{s.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
