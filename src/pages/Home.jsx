import { Link } from 'react-router-dom';
import { isAuthed, getRole } from '../auth';

export default function Home() {
  const authed = isAuthed();
  const role = getRole();

  const dash =
    role === 'student' ? '/student' : role === 'faculty' ? '/faculty' : role === 'admin' ? '/admin' : '/login';

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-4">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-accent p-10 text-white shadow-elevated md:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent-light/15 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            CampusAI ERP
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Academic operations,
            <br className="hidden sm:block" />
            one secure platform
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            Manage university structure, programs, courses, and access — built for administrators, faculty, and
            students with role-based dashboards and audited authentication.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {authed ? (
              <Link to={dash} className="btn-primary !bg-white !text-primary hover:!bg-white/90">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-primary !bg-white !text-primary hover:!bg-white/90">
                  Sign in
                </Link>
                <Link
                  to="/register/student"
                  className="btn-secondary !border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Structured academics',
            text: 'Universities, campuses, schools, programs, batches, and course catalogs with strict relationships.',
            icon: (
              <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            ),
          },
          {
            title: 'Secure access',
            text: 'JWT sessions, OTP verification, optional account lockout, and password recovery flows.',
            icon: (
              <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            ),
          },
          {
            title: 'Role-based UX',
            text: 'Tailored dashboards for students, faculty, and administrators with clean, consistent interfaces.',
            icon: (
              <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" />
              </svg>
            ),
          },
        ].map((c) => (
          <div key={c.title} className="card-hover p-6">
            <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-2.5">{c.icon}</div>
            <h2 className="text-base font-semibold text-primary">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
