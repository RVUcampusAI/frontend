import { Field, Input } from './FormParts';

export default function FiltersBar({
  search,
  onSearchChange,
  schools = [],
  programs = [],
  courses = [],
  faculty = [],
  filters,
  onFiltersChange,
  showDateRange = true,
}) {
  const f = filters || {};

  const selectCls =
    'input-field appearance-none bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8';

  return (
    <section className="card p-4">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Field label="Search">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <Input
                value={search || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search…"
                className="!pl-10"
              />
            </div>
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label="School">
            <select
              className={selectCls}
              value={f.school_id || ''}
              onChange={(e) =>
                onFiltersChange?.({ ...f, school_id: e.target.value, program_id: '', course_id: '' })
              }
            >
              <option value="">All</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label="Program">
            <select
              className={selectCls}
              value={f.program_id || ''}
              onChange={(e) => onFiltersChange?.({ ...f, program_id: e.target.value, course_id: '' })}
              disabled={!programs.length}
            >
              <option value="">All</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label="Course">
            <select
              className={selectCls}
              value={f.course_id || ''}
              onChange={(e) => onFiltersChange?.({ ...f, course_id: e.target.value })}
              disabled={!courses.length}
            >
              <option value="">All</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code ? `${c.course_code} — ${c.course_name}` : c.course_name || `#${c.id}`}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label="Faculty">
            <select
              className={selectCls}
              value={f.faculty_id || ''}
              onChange={(e) => onFiltersChange?.({ ...f, faculty_id: e.target.value })}
              disabled={!faculty.length}
            >
              <option value="">All</option>
              {faculty.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {showDateRange ? (
          <>
            <div className="lg:col-span-2">
              <Field label="From">
                <Input
                  type="date"
                  value={f.date_from || ''}
                  onChange={(e) => onFiltersChange?.({ ...f, date_from: e.target.value })}
                />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Field label="To">
                <Input
                  type="date"
                  value={f.date_to || ''}
                  onChange={(e) => onFiltersChange?.({ ...f, date_to: e.target.value })}
                />
              </Field>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
