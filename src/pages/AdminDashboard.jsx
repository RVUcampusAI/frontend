import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  School,
  BookMarked,
  Layers,
  BookOpen,
  CalendarRange,
  LayoutList,
  Users,
  UserCog,
  ClipboardList,
  UserPlus,
  FileText,
  MessageSquareText,
  Send,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../api';
import { getToken } from '../auth';
import { Button, Field, Input } from '../components/FormParts';
import FiltersBar from '../components/FiltersBar';
import { useToast } from '../components/ToastProvider';
import ConfirmDialog from '../components/ConfirmDialog';

const NAV_GROUPS = [
  {
    group: 'Academic',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: null },
      { id: 'university', label: 'University', path: '/api/admin/universities' },
      { id: 'campus', label: 'Campus', path: '/api/admin/campuses' },
      { id: 'school', label: 'School', path: '/api/admin/schools' },
      { id: 'program', label: 'Program', path: '/api/admin/programs' },
      { id: 'batch', label: 'Batch', path: '/api/admin/batches' },
      { id: 'courseGroup', label: 'Course groups', path: '/api/admin/course-groups' },
      { id: 'course', label: 'Courses', path: '/api/admin/courses' },
      { id: 'offering', label: 'Offerings', path: '/api/admin/course-offerings' },
      { id: 'section', label: 'Sections', path: '/api/admin/course-sections' },
    ],
  },
  {
    group: 'Faculty',
    items: [{ id: 'facultyMapping', label: 'Faculty mapping', path: null }],
  },
  {
    group: 'Students',
    items: [
      { id: 'enrollments', label: 'Enrollments', path: null },
      { id: 'attendance', label: 'Attendance', path: null },
      { id: 'students', label: 'Student links', path: '/api/admin/students' },
    ],
  },
  {
    group: 'Exams',
    items: [{ id: 'exams', label: 'Exams', path: null }],
  },
  {
    group: 'Feedback',
    items: [
      { id: 'fbQuestions', label: 'Feedback Q', path: null },
      { id: 'fbTemplates', label: 'Feedback templates', path: null },
      { id: 'fbAssign', label: 'Feedback assign', path: null },
      { id: 'fbAnalytics', label: 'Feedback analytics', path: null },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  university: Building2,
  campus: MapPin,
  school: School,
  program: BookMarked,
  batch: Layers,
  courseGroup: BookOpen,
  course: BookOpen,
  offering: CalendarRange,
  section: LayoutList,
  facultyMapping: UserCog,
  enrollments: UserPlus,
  attendance: ClipboardList,
  students: Users,
  exams: FileText,
  fbQuestions: MessageSquareText,
  fbTemplates: MessageSquareText,
  fbAssign: Send,
  fbAnalytics: BarChart2,
};

function TableShell({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
      <table className="min-w-full divide-y divide-border text-left text-sm">{children}</table>
    </div>
  );
}

const TH_CLS = 'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted';
const TD_CLS = 'px-4 py-3';
const TR_HOVER = 'transition-colors hover:bg-accent/[0.03]';

export default function AdminDashboard() {
  const token = getToken();
  const { addToast } = useToast();
  const [tab, setTab] = useState('university');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    school_id: '',
    program_id: '',
    course_id: '',
    faculty_id: '',
    date_from: '',
    date_to: '',
  });
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onYes: null, danger: true });
  const [confirmLoading, setConfirmLoading] = useState(false);

  function confirmAction({ title, message, danger = true, onYes }) {
    setConfirm({
      open: true,
      title,
      message,
      danger,
      onYes: async () => {
        setConfirmLoading(true);
        try {
          await onYes?.();
        } finally {
          setConfirmLoading(false);
          setConfirm({ open: false, title: '', message: '', onYes: null, danger: true });
        }
      },
    });
  }
  const [lookup, setLookup] = useState({
    universities: [],
    campuses: [],
    schools: [],
    programs: [],
    batches: [],
    courseGroups: [],
    courses: [],
    offerings: [],
    sections: [],
    faculty: [],
    studentsList: [],
    templates: [],
    feedbackQuestions: [],
  });

  const loadLookups = useCallback(async () => {
    try {
      const [u, c, s, p, b, cg, cr, of, sec, fac, st, tpl, fq] = await Promise.all([
        apiGet('/api/admin/universities', { token }),
        apiGet('/api/admin/campuses', { token }),
        apiGet('/api/admin/schools', { token }),
        apiGet('/api/admin/programs', { token }),
        apiGet('/api/admin/batches', { token }),
        apiGet('/api/admin/course-groups', { token }),
        apiGet('/api/admin/courses', { token }),
        apiGet('/api/admin/course-offerings', { token }),
        apiGet('/api/admin/course-sections', { token }),
        apiGet('/api/admin/faculty', { token }),
        apiGet('/api/admin/students', { token }),
        apiGet('/api/admin/feedback/templates', { token }).catch(() => ({ items: [] })),
        apiGet('/api/admin/feedback/questions', { token }).catch(() => ({ items: [] })),
      ]);
      setLookup({
        universities: u.items || [],
        campuses: c.items || [],
        schools: s.items || [],
        programs: p.items || [],
        batches: b.items || [],
        courseGroups: cg.items || [],
        courses: cr.items || [],
        offerings: of.items || [],
        sections: sec.items || [],
        faculty: fac.items || [],
        studentsList: st.items || [],
        templates: tpl.items || [],
        feedbackQuestions: fq.items || [],
      });
    } catch {
      /* optional for partial UI */
    }
  }, [token]);

  const refresh = useCallback(async () => {
    setError('');
    setItems([]);
    setLoading(true);
    try {
      if (tab === 'students') {
        const d = await apiGet('/api/admin/students', { token });
        setItems(d.items || []);
      } else if (tab === 'dashboard') {
        setItems([]);
      } else if (tab === 'facultyMapping') {
        const d = await apiGet('/api/admin/faculty-mappings', { token });
        setItems(d.items || []);
      } else if (tab === 'enrollments') {
        const d = await apiGet('/api/admin/student-enrollments', { token });
        setItems(d.items || []);
      } else if (tab === 'attendance') {
        const d = await apiGet('/api/admin/attendance-summary', { token });
        setItems(d.items || []);
      } else if (tab === 'exams') {
        const d = await apiGet('/api/admin/exams', { token });
        setItems(d.items || []);
      } else if (tab === 'fbQuestions') {
        const d = await apiGet('/api/admin/feedback/questions', { token });
        setItems(d.items || []);
      } else if (tab === 'fbTemplates') {
        const d = await apiGet('/api/admin/feedback/templates', { token });
        setItems(d.items || []);
      } else if (tab === 'fbAssign' || tab === 'fbAnalytics') {
        setItems([]);
      } else {
        const t = NAV_ITEMS.find((x) => x.id === tab);
        const d = await apiGet(t.path, { token });
        setItems(d.items || []);
      }
      await loadLookups();
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tab, token, loadLookups]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function removeRow(path, id) {
    confirmAction({
      title: 'Delete record',
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      danger: true,
      onYes: async () => {
        setError('');
        try {
          await apiDelete(`${path}/${id}`, { token });
          await refresh();
          addToast({ type: 'success', message: 'Saved successfully' });
        } catch (e) {
          setError(e.message || 'Delete failed');
          addToast({ type: 'error', message: 'Error occurred' });
        }
      },
    });
  }

  const path = NAV_ITEMS.find((x) => x.id === tab)?.path || '';
  const programsForSchool = !filters.school_id
    ? lookup.programs
    : lookup.programs.filter((p) => p.school_id === Number(filters.school_id));
  const coursesForProgram = !filters.program_id
    ? lookup.courses
    : lookup.courses.filter((c) => {
        const g = lookup.courseGroups.find((cg) => cg.id === c.course_group_id);
        return g?.program_id == null || g.program_id === Number(filters.program_id);
      });

  const filteredItems = items.filter((row) => {
    const q = (search || '').trim().toLowerCase();
    if (q) {
      const hay = JSON.stringify(row || {}).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.faculty_id) {
      const fid = Number(filters.faculty_id);
      if (row.faculty_id != null && Number(row.faculty_id) !== fid) return false;
      if (row.created_by != null && Number(row.created_by) !== fid) return false;
    }
    if (filters.course_id) {
      const cid = Number(filters.course_id);
      if (row.course_id != null && Number(row.course_id) !== cid) return false;
    }
    if (filters.program_id) {
      const pid = Number(filters.program_id);
      if (row.program_id != null && Number(row.program_id) !== pid) return false;
      if (row.program_name && !String(row.program_name).toLowerCase().includes('')) {
        // no-op placeholder
      }
    }
    if (filters.school_id) {
      const sid = Number(filters.school_id);
      if (row.school_id != null && Number(row.school_id) !== sid) return false;
    }
    if (filters.date_from || filters.date_to) {
      const dateVal = row.exam_date || row.created_at || row.start_date || row.end_date;
      if (dateVal) {
        const d = String(dateVal).slice(0, 10);
        if (filters.date_from && d < filters.date_from) return false;
        if (filters.date_to && d > filters.date_to) return false;
      }
    }
    return true;
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-0">
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText="Delete"
        cancelText="Cancel"
        danger={confirm.danger}
        loading={confirmLoading}
        onCancel={() =>
          confirmLoading ? null : setConfirm({ open: false, title: '', message: '', onYes: null, danger: true })
        }
        onConfirm={() => confirm.onYes?.()}
      />

      <aside
        className={[
          'hidden shrink-0 border-r border-border bg-surface transition-all duration-200 lg:block',
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
        ].join(' ')}
      >
        <div className="sticky top-[4rem] h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
            <div className={sidebarCollapsed ? 'hidden' : 'block'}>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Admin</p>
              <p className="text-[11px] text-muted">Navigation</p>
            </div>
            <button
              type="button"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              onClick={() => setSidebarCollapsed((s) => !s)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden /> : <ChevronLeft className="h-4 w-4" aria-hidden />}
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
                    const Icon = NAV_ICONS[t.id] || LayoutDashboard;
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
          <h1 className="text-2xl font-bold tracking-tight text-primary">Administration</h1>
          <p className="mt-1 text-sm text-secondary">
            Academic hierarchy, faculty mapping, enrollments, and attendance.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3 lg:hidden">
          {NAV_ITEMS.map((t) => (
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

        {error ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <svg className="h-4 w-4 animate-spin text-accent" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4l3 3-3 3v4a8 8 0 0 1-8-8z" />
            </svg>
            Loading…
          </div>
        ) : null}

        <FiltersBar
          search={search}
          onSearchChange={setSearch}
          schools={lookup.schools}
          programs={programsForSchool}
          courses={coursesForProgram}
          faculty={lookup.faculty}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {tab === 'dashboard' ? <DashboardPanel token={token} /> : null}

      {tab === 'university' ? (
        <UniversityPanel
          items={filteredItems}
          path={path}
          token={token}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'campus' ? (
        <CampusPanel
          items={filteredItems}
          path={path}
          token={token}
          universities={lookup.universities}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'school' ? (
        <SchoolPanel
          items={filteredItems}
          path={path}
          token={token}
          campuses={lookup.campuses}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'program' ? (
        <ProgramPanel
          items={filteredItems}
          path={path}
          token={token}
          schools={lookup.schools}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'batch' ? (
        <BatchPanel
          items={filteredItems}
          path={path}
          token={token}
          schools={lookup.schools}
          programs={lookup.programs}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'courseGroup' ? (
        <CourseGroupPanel
          items={filteredItems}
          path={path}
          token={token}
          schools={lookup.schools}
          programs={lookup.programs}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'course' ? (
        <CoursePanel
          items={filteredItems}
          path={path}
          token={token}
          schools={lookup.schools}
          programs={lookup.programs}
          courseGroups={lookup.courseGroups}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'offering' ? (
        <OfferingPanel
          items={filteredItems}
          path={path}
          token={token}
          schools={lookup.schools}
          programs={lookup.programs}
          courseGroups={lookup.courseGroups}
          courses={lookup.courses}
          batches={lookup.batches}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
      {tab === 'section' ? (
        <SectionPanel
          items={filteredItems}
          path={path}
          token={token}
          schools={lookup.schools}
          programs={lookup.programs}
          courseGroups={lookup.courseGroups}
          courses={lookup.courses}
          batches={lookup.batches}
          offerings={lookup.offerings}
          onDone={refresh}
          onDelete={removeRow}
          toast={addToast}
        />
      ) : null}
        {tab === 'facultyMapping' ? (
          <FacultyMappingPanel
            items={filteredItems}
            token={token}
            lookup={lookup}
            onDone={refresh}
            confirmAction={confirmAction}
            toast={addToast}
          />
        ) : null}
        {tab === 'enrollments' ? (
          <EnrollmentsAdminPanel
            items={filteredItems}
            token={token}
            lookup={lookup}
            onDone={refresh}
            confirmAction={confirmAction}
            toast={addToast}
          />
        ) : null}
        {tab === 'attendance' ? <AttendanceAdminPanel items={filteredItems} /> : null}
        {tab === 'students' ? (
          <StudentsPanel items={filteredItems} token={token} lookup={lookup} onDone={refresh} />
        ) : null}
        {tab === 'exams' ? <ExamsAdminPanel items={filteredItems} /> : null}
        {tab === 'fbQuestions' ? <FeedbackQuestionsPanel items={filteredItems} token={token} onDone={refresh} /> : null}
        {tab === 'fbTemplates' ? (
          <FeedbackTemplatesPanel
            items={filteredItems}
            token={token}
            onDone={refresh}
            questionBank={lookup.feedbackQuestions}
          />
        ) : null}
        {tab === 'fbAssign' ? <FeedbackAssignPanel token={token} lookup={lookup} onDone={refresh} /> : null}
        {tab === 'fbAnalytics' ? <FeedbackAnalyticsPanel token={token} lookup={lookup} /> : null}
      </div>
    </div>
  );
}

function ExamsAdminPanel({ items }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">All exams across sections (metadata and visibility).</p>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Course</th>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">School</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">
                {r.course_code} — {r.course_name}
              </td>
              <td className="px-4 py-2">{r.section_name}</td>
              <td className="px-4 py-2">{r.exam_type}</td>
              <td className="px-4 py-2">{r.exam_date}</td>
              <td className="px-4 py-2 text-secondary">{r.school_name}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function FeedbackQuestionsPanel({ items, token, onDone }) {
  const [form, setForm] = useState({ question_text: '', question_type: 'rating', label: '', options: '' });
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      let options = null;
      if (form.options.trim()) options = JSON.parse(form.options);
      await apiPost(
        '/api/admin/feedback/questions',
        {
          question_text: form.question_text,
          question_type: form.question_type,
          label: form.label || null,
          options,
        },
        { token }
      );
      setForm({ question_text: '', question_type: 'rating', label: '', options: '' });
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed');
    }
  }
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-3 card p-5 sm:grid-cols-2">
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <div className="sm:col-span-2">
          <Field label="Question *">
            <Input value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} required />
          </Field>
        </div>
        <Field label="Type *">
          <select
            className="input-field"
            value={form.question_type}
            onChange={(e) => setForm({ ...form, question_type: e.target.value })}
          >
            <option value="rating">rating</option>
            <option value="mcq">mcq</option>
            <option value="text">text</option>
          </select>
        </Field>
        <Field label="Label (reuse)">
          <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Options JSON (mcq / rating hints)">
            <Input
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
              placeholder='e.g. {"min":1,"max":5}'
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Save question</Button>
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Text</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Label</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.question_text}</td>
              <td className="px-4 py-2">{r.question_type}</td>
              <td className="px-4 py-2">{r.label || '—'}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function FeedbackTemplatesPanel({ items, token, onDone, questionBank = [] }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [err, setErr] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  async function createTpl(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiPost('/api/admin/feedback/templates', { title, description: desc }, { token });
      setTitle('');
      setDesc('');
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed');
    }
  }

  useEffect(() => {
    if (!templateId) {
      setSelectedIds([]);
      return;
    }
    let cancelled = false;
    setLoadingTemplate(true);
    (async () => {
      try {
        const d = await apiGet(`/api/admin/feedback/templates/${templateId}/questions`, { token });
        if (cancelled) return;
        setSelectedIds((d.items || []).map((q) => q.id));
      } catch (e2) {
        if (!cancelled) setErr(e2.message || 'Failed to load template questions');
      } finally {
        if (!cancelled) setLoadingTemplate(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId, token]);

  function toggleQuestion(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function move(id, dir) {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      const ni = dir === 'up' ? idx - 1 : idx + 1;
      if (ni < 0 || ni >= next.length) return prev;
      const tmp = next[ni];
      next[ni] = next[idx];
      next[idx] = tmp;
      return next;
    });
  }

  async function saveSelectedOrder(e) {
    e.preventDefault();
    if (!templateId) return;
    setErr('');
    setSavingOrder(true);
    try {
      await apiPut(
        `/api/admin/feedback/templates/${templateId}/questions`,
        { question_ids: selectedIds },
        { token }
      );
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed');
    } finally {
      setSavingOrder(false);
    }
  }
  return (
    <div className="space-y-6">
      {err ? <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div> : null}
      <form onSubmit={createTpl} className="space-y-3 card p-5">
        <p className="text-sm font-medium text-primary">New template</p>
        <Field label="Title *">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Description">
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <Button type="submit">Create template</Button>
      </form>
      <form onSubmit={saveSelectedOrder} className="space-y-3 card p-5">
        <p className="text-sm font-medium text-primary">Attach questions (select + order)</p>
        <Field label="Template *">
          <select
            className="input-field"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {items.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.id} — {t.title}
              </option>
            ))}
          </select>
        </Field>
        {loadingTemplate ? <p className="text-sm text-secondary/80">Loading questions…</p> : null}

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold uppercase text-secondary/70">Question bank</p>
            <div className="mt-2 max-h-56 space-y-2 overflow-auto">
              {questionBank.map((q) => (
                <label key={q.id} className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-secondary/10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-primary">{q.question_text}</div>
                    <div className="text-xs text-secondary">
                      #{q.id} · {q.question_type}{q.label ? ` · ${q.label}` : ''}
                    </div>
                  </div>
                </label>
              ))}
              {!questionBank.length ? <p className="text-sm text-secondary/80">No questions found.</p> : null}
            </div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold uppercase text-secondary/70">Selected order</p>
            <div className="mt-2 max-h-56 space-y-2 overflow-auto">
              {selectedIds.map((id, idx) => {
                const q = questionBank.find((x) => x.id === id);
                return (
                  <div key={id} className="flex items-start justify-between gap-2 rounded-md border border-border p-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-primary">
                        {idx + 1}. {q?.question_text || `Question #${id}`}
                      </div>
                      <div className="text-xs text-secondary">#{id}</div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        className="rounded border border-secondary/20 px-2 py-1 text-xs text-secondary hover:bg-secondary/10"
                        onClick={() => move(id, 'up')}
                        disabled={idx === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="rounded border border-secondary/20 px-2 py-1 text-xs text-secondary hover:bg-secondary/10"
                        onClick={() => move(id, 'down')}
                        disabled={idx === selectedIds.length - 1}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                );
              })}
              {!selectedIds.length ? <p className="text-sm text-secondary/80">No questions selected.</p> : null}
            </div>
          </div>
        </div>

        <Button type="submit" loading={savingOrder} disabled={!templateId || !selectedIds.length}>
          Save question order
        </Button>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Created by user</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.title}</td>
              <td className="px-4 py-2">{r.created_by_user_id}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function FeedbackAssignPanel({ token, lookup, onDone }) {
  const [form, setForm] = useState({
    template_id: '',
    faculty_id: '',
    course_section_id: '',
    start_date: '',
    end_date: '',
  });
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiPost(
        '/api/admin/feedback/instances',
        {
          template_id: Number(form.template_id),
          faculty_id: Number(form.faculty_id),
          course_section_id: Number(form.course_section_id),
          start_date: form.start_date,
          end_date: form.end_date,
          status: 'active',
        },
        { token }
      );
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed');
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-3 card p-5 sm:grid-cols-2">
      {err ? (
        <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
      ) : null}
      <Field label="Template *">
        <select
          className="input-field"
          value={form.template_id}
          onChange={(e) => setForm({ ...form, template_id: e.target.value })}
          required
        >
          <option value="">Select…</option>
          {(lookup.templates || []).map((t) => (
            <option key={t.id} value={t.id}>
              #{t.id} — {t.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Faculty *">
        <select
          className="input-field"
          value={form.faculty_id}
          onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
          required
        >
          <option value="">Select…</option>
          {lookup.faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Section *" className="sm:col-span-2">
        <select
          className="input-field"
          value={form.course_section_id}
          onChange={(e) => setForm({ ...form, course_section_id: e.target.value })}
          required
        >
          <option value="">Select…</option>
          {lookup.sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.course_code} · {sec.section_name} · {sec.joining_year}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Start *">
        <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
      </Field>
      <Field label="End *">
        <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit">Assign form</Button>
      </div>
    </form>
  );
}

function FeedbackAnalyticsPanel({ token, lookup }) {
  const [courseId, setCourseId] = useState('');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [compareFacultyIds, setCompareFacultyIds] = useState([]);
  const [detailFacultyId, setDetailFacultyId] = useState('');
  const [detailRows, setDetailRows] = useState([]);
  const [detailErr, setDetailErr] = useState('');

  const facultyOptions = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r.faculty_id)) m.set(r.faculty_id, r.faculty_name);
    }
    return [...m.entries()].map(([id, name]) => ({ id, name }));
  }, [rows]);

  const compareRows = useMemo(() => {
    if (!compareFacultyIds.length) return [];
    const wanted = new Set(compareFacultyIds.map(Number));
    return rows.filter((r) => wanted.has(Number(r.faculty_id)));
  }, [rows, compareFacultyIds]);

  const compareByQuestion = useMemo(() => {
    const map = new Map();
    for (const r of compareRows) {
      const key = r.question_id;
      if (!map.has(key)) map.set(key, { question_text: r.question_text, values: {} });
      map.get(key).values[r.faculty_id] = r.avg_rating;
    }
    return [...map.entries()].map(([qid, v]) => ({ question_id: qid, ...v }));
  }, [compareRows]);

  async function load() {
    setErr('');
    try {
      const qs = new URLSearchParams();
      qs.set('course_id', courseId);
      if (sectionId) qs.set('course_section_id', sectionId);
      if (dateFrom) qs.set('date_from', dateFrom);
      if (dateTo) qs.set('date_to', dateTo);
      if (compareFacultyIds.length) qs.set('faculty_ids', compareFacultyIds.join(','));
      const d = await apiGet(`/api/admin/feedback/analytics?${qs.toString()}`, { token });
      setRows(d.items || []);
    } catch (e2) {
      setErr(e2.message || 'Failed');
    }
  }

  async function loadDetails() {
    setDetailErr('');
    try {
      const qs = new URLSearchParams();
      qs.set('course_id', courseId);
      if (sectionId) qs.set('course_section_id', sectionId);
      if (dateFrom) qs.set('date_from', dateFrom);
      if (dateTo) qs.set('date_to', dateTo);
      if (detailFacultyId) qs.set('faculty_id', detailFacultyId);
      const d = await apiGet(`/api/admin/feedback/responses?${qs.toString()}`, { token });
      setDetailRows(d.items || []);
    } catch (e2) {
      setDetailErr(e2.message || 'Failed');
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">Rating averages by faculty and question for a given course.</p>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Course *">
          <select
            className="input-field min-w-[280px]"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Select…</option>
            {(lookup?.courses || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.course_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Section (optional)">
          <select
            className="input-field min-w-[220px]"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">All</option>
            {(lookup?.sections || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.course_code} · Sec {s.section_name} · {s.joining_year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </Field>
        <Button type="button" onClick={load}>
          Load
        </Button>
      </div>
      {err ? <div className="text-sm text-red-600">{err}</div> : null}

      <div className="card p-5">
        <p className="text-sm font-semibold text-primary">Compare mode (up to 3 faculty)</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {facultyOptions.map((f) => {
            const active = compareFacultyIds.includes(String(f.id)) || compareFacultyIds.includes(Number(f.id));
            return (
              <button
                key={f.id}
                type="button"
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors',
                  active ? 'bg-accent text-white ring-accent' : 'bg-surface text-secondary ring-border hover:bg-accent/5 hover:text-accent',
                ].join(' ')}
                onClick={() => {
                  setCompareFacultyIds((prev) => {
                    const has = prev.map(String).includes(String(f.id));
                    if (has) return prev.filter((x) => String(x) !== String(f.id));
                    if (prev.length >= 3) return prev;
                    return [...prev, f.id];
                  });
                }}
              >
                {f.name}
              </button>
            );
          })}
          {!facultyOptions.length ? <p className="text-sm text-secondary/80">Load analytics to choose faculty.</p> : null}
        </div>

        {compareFacultyIds.length ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/5 text-xs font-semibold uppercase text-secondary/70">
                <tr>
                  <th className="px-4 py-2">Question</th>
                  {compareFacultyIds.map((id) => {
                    const name = facultyOptions.find((x) => String(x.id) === String(id))?.name || `#${id}`;
                    return (
                      <th key={id} className="px-4 py-2">
                        {name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {compareByQuestion.map((q) => (
                  <tr key={q.question_id}>
                    <td className="px-4 py-2">{q.question_text}</td>
                    {compareFacultyIds.map((id) => {
                      const v = q.values[id];
                      const num = v != null ? Number(v) : null;
                      return (
                        <td key={id} className="px-4 py-2">
                          {num != null ? num.toFixed(2) : '—'}
                          {num != null ? (
                            <div className="mt-1 h-2 w-32 rounded bg-secondary/10">
                              <div
                                className="h-2 rounded bg-accent"
                                style={{ width: `${Math.max(0, Math.min(100, (num / 5) * 100))}%` }}
                              />
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-secondary/80">Select faculty to compare.</p>
        )}
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-primary">Detailed responses</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <Field label="Faculty (optional)">
            <select
              className="input-field min-w-[260px]"
              value={detailFacultyId}
              onChange={(e) => setDetailFacultyId(e.target.value)}
            >
              <option value="">All</option>
              {facultyOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Field>
          <Button type="button" onClick={loadDetails} disabled={!courseId}>
            Load responses
          </Button>
        </div>
        {detailErr ? <div className="mt-2 text-sm text-danger">{detailErr}</div> : null}
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-secondary/5 text-xs font-semibold uppercase text-secondary/70">
              <tr>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Faculty</th>
                <th className="px-4 py-2">Section</th>
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2">Answer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {detailRows.map((r, i) => (
                <tr key={`${r.response_id ?? 'resp'}-${r.question_id ?? 'q'}-${i}`}>
                  <td className="px-4 py-2 text-xs text-secondary">{String(r.submitted_at).replace('T', ' ').slice(0, 16)}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-primary">{r.student_name}</div>
                    <div className="font-mono text-xs text-secondary">{r.usn}</div>
                  </td>
                  <td className="px-4 py-2">{r.faculty_name}</td>
                  <td className="px-4 py-2">{r.section_name}</td>
                  <td className="px-4 py-2">{r.question_text}</td>
                  <td className="px-4 py-2">{r.answer}</td>
                </tr>
              ))}
              {!detailRows.length ? (
                <tr>
                  <td className="px-4 py-3 text-sm text-secondary/80" colSpan={6}>
                    No responses loaded.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">Faculty</th>
            <th className="px-4 py-2">Question</th>
            <th className="px-4 py-2">Avg rating</th>
            <th className="px-4 py-2">N</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={`${r.faculty_id}-${r.question_text}-${i}`}>
              <td className="px-4 py-2">{r.faculty_name}</td>
              <td className="px-4 py-2">{r.question_text}</td>
              <td className="px-4 py-2">{r.avg_rating != null ? Number(r.avg_rating).toFixed(2) : '—'}</td>
              <td className="px-4 py-2">{r.answer_count}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function DashboardPanel({ token }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, s, st, f] = await Promise.all([
          apiGet('/api/admin/universities', { token }),
          apiGet('/api/admin/schools', { token }),
          apiGet('/api/admin/students', { token }),
          apiGet('/api/admin/faculty', { token }),
        ]);
        if (!cancelled) {
          setStats({
            universities: (u.items || []).length,
            schools: (s.items || []).length,
            students: (st.items || []).length,
            faculty: (f.items || []).length,
          });
        }
      } catch {
        if (!cancelled) setStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);
  const cards = [
    { label: 'Universities', value: stats?.universities ?? '—' },
    { label: 'Schools', value: stats?.schools ?? '—' },
    { label: 'Students', value: stats?.students ?? '—' },
    { label: 'Faculty', value: stats?.faculty ?? '—' },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{c.label}</p>
          <p className="mt-2 text-3xl font-bold text-primary">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function FacultyMappingPanel({ items, token, lookup, onDone, confirmAction, toast }) {
  const empty = { course_section_id: '', faculty_id: '', role: 'primary' };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiPost(
        '/api/admin/faculty-mappings',
        {
          course_section_id: Number(form.course_section_id),
          faculty_id: Number(form.faculty_id),
          role: form.role,
        },
        { token }
      );
      setForm(empty);
      onDone();
      toast?.({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Failed');
      toast?.({ type: 'error', message: 'Error occurred' });
    }
  }

  async function remove(id) {
    confirmAction?.({
      title: 'Remove mapping',
      message: 'Remove this faculty → section mapping?',
      danger: true,
      onYes: async () => {
        try {
          await apiDelete(`/api/admin/faculty-mappings/${id}`, { token });
          onDone();
          toast?.({ type: 'success', message: 'Saved successfully' });
        } catch (e2) {
          setErr(e2.message || 'Delete failed');
          toast?.({ type: 'error', message: 'Error occurred' });
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">Map faculty to a section</div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="Section *">
          <select
            className="input-field"
            value={form.course_section_id}
            onChange={(e) => setForm({ ...form, course_section_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {lookup.sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.course_code} · {sec.section_name} · {sec.joining_year} ({sec.program_name})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Faculty *">
          <select
            className="input-field"
            value={form.faculty_id}
            onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {lookup.faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.faculty_code})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Role *">
          <select
            className="input-field"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="primary">primary</option>
            <option value="co_faculty">co_faculty</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit">Add mapping</Button>
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">Faculty</th>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Course</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2">{r.faculty_name}</td>
              <td className="px-4 py-2 font-medium">{r.section_name}</td>
              <td className="px-4 py-2 text-secondary">{r.course_code}</td>
              <td className="px-4 py-2 capitalize">{r.role}</td>
              <td className="px-4 py-2 text-right">
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => remove(r.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function EnrollmentsAdminPanel({ items, token, lookup, onDone, confirmAction, toast }) {
  const empty = { student_id: '', course_section_id: '' };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiPost(
        '/api/admin/student-enrollments',
        {
          student_id: Number(form.student_id),
          course_section_id: Number(form.course_section_id),
        },
        { token }
      );
      setForm(empty);
      onDone();
      toast?.({ type: 'success', message: 'Saved successfully' });
    } catch (e2) {
      setErr(e2.message || 'Failed');
      toast?.({ type: 'error', message: 'Error occurred' });
    }
  }

  async function remove(id) {
    confirmAction?.({
      title: 'Remove enrollment',
      message: 'Remove this student enrollment from the section?',
      danger: true,
      onYes: async () => {
        try {
          await apiDelete(`/api/admin/student-enrollments/${id}`, { token });
          onDone();
          toast?.({ type: 'success', message: 'Saved successfully' });
        } catch (e2) {
          setErr(e2.message || 'Delete failed');
          toast?.({ type: 'error', message: 'Error occurred' });
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary">
        Manual enrollments for minors and electives. Core courses are filled automatically when student affiliation is
        saved.
      </p>
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="Student *">
          <select
            className="input-field"
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {lookup.studentsList.map((s, i) => (
              <option key={`${s.id ?? s.usn ?? s.email ?? 'stu'}-${i}`} value={s.id}>
                {s.name} ({s.usn})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Section *">
          <select
            className="input-field"
            value={form.course_section_id}
            onChange={(e) => setForm({ ...form, course_section_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {lookup.sections.map((sec, i) => (
              <option key={`${sec.id ?? sec.course_code ?? sec.section_name ?? 'sec'}-${i}`} value={sec.id}>
                {sec.course_code} · {sec.section_name} · batch {sec.joining_year}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit">Enroll</Button>
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">Student</th>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Course</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
            <tr
              key={`${r.id ?? 'enr'}-${r.student_id ?? r.usn ?? r.student_name ?? 'stu'}-${
                r.course_section_id ?? r.section_name ?? r.course_code ?? 'sec'
              }-${i}`}
            >
              <td className="px-4 py-2">
                <div className="font-medium">{r.student_name}</div>
                <div className="font-mono text-xs text-muted">{r.usn}</div>
              </td>
              <td className="px-4 py-2">{r.section_name}</td>
              <td className="px-4 py-2 text-secondary">{r.course_code}</td>
              <td className="px-4 py-2 text-right">
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => remove(r.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function AttendanceAdminPanel({ items }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">Aggregated attendance from the attendance_summary view (per student / section).</p>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">Student ID</th>
            <th className="px-4 py-2">Section ID</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Attended</th>
            <th className="px-4 py-2">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
            <tr key={`${r.student_id ?? 'stu'}-${r.course_section_id ?? 'sec'}-${i}`}>
              <td className="px-4 py-2 font-mono text-xs">{r.student_id}</td>
              <td className="px-4 py-2 font-mono text-xs">{r.course_section_id}</td>
              <td className="px-4 py-2">{r.total_classes}</td>
              <td className="px-4 py-2">{r.attended}</td>
              <td className="px-4 py-2">{r.percentage}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function UniversityPanel({ items, path, token, onDone, onDelete, toast }) {
  const empty = { name: '', abbreviation: '', address: '', email: '', phone: '', website: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      name: r.name || '',
      abbreviation: r.abbreviation || '',
      address: r.address || '',
      email: r.email || '',
      phone: r.phone || '',
      website: r.website || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      if (editingId) await apiPut(`${path}/${editingId}`, form, { token });
      else await apiPost(path, form, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Abbreviation">
          <Input value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add university'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Abbr</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2">{r.abbreviation || '—'}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function CampusPanel({ items, path, token, universities, onDone, onDelete, toast }) {
  const empty = { university_id: '', name: '', abbreviation: '', address: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      university_id: String(r.university_id),
      name: r.name || '',
      abbreviation: r.abbreviation || '',
      address: r.address || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const body = { ...form, university_id: Number(form.university_id) };
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="University *">
          <select
            className="input-field"
            value={form.university_id}
            onChange={(e) => setForm({ ...form, university_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Abbreviation">
          <Input value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add campus'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">University</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 text-secondary">{r.university_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function SchoolPanel({ items, path, token, campuses, onDone, onDelete }) {
  const empty = { campus_id: '', name: '', abbreviation: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      campus_id: String(r.campus_id),
      name: r.name || '',
      abbreviation: r.abbreviation || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    const body = { ...form, campus_id: Number(form.campus_id) };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="Campus *">
          <select
            className="input-field"
            value={form.campus_id}
            onChange={(e) => setForm({ ...form, campus_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Abbreviation">
          <Input value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit">{editingId ? 'Save changes' : 'Add school'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Campus</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 text-secondary">{r.campus_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function ProgramPanel({ items, path, token, schools, onDone, onDelete, toast }) {
  const empty = { school_id: '', name: '', abbreviation: '', duration_years: 4, exit_years: '[4]' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      school_id: String(r.school_id),
      name: r.name || '',
      abbreviation: r.abbreviation || '',
      duration_years: r.duration_years ?? 4,
      exit_years: r.exit_years || '[4]',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    const body = {
      school_id: Number(form.school_id),
      name: form.name,
      abbreviation: form.abbreviation,
      duration_years: Number(form.duration_years),
      exit_years: form.exit_years,
    };
    try {
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="School *">
          <select
            className="input-field"
            value={form.school_id}
            onChange={(e) => setForm({ ...form, school_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Abbreviation">
          <Input value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
        </Field>
        <Field label="Duration (years)">
          <Input
            type="number"
            value={form.duration_years}
            onChange={(e) => setForm({ ...form, duration_years: e.target.value })}
          />
        </Field>
        <Field label="Exit years (JSON)">
          <Input
            value={form.exit_years}
            onChange={(e) => setForm({ ...form, exit_years: e.target.value })}
            placeholder='e.g. [3,4]'
          />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add program'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">School</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 text-secondary">{r.school_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function BatchPanel({ items, path, token, schools, programs, onDone, onDelete, toast }) {
  const empty = { school_id: '', program_id: '', joining_year: new Date().getFullYear() };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const programsForSchool = (schoolId) =>
    !schoolId ? [] : programs.filter((p) => p.school_id === Number(schoolId));

  function startEdit(r) {
    const prog = programs.find((p) => p.id === r.program_id);
    setEditingId(r.id);
    setForm({
      school_id: prog ? String(prog.school_id) : '',
      program_id: String(r.program_id),
      joining_year: r.joining_year,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const body = { program_id: Number(form.program_id), joining_year: Number(form.joining_year) };
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary">Hierarchy: School → Program → batch year.</p>
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="School *">
          <select
            className="input-field"
            value={form.school_id}
            onChange={(e) => setForm({ ...form, school_id: e.target.value, program_id: '' })}
            required
          >
            <option value="">Select…</option>
            {schools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program *">
          <select
            className="input-field"
            value={form.program_id}
            onChange={(e) => setForm({ ...form, program_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {programsForSchool(form.school_id).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Joining year *">
          <Input
            type="number"
            value={form.joining_year}
            onChange={(e) => setForm({ ...form, joining_year: e.target.value })}
            required
          />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add batch'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Program</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.joining_year}</td>
              <td className="px-4 py-2 text-secondary">{r.program_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function CourseGroupPanel({ items, path, token, schools, programs, onDone, onDelete, toast }) {
  const empty = { school_id: '', program_id: '', name: '', track: 'core' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      school_id: String(r.school_id),
      program_id: r.program_id != null ? String(r.program_id) : '',
      name: r.name || '',
      track: r.track || 'core',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    const body = {
      school_id: Number(form.school_id),
      program_id: form.program_id ? Number(form.program_id) : null,
      name: form.name,
      track: form.track,
    };
    try {
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-primary">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{err}</div>
        ) : null}
        <Field label="School *">
          <select
            className="input-field"
            value={form.school_id}
            onChange={(e) => setForm({ ...form, school_id: e.target.value, program_id: '' })}
            required
          >
            <option value="">Select…</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program (optional)">
          <select
            className="input-field"
            value={form.program_id}
            onChange={(e) => setForm({ ...form, program_id: e.target.value })}
            disabled={!form.school_id}
          >
            <option value="">None (school-wide)</option>
            {programs
              .filter((p) => !form.school_id || p.school_id === Number(form.school_id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Track *">
          <select
            className="input-field"
            value={form.track}
            onChange={(e) => setForm({ ...form, track: e.target.value })}
          >
            {['core', 'minor', 'major', 'specialization', 'elective'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add course group'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Track</th>
            <th className="px-4 py-2">School</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 capitalize">{r.track}</td>
              <td className="px-4 py-2 text-secondary">{r.school_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function CoursePanel({ items, path, token, schools, programs, courseGroups, onDone, onDelete, toast }) {
  const empty = {
    school_id: '',
    program_id: '',
    course_group_id: '',
    course_name: '',
    course_code: '',
    credits: 0,
    lecture_hours: 0,
    tutorial_hours: 0,
    practical_hours: 0,
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const groupsFiltered = courseGroups.filter((g) => {
    if (!form.school_id || g.school_id !== Number(form.school_id)) return false;
    if (!form.program_id) return true;
    return g.program_id == null || g.program_id === Number(form.program_id);
  });

  function startEdit(r) {
    const g = courseGroups.find((x) => x.id === r.course_group_id);
    setEditingId(r.id);
    setForm({
      school_id: g ? String(g.school_id) : '',
      program_id: g && g.program_id != null ? String(g.program_id) : '',
      course_group_id: String(r.course_group_id),
      course_name: r.course_name || '',
      course_code: r.course_code || '',
      credits: r.credits ?? 0,
      lecture_hours: r.lecture_hours ?? 0,
      tutorial_hours: r.tutorial_hours ?? 0,
      practical_hours: r.practical_hours ?? 0,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    const body = {
      course_group_id: Number(form.course_group_id),
      course_name: form.course_name,
      course_code: form.course_code,
      credits: Number(form.credits),
      lecture_hours: Number(form.lecture_hours),
      tutorial_hours: Number(form.tutorial_hours),
      practical_hours: Number(form.practical_hours),
    };
    try {
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary">Hierarchy: School → Program → Course group → course details.</p>
      <form
        onSubmit={submit}
        className="grid gap-4 card p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="sm:col-span-2 text-sm font-medium text-primary lg:col-span-3">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger lg:col-span-3">
            {err}
          </div>
        ) : null}
        <Field label="School *">
          <select
            className="input-field"
            value={form.school_id}
            onChange={(e) =>
              setForm({ ...form, school_id: e.target.value, program_id: '', course_group_id: '' })
            }
            required
          >
            <option value="">Select…</option>
            {schools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program (filter)">
          <select
            className="input-field"
            value={form.program_id}
            onChange={(e) => setForm({ ...form, program_id: e.target.value, course_group_id: '' })}
            disabled={!form.school_id}
          >
            <option value="">Any / school-wide groups</option>
            {programs
              .filter((p) => p.school_id === Number(form.school_id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Course group *">
          <select
            className="input-field"
            value={form.course_group_id}
            onChange={(e) => setForm({ ...form, course_group_id: e.target.value })}
            required
            disabled={!form.school_id}
          >
            <option value="">Select…</option>
            {groupsFiltered.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.track})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Course name *">
          <Input value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} required />
        </Field>
        <Field label="Code *">
          <Input value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} required />
        </Field>
        <Field label="Credits">
          <Input type="number" step="0.5" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
        </Field>
        <Field label="L">
          <Input type="number" value={form.lecture_hours} onChange={(e) => setForm({ ...form, lecture_hours: e.target.value })} />
        </Field>
        <Field label="T">
          <Input type="number" value={form.tutorial_hours} onChange={(e) => setForm({ ...form, tutorial_hours: e.target.value })} />
        </Field>
        <Field label="P">
          <Input type="number" value={form.practical_hours} onChange={(e) => setForm({ ...form, practical_hours: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add course'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Code</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Group</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2 font-medium">{r.course_code}</td>
              <td className="px-4 py-2">{r.course_name}</td>
              <td className="px-4 py-2 text-secondary">{r.course_group_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function OfferingPanel({
  items,
  path,
  token,
  schools,
  programs,
  courseGroups,
  courses,
  batches,
  onDone,
  onDelete,
  toast,
}) {
  const empty = {
    school_id: '',
    program_id: '',
    course_group_id: '',
    course_id: '',
    batch_id: '',
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const coursesFiltered = courses.filter((c) => {
    if (!form.course_group_id) return false;
    return c.course_group_id === Number(form.course_group_id);
  });

  const batchesFiltered = batches.filter((b) => {
    if (!form.program_id) return false;
    return b.program_id === Number(form.program_id);
  });

  function startEdit(r) {
    const crs = courses.find((c) => c.id === r.course_id);
    const cg = crs ? courseGroups.find((g) => g.id === crs.course_group_id) : null;
    const bat = batches.find((b) => b.id === r.batch_id);
    const prog = bat ? programs.find((p) => p.id === bat.program_id) : null;
    setEditingId(r.id);
    setForm({
      school_id: prog ? String(prog.school_id) : '',
      program_id: bat ? String(bat.program_id) : '',
      course_group_id: cg ? String(cg.id) : '',
      course_id: String(r.course_id),
      batch_id: String(r.batch_id),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const body = { course_id: Number(form.course_id), batch_id: Number(form.batch_id) };
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary">
        Full chain: School → Program → Course group → Course → Batch (same program). Server validates program alignment.
      </p>
      <form
        onSubmit={submit}
        className="grid gap-4 card p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="sm:col-span-2 text-sm font-medium text-primary lg:col-span-3">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger lg:col-span-3">
            {err}
          </div>
        ) : null}
        <Field label="School *">
          <select
            className="input-field"
            value={form.school_id}
            onChange={(e) =>
              setForm({
                ...form,
                school_id: e.target.value,
                program_id: '',
                course_group_id: '',
                course_id: '',
                batch_id: '',
              })
            }
            required
          >
            <option value="">Select…</option>
            {schools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program *">
          <select
            className="input-field"
            value={form.program_id}
            onChange={(e) =>
              setForm({ ...form, program_id: e.target.value, course_group_id: '', course_id: '', batch_id: '' })
            }
            required
            disabled={!form.school_id}
          >
            <option value="">Select…</option>
            {programs
              .filter((p) => p.school_id === Number(form.school_id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Course group *">
          <select
            className="input-field"
            value={form.course_group_id}
            onChange={(e) => setForm({ ...form, course_group_id: e.target.value, course_id: '' })}
            required
            disabled={!form.program_id}
          >
            <option value="">Select…</option>
            {courseGroups
              .filter(
                (g) =>
                  g.school_id === Number(form.school_id) &&
                  (g.program_id == null || g.program_id === Number(form.program_id))
              )
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.track})
                </option>
              ))}
          </select>
        </Field>
        <Field label="Course *">
          <select
            className="input-field"
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            required
            disabled={!form.course_group_id}
          >
            <option value="">Select…</option>
            {coursesFiltered.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.course_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Batch *">
          <select
            className="input-field"
            value={form.batch_id}
            onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
            required
            disabled={!form.program_id}
          >
            <option value="">Select…</option>
            {batchesFiltered.map((b) => (
              <option key={b.id} value={b.id}>
                {b.joining_year} — {b.program_name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add offering'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Course</th>
            <th className="px-4 py-2">Batch</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">
                {r.course_code} — {r.course_name}
              </td>
              <td className="px-4 py-2 text-secondary">
                {r.joining_year} ({r.program_name})
              </td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function SectionPanel({
  items,
  path,
  token,
  schools,
  programs,
  courseGroups,
  courses,
  batches,
  offerings,
  onDone,
  onDelete,
  toast,
}) {
  const empty = {
    school_id: '',
    program_id: '',
    course_group_id: '',
    course_id: '',
    batch_id: '',
    course_offering_id: '',
    section_name: '',
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const offeringsFiltered = offerings.filter((o) => {
    if (form.course_id && Number(form.course_id) !== o.course_id) return false;
    if (form.batch_id && Number(form.batch_id) !== o.batch_id) return false;
    return true;
  });

  const coursesFiltered = courses.filter((c) => {
    if (!form.course_group_id) return false;
    return c.course_group_id === Number(form.course_group_id);
  });

  const batchesFiltered = batches.filter((b) => {
    if (!form.program_id) return false;
    return b.program_id === Number(form.program_id);
  });

  function startEdit(r) {
    const off = offerings.find((o) => o.id === r.course_offering_id);
    const crs = off ? courses.find((c) => c.id === off.course_id) : null;
    const cg = crs ? courseGroups.find((g) => g.id === crs.course_group_id) : null;
    const bat = off ? batches.find((b) => b.id === off.batch_id) : null;
    const prog = bat ? programs.find((p) => p.id === bat.program_id) : null;
    setEditingId(r.id);
    setForm({
      school_id: prog ? String(prog.school_id) : '',
      program_id: bat ? String(bat.program_id) : '',
      course_group_id: cg ? String(cg.id) : '',
      course_id: off ? String(off.course_id) : '',
      batch_id: off ? String(off.batch_id) : '',
      course_offering_id: String(r.course_offering_id),
      section_name: r.section_name || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const body = { course_offering_id: Number(form.course_offering_id), section_name: form.section_name };
      if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
      else await apiPost(path, body, { token });
      toast?.({ type: 'success', message: 'Saved successfully' });
      cancelEdit();
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
      toast?.({ type: 'error', message: 'Error occurred' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary">
        Hierarchy through School → Program → Course group → Course → Batch, then pick the matching offering and section
        name.
      </p>
      <form
        onSubmit={submit}
        className="grid gap-4 card p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="sm:col-span-2 text-sm font-medium text-primary lg:col-span-3">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        {err ? (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger lg:col-span-3">
            {err}
          </div>
        ) : null}
        <Field label="School *">
          <select
            className="input-field"
            value={form.school_id}
            onChange={(e) =>
              setForm({
                ...empty,
                school_id: e.target.value,
              })
            }
            required
          >
            <option value="">Select…</option>
            {schools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program *">
          <select
            className="input-field"
            value={form.program_id}
            onChange={(e) =>
              setForm({
                ...form,
                program_id: e.target.value,
                course_group_id: '',
                course_id: '',
                batch_id: '',
                course_offering_id: '',
              })
            }
            required
            disabled={!form.school_id}
          >
            <option value="">Select…</option>
            {programs
              .filter((p) => p.school_id === Number(form.school_id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Course group *">
          <select
            className="input-field"
            value={form.course_group_id}
            onChange={(e) =>
              setForm({
                ...form,
                course_group_id: e.target.value,
                course_id: '',
                batch_id: '',
                course_offering_id: '',
              })
            }
            required
            disabled={!form.program_id}
          >
            <option value="">Select…</option>
            {courseGroups
              .filter(
                (g) =>
                  g.school_id === Number(form.school_id) &&
                  (g.program_id == null || g.program_id === Number(form.program_id))
              )
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.track})
                </option>
              ))}
          </select>
        </Field>
        <Field label="Course *">
          <select
            className="input-field"
            value={form.course_id}
            onChange={(e) =>
              setForm({ ...form, course_id: e.target.value, batch_id: '', course_offering_id: '' })
            }
            required
            disabled={!form.course_group_id}
          >
            <option value="">Select…</option>
            {coursesFiltered.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.course_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Batch *">
          <select
            className="input-field"
            value={form.batch_id}
            onChange={(e) => setForm({ ...form, batch_id: e.target.value, course_offering_id: '' })}
            required
            disabled={!form.program_id || !form.course_id}
          >
            <option value="">Select…</option>
            {batchesFiltered.map((b) => (
              <option key={b.id} value={b.id}>
                {b.joining_year} — {b.program_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Offering *">
          <select
            className="input-field"
            value={form.course_offering_id}
            onChange={(e) => setForm({ ...form, course_offering_id: e.target.value })}
            required
            disabled={!form.course_id || !form.batch_id}
          >
            <option value="">Select…</option>
            {offeringsFiltered.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id} {o.course_code} / {o.joining_year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Section *">
          <Input value={form.section_name} onChange={(e) => setForm({ ...form, section_name: e.target.value })} required />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Save changes' : 'Add section'}
          </Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Course / batch</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r, i) => (
<tr key={r.id ?? i}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2 font-medium">{r.section_name}</td>
              <td className="px-4 py-2 text-secondary">
                {r.course_code} · {r.joining_year}
              </td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-accent transition-colors hover:text-accent-light" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-danger transition-colors hover:text-danger/80" onClick={() => onDelete(path, r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function StudentsPanel({ items, token, lookup, onDone }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');

  const programsForSchool = (schoolId) =>
    !schoolId ? [] : lookup.programs.filter((p) => p.school_id === Number(schoolId));

  const batchesForProgram = (programId) =>
    !programId ? [] : lookup.batches.filter((b) => b.program_id === Number(programId));

  const groupsByTrack = (track) => lookup.courseGroups.filter((g) => g.track === track);

  function startEdit(s) {
    setEditing(s.id);
    setForm({
      school_id: s.school_id ?? '',
      program_id: s.program_id ?? '',
      batch_id: s.batch_id ?? '',
      major_id: s.major_id ?? '',
      minor_id: s.minor_id ?? '',
      specialization_id: s.specialization_id ?? '',
    });
    setErr('');
  }

  async function save(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiPatch(
        `/api/admin/students/${editing}`,
        {
          school_id: form.school_id === '' ? null : Number(form.school_id),
          program_id: form.program_id === '' ? null : Number(form.program_id),
          batch_id: form.batch_id === '' ? null : Number(form.batch_id),
          major_id: form.major_id === '' ? null : Number(form.major_id),
          minor_id: form.minor_id === '' ? null : Number(form.minor_id),
          specialization_id: form.specialization_id === '' ? null : Number(form.specialization_id),
        },
        { token }
      );
      setEditing(null);
      onDone();
    } catch (e2) {
      setErr(e2.message || 'Update failed');
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Link students to school, program, batch, and course groups. Major, minor, and specialization groups must use
        matching tracks.
      </p>
      {err ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
      <TableShell>
        <thead className="bg-background text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2">Student</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((s, i) => (
            <tr key={s.id ?? `stu-${s.usn ?? s.email ?? i}`} className="align-top">
              <td className="px-4 py-3">
                <div className="font-semibold text-primary">{s.name}</div>
                <div className="font-mono text-xs text-muted">{s.usn}</div>
              </td>
              <td className="px-4 py-3 text-sm text-secondary">{s.email}</td>
              <td className="px-4 py-3 text-right">
                {editing === s.id ? (
                  <form onSubmit={save} className="space-y-3 text-left">
                    <Field label="School">
                      <select
                        className="w-full max-w-xs rounded-md border border-border px-2 py-1 text-sm"
                        value={form.school_id}
                        onChange={(e) =>
                          setForm({ ...form, school_id: e.target.value, program_id: '', batch_id: '' })
                        }
                      >
                        <option value="">—</option>
                        {lookup.schools.map((sch) => (
                          <option key={sch.id} value={sch.id}>
                            {sch.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Program">
                      <select
                        className="w-full max-w-xs rounded-md border border-border px-2 py-1 text-sm"
                        value={form.program_id}
                        onChange={(e) => setForm({ ...form, program_id: e.target.value, batch_id: '' })}
                      >
                        <option value="">—</option>
                        {programsForSchool(form.school_id).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Batch">
                      <select
                        className="w-full max-w-xs rounded-md border border-border px-2 py-1 text-sm"
                        value={form.batch_id}
                        onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                      >
                        <option value="">—</option>
                        {batchesForProgram(form.program_id).map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.joining_year}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Major (track: major)">
                      <select
                        className="w-full max-w-xs rounded-md border border-border px-2 py-1 text-sm"
                        value={form.major_id}
                        onChange={(e) => setForm({ ...form, major_id: e.target.value })}
                      >
                        <option value="">—</option>
                        {groupsByTrack('major').map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Minor (track: minor)">
                      <select
                        className="w-full max-w-xs rounded-md border border-border px-2 py-1 text-sm"
                        value={form.minor_id}
                        onChange={(e) => setForm({ ...form, minor_id: e.target.value })}
                      >
                        <option value="">—</option>
                        {groupsByTrack('minor').map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Specialization (track: specialization)">
                      <select
                        className="w-full max-w-xs rounded-md border border-border px-2 py-1 text-sm"
                        value={form.specialization_id}
                        onChange={(e) => setForm({ ...form, specialization_id: e.target.value })}
                      >
                        <option value="">—</option>
                        {groupsByTrack('specialization').map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-2 text-sm"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="text-sm font-medium text-accent transition-colors hover:text-accent-light"
                    onClick={() => startEdit(s)}
                  >
                    Edit links
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}
