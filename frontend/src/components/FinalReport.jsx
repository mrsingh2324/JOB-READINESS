import React from 'react';

export default function FinalReport({ report }) {
  if (!report || !report.generated) return null;
  const outcome = report.outcome || 'pending';
  let pillCls = 'gray';
  let label = 'In Progress';
  if (outcome === 'offered') { pillCls = 'green'; label = 'Offered'; }
  else if (outcome === 'rejected') { pillCls = 'red'; label = 'Rejected'; }
  else if (outcome === 'in_progress') { pillCls = 'blue'; label = 'In Progress'; }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div className="section-label">Final Report</div>
          <h2 className="section-title">Outcome</h2>
        </div>
        <span className={`pill ${pillCls}`}>{label}</span>
      </div>
      {report.summary && <p className="lead">{report.summary}</p>}
      <div className="two-col">
        <div className="col well">
          <h4 style={{ color: '#1c6e58' }}>What went well</h4>
          <ul>{(report.whatWentWell || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
        <div className="col wrong">
          <h4 style={{ color: '#a8431f' }}>Areas to work on</h4>
          <ul>{(report.whatWentWrong || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      </div>
      {Array.isArray(report.recommendations) && report.recommendations.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 18 }}>Recommendations</div>
          <ul style={{ marginTop: 6 }}>
            {report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
