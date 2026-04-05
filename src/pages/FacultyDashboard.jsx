import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiGet, apiPatch, apiPost, apiPut } from '../api';
import { getToken } from '../auth';
import { Button, Field, Input } from '../components/FormParts';
import { useToast } from '../components/ToastProvider';
import FiltersBar from '../components/FiltersBar';

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
  const { addToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [creatingExam, setCreatingExam] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingComponents, setSavingComponents] = useState(false);
  const [savingComponentId, setSavingComponentId] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    school_id: '',
    program_id: '',
    course_id: '',
    faculty_id: '',
    date_from: '',
    date_to: '',
  });

  const NAV_GROUPS = [
    {
      group: 'Faculty',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
      ],
    },
  ];

  const teachingCards = useMemo(() => {
    const m = new Map();
    for (const x of mySections) {
      if (!m.has(x.course_section_id)) m.set(x.course_section_id, x);
    }
    const list = [...m.values()];
    const q = (search || '').trim().toLowerCase();
    return list.filter((r) => {
      if (filters.school_id && Number(r.school_id) !== Number(filters.school_id)) return false;
      if (filters.program_id && Number(r.program_id) !== Number(filters.program_id)) return false;
      if (filters.course_id && Number(r.course_id) !== Number(filters.course_id)) return false;
      if (q) {
        const hay = `${r.course_code} ${r.course_name} ${r.school_name} ${r.program_name} ${r.section_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [mySections, search, filters.school_id, filters.program_id, filters.course_id]);

  const [examSectionId, setExamSectionId] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examDetail, setExamDetail] = useState(null);
  const [examCreate, setExamCreate] = useState({
    exam_type: 'cie1',
    exam_mode: 'offline',
    formula_type: 'SUM',
    exam_date: new Date().toISOString().slice(0, 10),
  });
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [componentsRows, setComponentsRows] = useState([]);

  const load = useCallback(async () => {
    setErr('');
    try {
      const [lu, sec] = await Promise.all([
        apiGet('/api/faculty/lookups', { token }),
        apiGet('/api/faculty/sections', { token }),
      ]);
      setLookups(lu);
      setMySections(sec.items || []);
      try {
        const fb = await apiGet('/api/faculty/feedback/forms', { token });
        setFeedbackForms(fb.items || []);
      } catch {
        setFeedbackForms([]);
      }
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

  async function refreshExams() {
    if (!examSectionId) {
      setExams([]);
      return;
    }
    setErr('');
    try {
      const d = await apiGet(`/api/faculty/exams?course_section_id=${examSectionId}`, { token });
      setExams(d.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load exams');
    }
  }

  useEffect(() => {
    refreshExams();
  }, [examSectionId, token]);

  useEffect(() => {
    if (!selectedExamId) {
      setExamDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await apiGet(`/api/faculty/exams/${selectedExamId}`, { token });
        if (!cancelled) setExamDetail(d);
      } catch {
        if (!cancelled) setExamDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedExamId, token]);

  useEffect(() => {
    if (!examDetail?.components) {
      setComponentsRows([]);
      return;
    }
    setComponentsRows(
      examDetail.components.map((c) => ({
        component_name: c.component_name ?? '',
        max_marks: c.max_marks ?? 0,
        weightage: c.weightage ?? 0,
      }))
    );
  }, [examDetail?.components]);

  async function createExam(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setCreatingExam(true);
    try {
      if (!examSectionId) {
        setErr('Select a section for the exam.');
        return;
      }
      const d = await apiPost(
        '/api/faculty/exams',
        {
          course_section_id: Number(examSectionId),
          exam_type: examCreate.exam_type,
          exam_mode: examCreate.exam_mode,
          formula_type: examCreate.formula_type,
          exam_date: examCreate.exam_date,
        },
        { token }
      );
      setMsg('Exam created');
      await refreshExams();
      if (d?.item?.id) setSelectedExamId(String(d.item.id));
      addToast({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Exam create failed');
      addToast({ type: 'error', message: 'Error occurred' });
    } finally {
      setCreatingExam(false);
    }
  }

  async function saveExamMarks(e) {
    e.preventDefault();
    if (!examDetail?.exam_students?.length) return;
    setErr('');
    setMsg('');
    setSavingStatus(true);
    try {
      const rows = examDetail.exam_students.map((r) => ({
        exam_student_id: r.id,
        student_id: r.student_id,
        status: r.status,
      }));
      await apiPatch(`/api/faculty/exams/${selectedExamId}/students`, { rows }, { token });
      setMsg('Status saved');
      const d = await apiGet(`/api/faculty/exams/${selectedExamId}`, { token });
      setExamDetail(d);
      addToast({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Save failed');
      addToast({ type: 'error', message: 'Error occurred' });
    } finally {
      setSavingStatus(false);
    }
  }

  function addComponentRow() {
    setComponentsRows((prev) => [
      ...prev,
      { component_name: '', max_marks: 0, weightage: 0 },
    ]);
  }

  function removeComponentRow(idx) {
    setComponentsRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveComponents(e) {
    e.preventDefault();
    if (!selectedExamId) return;
    setErr('');
    setMsg('');
    setSavingComponents(true);
    try {
      const comps = (componentsRows || [])
        .map((r) => ({
          component_name: String(r.component_name ?? '').trim(),
          max_marks: Number(r.max_marks ?? 0),
          weightage: Number(r.weightage ?? 0),
        }))
        .filter((c) => !!c.component_name);
      if (!comps.length) {
        setErr('Add at least one component row before saving.');
        return;
      }
      await apiPost(
        `/api/faculty/exams/${selectedExamId}/components`,
        {
          formula_type: examDetail?.item?.formula_type ?? examCreate.formula_type,
          components: comps,
        },
        { token }
      );
      setMsg('Components saved');
      const d = await apiGet(`/api/faculty/exams/${selectedExamId}`, { token });
      setExamDetail(d);
      addToast({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Failed to save components');
      addToast({ type: 'error', message: 'Error occurred' });
    } finally {
      setSavingComponents(false);
    }
  }

  async function saveComponentMarks(compId) {
    if (!examDetail?.exam_students?.length) return;
    setErr('');
    setMsg('');
    setSavingComponentId(compId);
    try {
      const key = `comp_${compId}`;
      const rows = examDetail.exam_students.map((r) => ({
        student_id: r.student_id,
        marks_obtained: Number(r[key] ?? 0),
      }));
      await apiPut(`/api/faculty/exam-components/${compId}/marks`, { rows }, { token });
      setMsg('Component marks saved');
      const d = await apiGet(`/api/faculty/exams/${selectedExamId}`, { token });
      setExamDetail(d);
      addToast({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Component save failed');
      addToast({ type: 'error', message: 'Error occurred' });
    } finally {
      setSavingComponentId(null);
    }
  }

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
    <div className="flex min-h-[calc(100vh-4rem)] gap-0">
      <aside
        className={[
          'hidden shrink-0 border-r border-border bg-surface transition-all duration-200 lg:block',
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
        ].join(' ')}
      >
        <div className="sticky top-[4rem] h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
            <div className={sidebarCollapsed ? 'hidden' : 'block'}>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Faculty</p>
              <p className="text-[11px] text-muted">Navigation</p>
            </div>
            <button
              type="button"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              onClick={() => setSidebarCollapsed((s) => !s)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          <div className="space-y-5 px-2 py-3">
            {NAV_GROUPS.map((g) => (
              <div key={g.group}>
                <p
                  className={[
                    'mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted',
                    sidebarCollapsed ? 'sr-only' : '',
                  ].join(' ')}
                >
                  {g.group}
                </p>
                <div className="space-y-0.5">
                  {g.items.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={[
                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all duration-150',
                          active
                            ? 'bg-accent text-white shadow-sm'
                            : 'text-secondary hover:bg-accent/5 hover:text-accent',
                        ].join(' ')}
                        title={sidebarCollapsed ? t.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className={sidebarCollapsed ? 'hidden' : 'block'}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-6 p-5 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Faculty Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">Manage teaching, attendance, exams, and feedback.</p>
        </div>

        {err ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">{err}</div>
        ) : null}
        {msg ? (
          <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm font-medium text-success">{msg}</div>
        ) : null}

        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3 lg:hidden">
          {NAV_GROUPS.flatMap((g) => g.items).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                tab === t.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface text-secondary ring-1 ring-border hover:bg-accent/5 hover:text-accent',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <FiltersBar
          search={search}
          onSearchChange={setSearch}
          schools={lookups?.schools || []}
          programs={filters.school_id ? (lookups?.programs || []).filter((p) => p.school_id === Number(filters.school_id)) : (lookups?.programs || [])}
          courses={lookups?.courses || []}
          faculty={[]}
          filters={filters}
          onFiltersChange={setFilters}
          showDateRange={tab === 'exams'}
        />

        {tab === 'overview' ? (
          <section className="card p-6">
        <h2 className="text-lg font-semibold text-primary">Your teaching</h2>
        <p className="mt-1 text-sm text-secondary">Course, school, program, batch, and section for each assignment.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachingCards.map((m) => (
            <div
              key={m.course_section_id}
              className="card-hover p-5"
            >
              <p className="text-sm font-semibold text-primary">
                {m.course_name}{' '}
                <span className="font-mono text-xs text-secondary">({m.course_code})</span>
              </p>
              <dl className="mt-3 space-y-1 text-xs text-secondary">
                <div className="flex justify-between gap-2">
                  <dt>School</dt>
                  <dd className="text-right font-medium text-primary">{m.school_name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Program</dt>
                  <dd className="text-right font-medium text-primary">{m.program_name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Batch</dt>
                  <dd className="text-right font-medium text-primary">{m.joining_year}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Section</dt>
                  <dd className="text-right font-medium text-primary">{m.section_name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Role</dt>
                  <dd className="text-right capitalize">{m.faculty_role}</dd>
                </div>
              </dl>
            </div>
          ))}
          {!teachingCards.length ? (
            <p className="text-sm text-muted">No section mappings yet. Ask admin to map you to a section.</p>
          ) : null}
        </div>
          </section>
        ) : null}

        {tab === 'exams' ? (
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-primary">Exams (section-wide)</h2>
        <p className="mt-1 text-sm text-secondary">
          Exams are visible to every faculty on the same section. Create CIE/SEE metadata, then enter marks or component
          breakdown.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Field label="Section for exams">
              <select
                className="input-field"
                value={examSectionId}
                onChange={(e) => setExamSectionId(e.target.value)}
              >
                <option value="">—</option>
                {teachingCards.map((m) => (
                  <option key={m.course_section_id} value={m.course_section_id}>
                    {m.course_code} · Sec {m.section_name} · Batch {m.joining_year}
                  </option>
                ))}
              </select>
            </Field>
            <div className="overflow-x-auto rounded-xl border border-border shadow-card">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Marks</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {exams.map((ex) => (
                    <tr key={ex.id}>
                      <td className="px-3 py-2 font-medium">{ex.exam_type}</td>
                      <td className="px-3 py-2">{ex.exam_date}</td>
                      <td className="px-3 py-2">{ex.total_marks}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="text-accent transition-colors hover:text-accent-light"
                          onClick={() => setSelectedExamId(String(ex.id))}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form onSubmit={createExam} className="space-y-3 rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium text-primary">Create exam</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Type">
                  <select
                    className="input-field"
                    value={examCreate.exam_type}
                    onChange={(e) => setExamCreate({ ...examCreate, exam_type: e.target.value })}
                  >
                    {['cie1', 'cie2', 'cie3', 'see'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Mode">
                  <select
                    className="input-field"
                    value={examCreate.exam_mode}
                    onChange={(e) => setExamCreate({ ...examCreate, exam_mode: e.target.value })}
                  >
                    <option value="offline">offline</option>
                    <option value="online">online</option>
                  </select>
                </Field>
              </div>
              <Field label="Formula engine">
                <select
                  className="input-field"
                  value={examCreate.formula_type}
                  onChange={(e) => setExamCreate({ ...examCreate, formula_type: e.target.value })}
                >
                  <option value="SUM">SUM</option>
                  <option value="WEIGHTED">WEIGHTED</option>
                </select>
              </Field>
              <Field label="Exam date">
                <Input
                  type="date"
                  value={examCreate.exam_date}
                  onChange={(e) => setExamCreate({ ...examCreate, exam_date: e.target.value })}
                />
              </Field>
              <Button type="submit" disabled={!examSectionId || creatingExam} loading={creatingExam}>
                Create exam
              </Button>
              <p className="text-xs text-muted">
                Next: add components to auto-compute total marks.
              </p>
            </form>
          </div>
          <div className="rounded-lg border border-border p-4">
            {!selectedExamId || !examDetail?.item ? (
              <p className="text-sm text-secondary">Select an exam to edit marks.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {examDetail.item.exam_type} · {examDetail.item.exam_date}
                  </p>
                  <p className="text-xs text-muted">
                    Formula: {examDetail.item.formula_type} · Total: {examDetail.item.total_marks}
                  </p>
                </div>
                <form onSubmit={saveComponents} className="space-y-3 card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted">Components</p>
                    <Button type="button" className="text-xs" onClick={addComponentRow}>
                      Add component
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {componentsRows.length ? (
                      componentsRows.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-5">
                            <Input
                              value={row.component_name}
                              onChange={(e) => {
                                const next = [...componentsRows];
                                next[idx] = { ...next[idx], component_name: e.target.value };
                                setComponentsRows(next);
                              }}
                              placeholder="Component name"
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              value={row.max_marks}
                              onChange={(e) => {
                                const next = [...componentsRows];
                                next[idx] = { ...next[idx], max_marks: e.target.value };
                                setComponentsRows(next);
                              }}
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              value={row.weightage}
                              onChange={(e) => {
                                const next = [...componentsRows];
                                next[idx] = { ...next[idx], weightage: e.target.value };
                                setComponentsRows(next);
                              }}
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              type="button"
                              className="text-xs text-red-600 hover:underline"
                              onClick={() => removeComponentRow(idx)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted">
                        No components yet. Add rows above, then save to compute total marks.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={!componentsRows.length || savingComponents} loading={savingComponents}>
                      Save components
                    </Button>
                  </div>
                </form>
                {examDetail.components?.length ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted">Components</p>
                    {examDetail.components.map((c) => (
                      <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">
                          {c.component_name} (max {c.max_marks})
                        </span>
                        <Button
                          type="button"
                          className="text-xs"
                          onClick={() => saveComponentMarks(c.id)}
                          loading={savingComponentId === c.id}
                        >
                          Save component column
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <form onSubmit={saveExamMarks} className="space-y-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
                        <tr>
                          <th className="px-2 py-1">USN</th>
                          <th className="px-2 py-1">Total</th>
                          {examDetail.components?.map((c) => (
                            <th key={c.id} className="px-2 py-1">
                              {c.component_name}
                            </th>
                          ))}
                          <th className="px-2 py-1">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examDetail.exam_students?.map((r) => (
                          <tr key={r.id} className="border-t border-border">
                            <td className="px-2 py-1 font-mono text-xs">{r.usn}</td>
                            <td className="px-2 py-1">
                              <span className="text-xs font-medium">
                                {r.obtained_marks ?? 0}
                              </span>
                            </td>
                            {examDetail.components?.map((c) => (
                              <td key={c.id} className="px-2 py-1">
                                <Input
                                  className="w-16 px-1 py-0.5 text-xs"
                                  type="number"
                                  value={r[`comp_${c.id}`] ?? ''}
                                  onChange={(e) => {
                                    const key = `comp_${c.id}`;
                                    const next = {
                                      ...examDetail,
                                      exam_students: examDetail.exam_students.map((x) =>
                                        x.id === r.id ? { ...x, [key]: e.target.value } : x
                                      ),
                                    };
                                    setExamDetail(next);
                                  }}
                                />
                              </td>
                            ))}
                            <td className="px-2 py-1">
                              <select
                                className="rounded border border-border text-xs"
                                value={r.status}
                                onChange={(e) => {
                                  const next = {
                                    ...examDetail,
                                    exam_students: examDetail.exam_students.map((x) =>
                                      x.id === r.id ? { ...x, status: e.target.value } : x
                                    ),
                                  };
                                  setExamDetail(next);
                                }}
                              >
                                <option value="present">present</option>
                                <option value="absent">absent</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button type="submit" loading={savingStatus}>
                    Save status
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
        ) : null}

        {tab === 'feedback' ? (
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-primary">Feedback forms</h2>
        <p className="mt-1 text-sm text-secondary">Assigned templates for your sections — submission stats.</p>
        <ul className="mt-4 divide-y divide-border text-sm">
          {feedbackForms.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-primary">{f.template_title}</p>
                <p className="text-muted">
                  {f.course_code} · Sec {f.section_name} · {f.start_date} → {f.end_date}
                </p>
              </div>
              <div className="text-right text-xs text-secondary">
                <div>Total: {f.stats?.total_students ?? '—'}</div>
                <div>Submitted: {f.stats?.submitted ?? '—'}</div>
                <div>Pending: {f.stats?.pending ?? '—'}</div>
              </div>
            </li>
          ))}
          {!feedbackForms.length ? <li className="py-3 text-muted">No assigned feedback forms.</li> : null}
        </ul>
      </section>
        ) : null}

        {tab === 'attendance' ? (
          <>
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-primary">Select section (hierarchy)</h2>
        <p className="mt-1 text-sm text-secondary">School → Program → Course group → Course → Batch → Section</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="School">
            <select
              className="input-field"
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
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
              className="mt-2 w-full max-w-md rounded-md border border-border px-3 py-2 text-sm"
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

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-primary">Class sessions</h2>
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
              className="rounded-md border border-border px-3 py-2 text-sm"
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
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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
                          ? 'font-medium text-primary underline'
                          : 'text-secondary hover:underline'
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
          {!cofId ? <p className="mt-2 text-sm text-muted">Select a section above to manage sessions.</p> : null}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-primary">Attendance</h2>
        {!activeSessionId ? (
          <p className="mt-2 text-sm text-secondary">Choose a session from the table above.</p>
        ) : (
          <form onSubmit={saveAttendance} className="mt-4 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border shadow-card">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-2">USN</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2 font-mono text-xs">{s.usn}</td>
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">
                        <select
                          className="rounded-md border border-border px-2 py-1 text-sm"
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
          </>
        ) : null}
      </div>
    </div>
  );
}
