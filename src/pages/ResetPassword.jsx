import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { Button, Card, Field, Input, PasswordInput } from '../components/FormParts';

export default function ResetPassword() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState(loc.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiPost('/api/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      });
      nav('/login', { replace: true, state: { notice: 'Password updated. Sign in with your new password.' } });
    } catch (e2) {
      const msg = e2.message || 'Reset failed';
      setError(msg.includes('expired') || msg.includes('Invalid') ? msg : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Reset password" subtitle="Enter the code from your email and choose a new password.">
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
        <Field label="One-time code">
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} required inputMode="numeric" />
        </Field>
        <Field label="New password">
          <PasswordInput
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>
        ) : null}
        <Button loading={loading} className="w-full">
          Update password
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-sm">
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/forgot-password">
          Resend code
        </Link>
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/login">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
