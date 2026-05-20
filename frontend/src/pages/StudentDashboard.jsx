import React from 'react';
import HeroCard from '../components/HeroCard.jsx';
import JourneyStepper from '../components/JourneyStepper.jsx';
import ScoresSection from '../components/ScoresSection.jsx';
import RoleTracks from '../components/RoleTracks.jsx';
import TRCard from '../components/TRCard.jsx';
import FinalReport from '../components/FinalReport.jsx';
import ActionItems from '../components/ActionItems.jsx';

export default function StudentDashboard({ student, onBack }) {
  return (
    <div className="container stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="ghost" onClick={onBack}>← Back</button>
        <div className="muted">UID: {student.uid}</div>
      </div>
      <HeroCard student={student} />
      <JourneyStepper student={student} />
      <ScoresSection student={student} />
      <RoleTracks student={student} />
      <TRCard title="Technical Round 1" round={student.tr1} />
      <TRCard title="Technical Round 2" round={student.tr2} />
      <FinalReport report={student.finalReport} />
      <ActionItems items={student.overallActions} />
      <div className="quote">"You've cleared the bar most students never reach. What's left is execution."</div>
    </div>
  );
}
