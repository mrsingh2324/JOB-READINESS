// Role track definitions: each track has requirements measured against offlineExam scores.
// Computed client-side from a student's scores.

export const ROLE_TRACKS = [
  {
    id: 'aset',
    name: 'Associate Software Engineer (Trainee)',
    requirements: [
      { label: 'Coding Score', field: 'codingScore', max: 'codingMax', min: 25 },
      { label: 'Aptitude Score', field: 'aptitudeScore', max: 'aptitudeMax', min: 18 },
    ],
    foot: 'Cognizant, Infosys, Wipro hire at scale for this role — one of the highest-volume tracks in the network.',
  },
  {
    id: 'frontend',
    name: 'Frontend Developer (React)',
    requirements: [
      { label: 'Coding Score', field: 'codingScore', max: 'codingMax', min: 25 },
      { label: 'Technical MCQ Score', field: 'technicalMcqScore', max: 'technicalMcqMax', min: 18 },
    ],
    foot: 'Capgemini, Mphasis, Hexaware and 300+ companies in the NxtWave network hire for this role.',
  },
  {
    id: 'sde',
    name: 'Software Development Engineer (SDE)',
    requirements: [
      { label: 'Coding Score', field: 'codingScore', max: 'codingMax', min: 60 },
      { label: 'DSA MCQ Score', field: 'dsaMcqScore', max: 'dsaMcqMax', min: 4 },
      { label: 'Core CS Score', field: 'coreCSScore', max: 'coreCSMax', min: 10 },
    ],
    foot: 'Product companies and GCCs — Oracle, Bank of America, and similar. Higher bar, higher starting package.',
  },
];

export function evaluateTrack(track, offline = {}) {
  const reqs = track.requirements.map((r) => {
    const val = Number(offline[r.field] ?? 0);
    const met = val >= r.min;
    const gap = Math.max(0, r.min - val);
    return { ...r, value: val, met, gap };
  });
  const qualified = reqs.every((r) => r.met);
  const totalGap = reqs.reduce((s, r) => s + r.gap, 0);
  return { qualified, totalGap, reqs };
}
