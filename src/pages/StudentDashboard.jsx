import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiGet, apiPost } from '../api';
import { getToken } from '../auth';
import { Button, Field, Input } from '../components/FormParts';
import { useToast } from '../components/ToastProvider';
import FiltersBar from '../components/FiltersBar';

export default function StudentDashboard() {
  const token = getToken();
  const { addToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState([]);
  const [err, setErr] = useState('');
  const [fbForms, setFbForms] = useState([]);
  const [activeFormId, setActiveFormId] = useState('');
  const [fbDetail, setFbDetail] = useState(null);
  const [fbAnswers, setFbAnswers] = useState({});
  const [fbMsg, setFbMsg] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [search, setSearch] = useState('');

  const NAV_GROUPS = [
    {
      group: 'Student',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
      ],
    },
  ];

  const load = useCallback(async () => {
    setErr('');
    try {
      const [e, a, f] = await Promise.all([
        apiGet('/api/student/enrollments', { token }),
        apiGet('/api/student/attendance', { token }),
        apiGet('/api/student/feedback/forms', { token }).catch(() => ({ items: [] })),
      ]);
      setEnrollments(e.items || []);
      setSummary(a.items || []);
      setFbForms(f.items || []);
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

  const filteredEnrollments = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter((r) => {
      const hay = `${r.course_code} ${r.course_name} ${r.section_name} ${r.course_group_name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [enrollments, search]);

  const filteredFeedbackForms = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return fbForms;
    return fbForms.filter((f) => {
      const hay = `${f.title} ${f.course_code} ${f.section_name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [fbForms, search]);

  useEffect(() => {
    if (!activeFormId) {
      setFbDetail(null);
      setFbAnswers({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await apiGet(`/api/student/feedback/forms/${activeFormId}`, { token });
        if (cancelled) return;
        setFbDetail(d);
        const map = {};
        for (const q of d.questions || []) {
          const prev = (d.answers || []).find((a) => a.question_id === q.id);
          map[q.id] = prev?.answer ?? '';
        }
        setFbAnswers(map);
      } catch {
        if (!cancelled) setFbDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeFormId, token]);

  async function submitFeedback(e) {
    e.preventDefault();
    setFbMsg('');
    setErr('');
    setSubmittingFeedback(true);
    try {
      const answers = Object.entries(fbAnswers).map(([question_id, answer]) => ({
        question_id: Number(question_id),
        answer: String(answer ?? ''),
      }));
      await apiPost(`/api/student/feedback/forms/${activeFormId}/submit`, { answers }, { token });
      setFbMsg('Feedback submitted');
      const f = await apiGet('/api/student/feedback/forms', { token });
      setFbForms(f.items || []);
      setActiveFormId('');
      addToast({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Submit failed');
      addToast({ type: 'error', message: 'Error occurred' });
    } finally {
      setSubmittingFeedback(false);
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
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Student</p>
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
          <h1 className="text-2xl font-bold tracking-tight text-primary">Student Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">Your courses, attendance, and feedback.</p>
        </div>

        {err ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">{err}</div>
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
          schools={[]}
          programs={[]}
          courses={[]}
          faculty={[]}
          filters={{}}
          onFiltersChange={() => {}}
          showDateRange={false}
        />

        {tab === 'overview' ? (
      <section className="card p-6">
        <h2 className="text-lg font-bold text-primary">Enrolled courses</h2>
        <ul className="mt-4 divide-y divide-border text-sm">
          {filteredEnrollments.map((r) => (
            <li key={r.course_section_id} className="flex flex-wrap items-center justify-between gap-2 py-3.5 transition-colors hover:bg-accent/[0.02]">
              <div>
                <p className="font-semibold text-primary">
                  {r.course_code} — {r.course_name}
                </p>
                <p className="text-secondary">
                  Section {r.section_name} · {r.course_group_name}
                </p>
              </div>
            </li>
          ))}
          {!filteredEnrollments.length ? <li className="py-4 text-muted">No enrollments found.</li> : null}
        </ul>
      </section>
        ) : null}

        {tab === 'attendance' ? (
      <section className="card p-6">
        <h2 className="text-lg font-bold text-primary">Attendance</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Attended</th>
                <th className="px-4 py-3">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEnrollments.map((e) => {
                const s = summaryBySection[e.course_section_id];
                const pct = s?.percentage ? Number(s.percentage) : null;
                return (
                  <tr key={e.course_section_id} className="transition-colors hover:bg-accent/[0.03]">
                    <td className="px-4 py-3 font-semibold text-primary">{e.section_name}</td>
                    <td className="px-4 py-3">{e.course_code}</td>
                    <td className="px-4 py-3">{s?.total_classes ?? '—'}</td>
                    <td className="px-4 py-3">{s?.attended ?? '—'}</td>
                    <td className="px-4 py-3">
                      {pct != null ? (
                        <span className={[
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                          pct >= 75 ? 'bg-success/10 text-success' : pct >= 50 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger',
                        ].join(' ')}>
                          {pct}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filteredEnrollments.length ? <p className="mt-3 text-sm text-muted">Enroll in sections to see attendance.</p> : null}
      </section>
        ) : null}

        {tab === 'feedback' ? (
      <section className="card p-6">
        <h2 className="text-lg font-bold text-primary">Feedback</h2>
        <p className="mt-1 text-sm text-secondary">Active course feedback forms for your enrolled sections.</p>
        {fbMsg ? (
          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 px-4 py-2.5 text-sm font-medium text-success">
            {fbMsg}
          </div>
        ) : null}
        <ul className="mt-4 space-y-2 text-sm">
          {filteredFeedbackForms.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className="card-hover w-full px-4 py-3.5 text-left"
                onClick={() => setActiveFormId(String(f.id))}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-primary">{f.title}</span>
                  {f.response_id ? (
                    <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                      Submitted
                    </span>
                  ) : null}
                </div>
                <span className="mt-1 block text-secondary">
                  {f.course_code} · Section {f.section_name}
                </span>
              </button>
            </li>
          ))}
          {!filteredFeedbackForms.length ? <li className="text-muted">No feedback forms found.</li> : null}
        </ul>

        {activeFormId && fbDetail?.form ? (
          <form onSubmit={submitFeedback} className="mt-6 space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-primary">{fbDetail.form.title}</h3>
              <button
                type="button"
                className="text-sm font-medium text-secondary transition-colors hover:text-accent"
                onClick={() => setActiveFormId('')}
              >
                Close
              </button>
            </div>
            {fbDetail.response?.id ? (
              <p className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5 text-sm text-accent">
                You already submitted this form. Answers can be updated by submitting again.
              </p>
            ) : null}
            {fbDetail.form.description ? (
              <p className="text-sm text-secondary">{fbDetail.form.description}</p>
            ) : null}
            {(fbDetail.questions || []).map((q) => (
              <Field key={q.id} label={q.question_text}>
                {q.question_type === 'rating' ? (
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={fbAnswers[q.id] ?? ''}
                    onChange={(e) => setFbAnswers({ ...fbAnswers, [q.id]: e.target.value })}
                  />
                ) : q.question_type === 'mcq' ? (
                  <Input
                    value={fbAnswers[q.id] ?? ''}
                    onChange={(e) => setFbAnswers({ ...fbAnswers, [q.id]: e.target.value })}
                    placeholder="Selected option"
                  />
                ) : (
                  <textarea
                    className="input-field"
                    rows={3}
                    value={fbAnswers[q.id] ?? ''}
                    onChange={(e) => setFbAnswers({ ...fbAnswers, [q.id]: e.target.value })}
                  />
                )}
              </Field>
            ))}
            <Button type="submit" loading={submittingFeedback}>
              Submit feedback
            </Button>
          </form>
        ) : null}
      </section>
        ) : null}
      </div>
    </div>
  );
}
