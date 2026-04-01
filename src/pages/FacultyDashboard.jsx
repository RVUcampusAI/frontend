import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../api';
import { getToken } from '../auth';
import { Button, Field, Input } from '../components/FormParts';

const emptyHierarchy = {
  school_id: '',
  program_id: '',
  course_group_id: '',
  course_id: '',
  batch_id: '',
  course_section_id: '',
};

export default function FacultyDashboard() {
  const token = getToken();
  const [lookups, setLookups] = useState(null);
  const [mySections, setMySections] = useState([]);
  const [hier, setHier] = useState(emptyHierarchy);
  const [cofId, setCofId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    session_date: new Date().toISOString().slice(0, 10),
    start_time: '09:00',
    end_time: '10:00',
    session_type: 'L',
  });
  const [activeSessionId, setActiveSessionId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const [lu, sec] = await Promise.all([
        apiGet('/api/faculty/lookups', { token }),
        apiGet('/api/faculty/sections', { token }),
      ]);
      setLookups(lu);
      setMySections(sec.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const schools = lookups?.schools || [];
  const programs = lookups?.programs || [];
  const batches = lookups?.batches || [];
  const courseGroups = lookups?.courseGroups || [];
  const courses = lookups?.courses || [];
  const offerings = lookups?.offerings || [];
  const sections = lookups?.sections || [];

  const programsF = programs.filter((p) => p.school_id === Number(hier.school_id));
  const batchesF = batches.filter((b) => b.program_id === Number(hier.program_id));
  const groupsF = courseGroups.filter(
    (g) =>
      g.school_id === Number(hier.school_id) &&
      (!hier.program_id || g.program_id == null || g.program_id === Number(hier.program_id))
  );
  const coursesF = courses.filter((c) => c.course_group_id === Number(hier.course_group_id));
  const offeringsF = offerings.filter(
    (o) =>
      (!hier.course_id || o.course_id === Number(hier.course_id)) &&
      (!hier.batch_id || o.batch_id === Number(hier.batch_id))
  );
  const sectionsF = sections.filter((s) => {
    if (!hier.course_id || !hier.batch_id) return false;
    const off = offerings.find(
      (o) => o.id === s.course_offering_id && o.course_id === Number(hier.course_id) && o.batch_id === Number(hier.batch_id)
    );
    return !!off;
  });

  const mappingOptions = useMemo(() => {
    if (!hier.course_section_id) return [];
    return mySections.filter((m) => Number(m.course_section_id) === Number(hier.course_section_id));
  }, [mySections, hier.course_section_id]);

  useEffect(() => {
    if (mappingOptions.length === 1) setCofId(String(mappingOptions[0].course_offering_faculty_id));
    else if (mappingOptions.length === 0) setCofId('');
  }, [mappingOptions]);

  async function refreshSessions() {
    if (!cofId) return;
    setErr('');
    try {
      const d = await apiGet(`/api/faculty/class-sessions?course_offering_faculty_id=${cofId}`, { token });
      setSessions(d.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load sessions');
    }
  }

  useEffect(() => {
    if (cofId) refreshSessions();
    else setSessions([]);
  }, [cofId, token]);

  async function createSession(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await apiPost(
        '/api/faculty/class-sessions',
        {
          course_offering_faculty_id: Number(cofId),
          session_date: sessionForm.session_date,
          start_time: sessionForm.start_time,
          end_time: sessionForm.end_time,
          session_type: sessionForm.session_type,
        },
        { token }
      );
      setMsg('Session created');
      await refreshSessions();
    } catch (e) {
      setErr(e.message || 'Create failed');
    }
  }

  async function loadStudentsForAttendance() {
    if (!hier.course_section_id || !activeSessionId) return;
    setErr('');
    try {
      const st = await apiGet(`/api/faculty/sections/${hier.course_section_id}/students`, { token });
      setStudents(st.items || []);
      const att = await apiGet(`/api/faculty/class-sessions/${activeSessionId}/attendance`, { token });
      const map = {};
      for (const r of att.items || []) {
        map[r.student_id] = r.status;
      }
      for (const s of st.items || []) {
        if (map[s.id] == null) map[s.id] = 'present';
      }
      setAttendanceRows(map);
    } catch (e) {
      setErr(e.message || 'Failed to load roster');
    }
  }

  useEffect(() => {
    loadStudentsForAttendance();
  }, [activeSessionId, hier.course_section_id, token]);

  async function saveAttendance(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      const rows = Object.entries(attendanceRows).map(([student_id, status]) => ({
        student_id: Number(student_id),
        status,
      }));
      await apiPost(
        '/api/faculty/attendance',
        { class_session_id: Number(activeSessionId), rows },
        { token }
      );
      setMsg('Attendance saved');
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Faculty</h1>
        <p className="mt-1 text-sm text-slate-600">Select your section, run class sessions, and mark attendance.</p>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : null}
      {msg ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">1. Select section (hierarchy)</h2>
        <p className="mt-1 text-sm text-slate-600">School → Program → Course group → Course → Batch → Section</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="School">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={hier.school_id}
              onChange={(e) => setHier({ ...emptyHierarchy, school_id: e.target.value })}
            >
              <option value="">—</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Program">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={hier.program_id}
              onChange={(e) =>
                setHier({ ...hier, program_id: e.target.value, course_group_id: '', course_id: '', batch_id: '', course_section_id: '' })
              }
              disabled={!hier.school_id}
            >
              <option value="">—</option>
              {programsF.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Course group">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={hier.course_group_id}
              onChange={(e) =>
                setHier({ ...hier, course_group_id: e.target.value, course_id: '', batch_id: '', course_section_id: '' })
              }
              disabled={!hier.program_id}
            >
              <option value="">—</option>
              {groupsF.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.track})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Course">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={hier.course_id}
              onChange={(e) =>
                setHier({ ...hier, course_id: e.target.value, batch_id: '', course_section_id: '' })
              }
              disabled={!hier.course_group_id}
            >
              <option value="">—</option>
              {coursesF.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Batch">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={hier.batch_id}
              onChange={(e) => setHier({ ...hier, batch_id: e.target.value, course_section_id: '' })}
              disabled={!hier.program_id || !hier.course_id}
            >
              <option value="">—</option>
              {batchesF.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.joining_year}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={hier.course_section_id}
              onChange={(e) => setHier({ ...hier, course_section_id: e.target.value })}
              disabled={!hier.course_id || !hier.batch_id}
            >
              <option value="">—</option>
              {sectionsF.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.section_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {mappingOptions.length > 1 ? (
          <Field label="Your role for this section">
            <select
              className="mt-2 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cofId}
              onChange={(e) => setCofId(e.target.value)}
            >
              <option value="">Select mapping…</option>
              {mappingOptions.map((m) => (
                <option key={m.course_offering_faculty_id} value={m.course_offering_faculty_id}>
                  {m.faculty_role} — {m.course_code} ({m.section_name})
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">2. Class sessions</h2>
        <form onSubmit={createSession} className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Date">
            <Input
              type="date"
              value={sessionForm.session_date}
              onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
              disabled={!cofId}
            />
          </Field>
          <Field label="Start">
            <Input
              type="time"
              value={sessionForm.start_time}
              onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
              disabled={!cofId}
            />
          </Field>
          <Field label="End">
            <Input
              type="time"
              value={sessionForm.end_time}
              onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
              disabled={!cofId}
            />
          </Field>
          <Field label="Type">
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={sessionForm.session_type}
              onChange={(e) => setSessionForm({ ...sessionForm, session_type: e.target.value })}
              disabled={!cofId}
            >
              <option value="L">Lecture</option>
              <option value="T">Tutorial</option>
              <option value="P">Practical</option>
            </select>
          </Field>
          <Button type="submit" disabled={!cofId}>
            Create session
          </Button>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 pr-4">{s.session_date}</td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {s.start_time?.slice?.(0, 5) ?? s.start_time} – {s.end_time?.slice?.(0, 5) ?? s.end_time}
                  </td>
                  <td className="py-2 pr-4">{s.session_type}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      className={
                        activeSessionId === String(s.id)
                          ? 'font-medium text-slate-900 underline'
                          : 'text-slate-600 hover:underline'
                      }
                      onClick={() => setActiveSessionId(String(s.id))}
                    >
                      Open attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!cofId ? <p className="mt-2 text-sm text-slate-500">Select a section above to manage sessions.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">3. Attendance</h2>
        {!activeSessionId ? (
          <p className="mt-2 text-sm text-slate-600">Choose a session from the table above.</p>
        ) : (
          <form onSubmit={saveAttendance} className="mt-4 space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">USN</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2 font-mono text-xs">{s.usn}</td>
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">
                        <select
                          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={attendanceRows[s.id] || 'present'}
                          onChange={(e) => setAttendanceRows({ ...attendanceRows, [s.id]: e.target.value })}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="leave">Leave</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="submit">Save attendance</Button>
          </form>
        )}
      </section>
    </div>
  );
}
