import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPost } from '../api';
import { Button, Card, Field, Input } from '../components/FormParts';

export default function UnlockAccount() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function sendCode(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await apiPost('/api/auth/unlock-account', { email });
      setInfo('If the account is eligible, an unlock code has been sent to your email.');
      setStep('otp');
    } catch (e2) {
      setError(e2.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiPost('/api/auth/verify-unlock-otp', { email, otp });
      setInfo('Account unlocked. You can sign in again.');
      setStep('done');
    } catch (e2) {
      setError(e2.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Unlock account"
      subtitle="After several failed sign-in attempts, use the code we email you to restore access."
    >
      {step === 'email' ? (
        <form onSubmit={sendCode} className="space-y-4">
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
            {loading ? 'Sending…' : 'Send unlock code'}
          </Button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form onSubmit={verify} className="space-y-4">
          {info ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {info}
            </div>
          ) : null}
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Unlock code">
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} required inputMode="numeric" />
          </Field>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
          <Button disabled={loading} className="w-full">
            {loading ? 'Verifying…' : 'Verify and unlock'}
          </Button>
        </form>
      ) : null}

      {step === 'done' ? (
        <div className="space-y-4">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {info}
          </div>
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to sign in
          </Link>
        </div>
      ) : null}

      <div className="mt-6 text-center text-sm">
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/login">
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}
