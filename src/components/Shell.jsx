import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getRole, isAuthed } from '../auth';
import { ToastProvider } from './ToastProvider';

export default function Shell({ children }) {
  const nav = useNavigate();
  const authed = isAuthed();
  const role = getRole();

  const dash =
    role === 'student' ? '/student' : role === 'faculty' ? '/faculty' : role === 'admin' ? '/admin' : '/';

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-primary">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-light text-xs font-black text-white shadow-sm transition-transform duration-150 group-hover:scale-105">
                CA
              </span>
              <span className="hidden sm:inline">
                Campus<span className="text-accent">AI</span>{' '}
                <span className="font-medium text-muted">ERP</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1.5 sm:gap-2">
              {authed ? (
                <>
                  <Link
                    to={dash}
                    className="hidden rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-accent/5 hover:text-accent sm:inline-flex"
                  >
                    Dashboard
                  </Link>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold capitalize text-accent">
                    {role || 'user'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuth();
                      nav('/login');
                    }}
                    className="btn-secondary !py-2 !text-xs"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-accent/5 hover:text-accent"
                    to="/login"
                  >
                    Sign in
                  </Link>
                  <Link className="btn-primary !py-2 !text-xs" to="/register/student">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
