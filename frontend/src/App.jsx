import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import StudentLogin from './pages/StudentLogin.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentReport from './pages/StudentReport.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [route, setRoute] = useState(() => {
    const p = window.location.pathname;
    const q = new URLSearchParams(window.location.search);
    if (p.startsWith('/admin') || q.get('admin') === '1') return 'admin';
    return 'student';
  });
  const [student, setStudent] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      const q = new URLSearchParams(window.location.search);
      setRoute(p.startsWith('/admin') || q.get('admin') === '1' ? 'admin' : 'student');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  async function handleLookup(identifier) {
    setError('');
    setLoading(true);
    try {
      const data = await api.lookup(identifier.trim());
      if (data.type === 'student') {
        setStudent(data.student);
        setReport(null);
      } else if (data.type === 'report') {
        setReport(data.report);
        setStudent(null);
      } else {
        throw new Error('No matching result found.');
      }
    } catch (e) {
      setError(e.message || 'Could not find that mobile number. Please recheck and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topnav">Job Readiness</div>
      {route === 'admin' ? (
        <Admin />
      ) : student ? (
        <StudentDashboard student={student} onBack={() => setStudent(null)} />
      ) : report ? (
        <StudentReport report={report} onBack={() => setReport(null)} />
      ) : (
        <StudentLogin onSubmit={handleLookup} error={error} loading={loading} />
      )}
    </>
  );
}
