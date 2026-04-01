import { useState } from 'react';

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm',
        'focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200',
        props.className || '',
      ].join(' ')}
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
        className={['pr-10', className].join(' ')}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white',
        'hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function Card({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

