import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../api';
import { getToken } from '../auth';
import { Button, Field, Input } from '../components/FormParts';

const TABS = [
  { id: 'university', label: 'Universities', path: '/api/admin/universities' },
  { id: 'campus', label: 'Campuses', path: '/api/admin/campuses' },
  { id: 'school', label: 'Schools', path: '/api/admin/schools' },
  { id: 'program', label: 'Programs', path: '/api/admin/programs' },
  { id: 'batch', label: 'Batches', path: '/api/admin/batches' },
  { id: 'courseGroup', label: 'Course groups', path: '/api/admin/course-groups' },
  { id: 'course', label: 'Courses', path: '/api/admin/courses' },
  { id: 'offering', label: 'Offerings', path: '/api/admin/course-offerings' },
  { id: 'section', label: 'Sections', path: '/api/admin/course-sections' },
  { id: 'students', label: 'Student links', path: '/api/admin/students' },
];

function TableShell({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const token = getToken();
  const [tab, setTab] = useState('university');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lookup, setLookup] = useState({
    universities: [],
    campuses: [],
    schools: [],
    programs: [],
    batches: [],
    courseGroups: [],
    courses: [],
    offerings: [],
  });

  const loadLookups = useCallback(async () => {
    try {
      const [u, c, s, p, b, cg, cr, of] = await Promise.all([
        apiGet('/api/admin/universities', { token }),
        apiGet('/api/admin/campuses', { token }),
        apiGet('/api/admin/schools', { token }),
        apiGet('/api/admin/programs', { token }),
        apiGet('/api/admin/batches', { token }),
        apiGet('/api/admin/course-groups', { token }),
        apiGet('/api/admin/courses', { token }),
        apiGet('/api/admin/course-offerings', { token }),
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
      });
    } catch {
      /* optional for partial UI */
    }
  }, [token]);

  const refresh = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      if (tab === 'students') {
        const d = await apiGet('/api/admin/students', { token });
        setItems(d.items || []);
      } else {
        const t = TABS.find((x) => x.id === tab);
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
    if (!window.confirm('Delete this record?')) return;
    setError('');
    try {
      await apiDelete(`${path}/${id}`, { token });
      await refresh();
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  }

  const path = TABS.find((x) => x.id === tab)?.path || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Administration</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage academic structure and student affiliations. All changes require an admin session.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

      {tab === 'university' ? (
        <UniversityPanel items={items} path={path} token={token} onDone={refresh} onDelete={removeRow} />
      ) : null}
      {tab === 'campus' ? (
        <CampusPanel
          items={items}
          path={path}
          token={token}
          universities={lookup.universities}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'school' ? (
        <SchoolPanel
          items={items}
          path={path}
          token={token}
          campuses={lookup.campuses}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'program' ? (
        <ProgramPanel
          items={items}
          path={path}
          token={token}
          schools={lookup.schools}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'batch' ? (
        <BatchPanel
          items={items}
          path={path}
          token={token}
          programs={lookup.programs}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'courseGroup' ? (
        <CourseGroupPanel
          items={items}
          path={path}
          token={token}
          schools={lookup.schools}
          programs={lookup.programs}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'course' ? (
        <CoursePanel
          items={items}
          path={path}
          token={token}
          courseGroups={lookup.courseGroups}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'offering' ? (
        <OfferingPanel
          items={items}
          path={path}
          token={token}
          courses={lookup.courses}
          batches={lookup.batches}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'section' ? (
        <SectionPanel
          items={items}
          path={path}
          token={token}
          offerings={lookup.offerings}
          onDone={refresh}
          onDelete={removeRow}
        />
      ) : null}
      {tab === 'students' ? (
        <StudentsPanel
          items={items}
          token={token}
          lookup={lookup}
          onDone={refresh}
        />
      ) : null}
    </div>
  );
}

function UniversityPanel({ items, path, token, onDone, onDelete }) {
  const empty = { name: '', abbreviation: '', address: '', email: '', phone: '', website: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

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
    if (editingId) await apiPut(`${path}/${editingId}`, form, { token });
    else await apiPost(path, form, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add university'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Abbr</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2">{r.abbreviation || '—'}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function CampusPanel({ items, path, token, universities, onDone, onDelete }) {
  const empty = { university_id: '', name: '', abbreviation: '', address: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

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
    const body = { ...form, university_id: Number(form.university_id) };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="University *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add campus'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">University</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 text-slate-600">{r.university_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="Campus *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Campus</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 text-slate-600">{r.campus_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function ProgramPanel({ items, path, token, schools, onDone, onDelete }) {
  const empty = { school_id: '', name: '', abbreviation: '', duration_years: 4, exit_years: '[4]' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

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
    const body = {
      school_id: Number(form.school_id),
      name: form.name,
      abbreviation: form.abbreviation,
      duration_years: Number(form.duration_years),
      exit_years: form.exit_years,
    };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="School *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add program'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">School</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 text-slate-600">{r.school_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function BatchPanel({ items, path, token, programs, onDone, onDelete }) {
  const empty = { program_id: '', joining_year: new Date().getFullYear() };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function startEdit(r) {
    setEditingId(r.id);
    setForm({ program_id: String(r.program_id), joining_year: r.joining_year });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    const body = { program_id: Number(form.program_id), joining_year: Number(form.joining_year) };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="Program *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.program_id}
            onChange={(e) => setForm({ ...form, program_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.school_name})
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add batch'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Program</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.joining_year}</td>
              <td className="px-4 py-2 text-slate-600">{r.program_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function CourseGroupPanel({ items, path, token, schools, programs, onDone, onDelete }) {
  const empty = { school_id: '', program_id: '', name: '', track: 'core' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

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
    const body = {
      school_id: Number(form.school_id),
      program_id: form.program_id ? Number(form.program_id) : null,
      name: form.name,
      track: form.track,
    };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="School *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
        <Field label="Program (optional)">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.program_id}
            onChange={(e) => setForm({ ...form, program_id: e.target.value })}
          >
            <option value="">None (school-wide)</option>
            {programs.map((p) => (
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
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add course group'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Track</th>
            <th className="px-4 py-2">School</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2 capitalize">{r.track}</td>
              <td className="px-4 py-2 text-slate-600">{r.school_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function CoursePanel({ items, path, token, courseGroups, onDone, onDelete }) {
  const empty = {
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

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
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
    const body = {
      course_group_id: Number(form.course_group_id),
      course_name: form.course_name,
      course_code: form.course_code,
      credits: Number(form.credits),
      lecture_hours: Number(form.lecture_hours),
      tutorial_hours: Number(form.tutorial_hours),
      practical_hours: Number(form.practical_hours),
    };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="sm:col-span-2 text-sm font-medium text-slate-700 lg:col-span-3">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="Course group *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.course_group_id}
            onChange={(e) => setForm({ ...form, course_group_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {courseGroups.map((g) => (
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add course'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Code</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Group</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2 font-medium">{r.course_code}</td>
              <td className="px-4 py-2">{r.course_name}</td>
              <td className="px-4 py-2 text-slate-600">{r.course_group_name}</td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function OfferingPanel({ items, path, token, courses, batches, onDone, onDelete }) {
  const empty = { course_id: '', batch_id: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function startEdit(r) {
    setEditingId(r.id);
    setForm({ course_id: String(r.course_id), batch_id: String(r.batch_id) });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    const body = { course_id: Number(form.course_id), batch_id: Number(form.batch_id) };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="Course *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.course_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Batch *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.batch_id}
            onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.joining_year} — {b.program_name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit">{editingId ? 'Save changes' : 'Add offering'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Course</th>
            <th className="px-4 py-2">Batch</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2">
                {r.course_code} — {r.course_name}
              </td>
              <td className="px-4 py-2 text-slate-600">
                {r.joining_year} ({r.program_name})
              </td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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

function SectionPanel({ items, path, token, offerings, onDone, onDelete }) {
  const empty = { course_offering_id: '', section_name: '' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function startEdit(r) {
    setEditingId(r.id);
    setForm({ course_offering_id: String(r.course_offering_id), section_name: r.section_name || '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    const body = { course_offering_id: Number(form.course_offering_id), section_name: form.section_name };
    if (editingId) await apiPut(`${path}/${editingId}`, body, { token });
    else await apiPost(path, body, { token });
    cancelEdit();
    onDone();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm font-medium text-slate-700">
          {editingId ? `Editing #${editingId}` : 'New record'}
        </div>
        <Field label="Offering *">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.course_offering_id}
            onChange={(e) => setForm({ ...form, course_offering_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {offerings.map((o) => (
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
          <Button type="submit">{editingId ? 'Save changes' : 'Add section'}</Button>
          {editingId ? (
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Course / batch</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs">{r.id}</td>
              <td className="px-4 py-2 font-medium">{r.section_name}</td>
              <td className="px-4 py-2 text-slate-600">
                {r.course_code} · {r.joining_year}
              </td>
              <td className="space-x-3 px-4 py-2 text-right">
                <button type="button" className="text-slate-700 hover:underline" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(path, r.id)}>
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
      <p className="text-sm text-slate-600">
        Link students to school, program, batch, and course groups. Major, minor, and specialization groups must use
        matching tracks.
      </p>
      {err ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
      <TableShell>
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">Student</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((s) => (
            <tr key={s.id} className="align-top">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="font-mono text-xs text-slate-500">{s.usn}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{s.email}</td>
              <td className="px-4 py-3 text-right">
                {editing === s.id ? (
                  <form onSubmit={save} className="space-y-3 text-left">
                    <Field label="School">
                      <select
                        className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                        className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                        className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                        className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                        className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                        className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-700 hover:text-slate-900"
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
