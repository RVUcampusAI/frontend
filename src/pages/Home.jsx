import { Link } from 'react-router-dom';
import { isAuthed, getRole } from '../auth';

export default function Home() {
  const authed = isAuthed();
  const role = getRole();

  const dash =
    role === 'student' ? '/student' : role === 'faculty' ? '/faculty' : role === 'admin' ? '/admin' : '/login';

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-8 py-12 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">CampusAI</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Academic operations, one secure platform
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Manage university structure, programs, courses, and access—built for administrators, faculty, and
          students with role-based dashboards and audited authentication.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {authed ? (
            <Link
              to={dash}
              className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sign in
              </Link>
              <Link
                to="/register/student"
                className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Structured academics',
            text: 'Universities, campuses, schools, programs, batches, and course catalogs with strict relationships.',
          },
          {
            title: 'Secure access',
            text: 'JWT sessions, OTP verification, optional account lockout, and password recovery flows.',
          },
          {
            title: 'Role-based UX',
            text: 'Tailored dashboards for students, faculty, and administrators without exposing internal debug data.',
          },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
