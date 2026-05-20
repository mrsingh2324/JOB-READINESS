import React from 'react';

export default function HeroCard({ student }) {
  const name = student.name || 'there';
  const onlineQ = student.onlineAssessment?.status === 'qualified';
  const offlineQ = student.offlineExam?.status === 'qualified';
  const roleMapped = student.roleTrack?.mapped;

  let title;
  if (offlineQ) title = `You cleared the Offline Placement Exam, ${name} — your role track is active.`;
  else if (onlineQ) title = `You cleared the Online Assessment, ${name} — offline exam is next.`;
  else title = `Welcome, ${name} — your placement journey starts here.`;

  return (
    <div className="hero">
      <div className="check">✓</div>
      <div style={{ flex: 1 }}>
        <h1 className="hero-title">{title}</h1>
        <p className="lead">
          You're among the few who've reached this stage. Your profile is being routed to the next round of placement opportunities.
        </p>
        <div className="pills">
          <span className={`pill ${onlineQ ? 'green' : 'gray'}`}>
            <span className="dot" /> Online — {onlineQ ? 'Qualified' : 'Pending'}
          </span>
          <span className="arrow">›</span>
          <span className={`pill ${offlineQ ? 'green' : 'gray'}`}>
            <span className="dot" /> Offline — {offlineQ ? 'Qualified' : 'Pending'}
          </span>
          <span className="arrow">›</span>
          <span className={`pill ${roleMapped ? 'blue' : 'gray'}`}>
            <span className="dot" /> Role track {roleMapped ? 'active' : 'pending'}
          </span>
        </div>
      </div>
    </div>
  );
}
