import React from 'react';

// Static per-bucket content. Edit copy here as your placement framing evolves.
const BUCKETS = {
  A: {
    label: 'Bucket A',
    headline: 'Top tier — product company and GCC track.',
    body: "Your performance suggests your profile fits roles at product companies and GCCs (Oracle, Bank of America, and similar). We'll route you to higher-bar interviews. If you'd like to prepare for a different path, you can choose it below.",
    doc: {
      title: 'Preparation document — SDE / Product role interview',
      subtext: 'DSA, system design, and behavioral prep for product company interviews.',
    },
  },
  B: {
    label: 'Bucket B',
    headline: 'Service company track — high-volume hiring.',
    body: "Your performance suggests your profile fits roles at service-based companies. We'll assess you further for those opportunities. If you'd like to prepare for higher-level roles instead, you can choose that path.",
    doc: {
      title: 'Preparation document — Associate SE Trainee interview',
      subtext: 'Curated topics, sample questions, and what the round looks like in practice.',
    },
  },
  C: {
    label: 'Bucket C',
    headline: 'Frontend specialization track.',
    body: "Your profile fits frontend developer roles. Capgemini, Mphasis, Hexaware and 300+ companies in the NxtWave network hire for this track.",
    doc: {
      title: 'Preparation document — Frontend Developer (React) interview',
      subtext: 'React fundamentals, JS depth, and frontend system design basics.',
    },
  },
  D: {
    label: 'Bucket D',
    headline: 'Foundation track — build the base first.',
    body: "You're being routed to a focused preparation track to strengthen your fundamentals before the next assessment cycle. Stick to the curriculum and re-attempt at the next checkpoint.",
    doc: {
      title: 'Preparation document — Foundation reinforcement',
      subtext: 'DSA basics, Core CS subjects, and structured practice problems.',
    },
  },
};

export default function ChoosePath({ student }) {
  const bucket = student.bucket;
  if (!bucket || !BUCKETS[bucket]) return null;
  const b = BUCKETS[bucket];

  return (
    <div className="card">
      <div className="section-label">What's Next</div>
      <h2 className="section-title">Choose your path</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span className="pill blue" style={{ fontWeight: 700 }}>{b.label}</span>
        {student.bucketAssignedAt && (
          <span className="muted" style={{ fontSize: 12 }}>assigned: {student.bucketAssignedAt}</span>
        )}
      </div>
      <p className="lead" style={{ marginTop: 4 }}>{b.body}</p>

      <div className="action-row action-row--featured" style={{ marginTop: 12 }}>
        <div className="action-icon">📘</div>
        <div className="action-body">
          <div className="action-title">{b.doc.title}</div>
          <div className="action-sub">{b.doc.subtext}</div>
        </div>
        <div className="action-chev">›</div>
      </div>
    </div>
  );
}
