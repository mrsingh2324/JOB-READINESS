import React from 'react';
import { api } from '../api.js';

export default function StudentReport({ report, onBack }) {
  const src = api.reportUrl(report.url);

  return (
    <div className="report-page">
      <div className="report-toolbar">
        <div>
          <button className="secondary" onClick={onBack}>Back</button>
        </div>
        <div className="report-meta">
          <div className="section-label">Interview Report</div>
          <h1>{report.name || 'Student Report'}</h1>
        </div>
        <a className="button-link" href={src} target="_blank" rel="noreferrer">Open Full Page</a>
      </div>
      <iframe className="report-frame" title={`${report.name || 'Student'} interview report`} src={src} />
    </div>
  );
}
