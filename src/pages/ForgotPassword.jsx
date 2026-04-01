import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { Button, Card, Field, Input } from '../components/FormParts';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiPost('/api/auth/forgot-password', { email });
      nav('/reset-password', { state: { email } });
    } catch (e2) {
      setError(e2.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Forgot password"
      subtitle="We’ll email a one-time code to reset your password if the account exists."
    >
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
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}
        <Button disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset code'}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/login">
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}
