/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let counter = 0;
function makeId() {
  return `toast_${++counter}_${Date.now()}`;
}

const ICONS = {
  success: (
    <svg className="h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }

  function addToast({ type = 'success', message, timeoutMs = 3500 }) {
    const id = makeId();
    setToasts((prev) => [...prev, { id, type, message }]);
    const timer = setTimeout(() => dismiss(id), timeoutMs);
    timers.current.set(id, timer);
  }

  const value = { addToast, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'pointer-events-auto flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border bg-surface p-4 shadow-elevated animate-slide-in-right',
              t.type === 'success'
                ? 'border-success/30'
                : t.type === 'error'
                  ? 'border-danger/30'
                  : 'border-accent/30',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            {ICONS[t.type] || ICONS.info}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary">{t.message}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:bg-background hover:text-primary"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
