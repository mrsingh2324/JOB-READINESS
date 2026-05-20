import React from 'react';

export default function JourneyStepper({ student }) {
  const onlineQ = student.onlineAssessment?.status === 'qualified';
  const offlineQ = student.offlineExam?.status === 'qualified';
  const roleMapped = !!student.roleTrack?.mapped;
  const interviewsActive = !!student.tr1?.attempted || roleMapped;

  const steps = [
    { label: 'Placement Online Assessment', sub: 'Completed', stat: onlineQ ? 'QUALIFIED' : 'PENDING', done: onlineQ },
    { label: 'Offline Placement Exam', sub: 'Completed', stat: offlineQ ? 'QUALIFIED' : 'PENDING', done: offlineQ },
    { label: 'Role Recommendation', sub: 'Role track mapped', stat: roleMapped ? 'MAPPED' : 'PENDING', done: roleMapped },
    { label: 'Interviews', sub: 'Company-style rounds', stat: interviewsActive ? 'ACTIVE' : 'PENDING', done: false, active: interviewsActive },
  ];

  // Determine where the green connector continues
  const connectedDone = steps.map((s) => s.done);

  return (
    <div className="card">
      <div className="section-label">Where You Are</div>
      <h2 className="section-title">Your Journey to Placement</h2>
      <div className="stepper">
        {steps.map((s, i) => {
          const cls = ['step'];
          if (connectedDone[i]) cls.push('connected-done');
          let circleCls = 'circle';
          if (s.done) circleCls += ' done';
          else if (s.active) circleCls += ' active';
          let statCls = 'stat gray';
          if (s.done) statCls = 'stat green';
          else if (s.active) statCls = 'stat blue';
          return (
            <div key={i} className={cls.join(' ')}>
              <div className={circleCls}>{s.done ? '✓' : s.active ? '' : i + 1}</div>
              <div className="label">{s.label}</div>
              <div className="sub">{s.sub}</div>
              <div className={statCls}>{s.stat}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
