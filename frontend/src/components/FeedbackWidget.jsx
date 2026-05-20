import React, { useState } from 'react';
import { api } from '../api.js';

const OPTIONS = [
  { value: 1, emoji: '😞', label: 'Not helpful' },
  { value: 2, emoji: '🙁', label: 'A little' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Helpful' },
  { value: 5, emoji: '😄', label: 'Very helpful' },
];

export default function FeedbackWidget({ uid }) {
  const storageKey = `feedback:${uid}`;
  const [submitted, setSubmitted] = useState(() => !!localStorage.getItem(storageKey));
  const [selected, setSelected] = useState(() => Number(localStorage.getItem(storageKey)) || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function choose(rating) {
    if (busy) return;
    setBusy(true);
    setErr('');
    setSelected(rating);
    try {
      await api.submitFeedback(uid, rating);
      localStorage.setItem(storageKey, String(rating));
      setSubmitted(true);
    } catch (e) {
      setErr(e.message || 'Could not submit feedback');
      setSelected(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 className="section-title" style={{ marginBottom: 6 }}>How helpful was this page?</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
        Your feedback helps us improve this for future students.
      </p>
      <div className="feedback-row">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`feedback-opt ${selected === o.value ? 'feedback-opt--selected' : ''}`}
            onClick={() => choose(o.value)}
            disabled={busy}
            aria-label={o.label}
          >
            <span className="feedback-emoji">{o.emoji}</span>
            <span className="feedback-label">{o.label}</span>
          </button>
        ))}
      </div>
      {submitted && !err && (
        <div className="muted" style={{ marginTop: 12, fontSize: 13, color: '#1c6e58' }}>
          ✓ Thanks for your feedback.
        </div>
      )}
      {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}
    </div>
  );
}
