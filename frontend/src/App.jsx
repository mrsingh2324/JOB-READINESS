import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import StudentLogin from './pages/StudentLogin.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [route, setRoute] = useState(() => {
    const p = window.location.pathname;
    const q = new URLSearchParams(window.location.search);
    if (p.startsWith('/admin') || q.get('admin') === '1') return 'admin';
    return 'student';
  });
  const [student, setStudent] = useState(null);
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

  async function handleLookup(uid) {
    setError('');
    setLoading(true);
    try {
      const data = await api.getStudent(uid.trim());
      setStudent(data);
    } catch (e) {
      setError(e.message || 'Could not find that UID. Please recheck and try again.');
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
      ) : (
        <StudentLogin onSubmit={handleLookup} error={error} loading={loading} />
      )}
    </>
  );
}
