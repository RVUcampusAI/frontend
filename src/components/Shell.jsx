import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getRole, isAuthed } from '../auth';

export default function Shell({ children }) {
  const nav = useNavigate();
  const authed = isAuthed();
  const role = getRole();

  const dash =
    role === 'student' ? '/student' : role === 'faculty' ? '/faculty' : role === 'admin' ? '/admin' : '/';

  return (
    <div className="min-h-screen bg-slate-50/80">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Campus<span className="text-slate-500">AI</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {authed ? (
              <>
                <Link
                  to={dash}
                  className="hidden rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100 sm:inline"
                >
                  Dashboard
                </Link>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                  {role || 'user'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearAuth();
                    nav('/login');
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100" to="/login">
                  Sign in
                </Link>
                <Link
                  className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800"
                  to="/register/student"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
