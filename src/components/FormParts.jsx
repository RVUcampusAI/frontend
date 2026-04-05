import { useState } from 'react';

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-primary/80">{label}</div>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={['input-field', props.className || ''].join(' ')}
    />
  );
}

export function PasswordInput({ value, onChange, id, autoComplete = 'current-password', className = '' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={['pr-12', className].join(' ')}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-accent/5 hover:text-accent"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export function Button({ children, className = '', loading = false, disabled: disabledProp = false, ...props }) {
  const disabled = disabledProp || loading;
  return (
    <button
      {...props}
      disabled={disabled}
      className={['btn-primary', className].join(' ')}
    >
      {loading ? (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4l3 3-3 3v4a8 8 0 0 1-8-8z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

export function Card({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-elevated">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-secondary">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
