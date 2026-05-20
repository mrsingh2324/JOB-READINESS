import React from 'react';
import { ROLE_TRACKS, evaluateTrack } from '../roleTracks.js';

export default function RoleTracks({ student }) {
  const offline = student.offlineExam || {};
  if (offline.codingScore == null && offline.aptitudeScore == null && offline.dsaMcqScore == null) return null;

  const evaluated = ROLE_TRACKS.map((t) => ({ track: t, ...evaluateTrack(t, offline) }));

  return (
    <div className="card">
      <div className="section-label">Where You're Headed</div>
      <h2 className="section-title">Your Role Tracks</h2>
      <div className="tracks">
        {evaluated.map(({ track, qualified, totalGap, reqs }) => (
          <div key={track.id} className={`track ${qualified ? 'qualified' : ''}`}>
            <div className="track-head">
              <div className="track-name">{track.name}</div>
              {qualified ? (
                <span className="pill blue" style={{ background: '#3b6ef0', color: '#fff', borderColor: '#3b6ef0' }}>QUALIFIED</span>
              ) : (
                <span className="pill amber">{totalGap.toFixed(2)} MARKS AWAY</span>
              )}
            </div>
            {reqs.map((r, i) => (
              <div key={i} className={`track-req ${r.met ? 'met' : 'gap'}`}>
                <span style={{ width: 16, color: r.met ? '#1D9E75' : '#c97a1f' }}>{r.met ? '✓' : '○'}</span>
                <span className="label">{r.label} ≥ {r.min}/{offline[r.max] ?? '—'}</span>
                <span className="val">{r.met ? `${r.value} ✓` : `+${r.gap.toFixed(2)} to go`}</span>
              </div>
            ))}
            <div className="track-foot">{track.foot}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
