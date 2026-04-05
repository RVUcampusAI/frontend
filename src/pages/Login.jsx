import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiPost } from '../api';
import { setAuth } from '../auth';
import { Button, Card, Field, Input, PasswordInput } from '../components/FormParts';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (loc.state?.notice) setNotice(loc.state.notice);
  }, [loc.state?.notice]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/login', { email, password });
      setAuth({ token: data.token, role: data.role });
      if (data.role === 'student') nav('/student');
      else if (data.role === 'faculty') nav('/faculty');
      else nav('/admin');
    } catch (e2) {
      setError(e2.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Sign in" subtitle="Enter your institutional email and password.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {notice ? (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>
        ) : null}
        <Button loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/unlock-account">
          Account locked?
        </Link>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <p className="text-center text-sm text-secondary">New to CampusAI?</p>
        <div className="mt-3 flex justify-center gap-4 text-sm font-semibold">
          <Link className="text-accent transition-colors hover:text-accent-light" to="/register/student">
            Student registration
          </Link>
          <span className="text-border">|</span>
          <Link className="text-accent transition-colors hover:text-accent-light" to="/register/faculty">
            Faculty registration
          </Link>
        </div>
      </div>
    </Card>
  );
}
