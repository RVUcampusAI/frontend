import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';
import { getToken } from '../auth';

export default function StudentDashboard() {
  const token = getToken();
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState([]);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const [e, a] = await Promise.all([
        apiGet('/api/student/enrollments', { token }),
        apiGet('/api/student/attendance', { token }),
      ]);
      setEnrollments(e.items || []);
      setSummary(a.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const summaryBySection = useMemo(() => {
    const m = {};
    for (const r of summary) {
      m[r.course_section_id] = r;
    }
    return m;
  }, [summary]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Student</h1>
        <p className="mt-1 text-sm text-slate-600">Your enrollments and attendance by section.</p>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Enrolled courses</h2>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {enrollments.map((r) => (
            <li key={r.course_section_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-slate-900">
                  {r.course_code} — {r.course_name}
                </p>
                <p className="text-slate-500">
                  Section {r.section_name} · {r.course_group_name}
                </p>
              </div>
            </li>
          ))}
          {!enrollments.length ? <li className="py-4 text-slate-500">No enrollments yet.</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Attendance</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Section</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Total classes</th>
                <th className="py-2 pr-4">Attended</th>
                <th className="py-2">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => {
                const s = summaryBySection[e.course_section_id];
                return (
                  <tr key={e.course_section_id}>
                    <td className="py-2 pr-4 font-medium">{e.section_name}</td>
                    <td className="py-2 pr-4">{e.course_code}</td>
                    <td className="py-2 pr-4">{s?.total_classes ?? '—'}</td>
                    <td className="py-2 pr-4">{s?.attended ?? '—'}</td>
                    <td className="py-2">{s?.percentage ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!enrollments.length ? <p className="mt-2 text-sm text-slate-500">Enroll in sections to see attendance.</p> : null}
      </section>
    </div>
  );
}
