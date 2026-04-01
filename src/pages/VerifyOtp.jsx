import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api';
import { setAuth } from '../auth';
import { Button, Card, Field, Input } from '../components/FormParts';

export default function VerifyOtp() {
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState(loc.state?.email || '');
  const [otpType] = useState(loc.state?.otp_type || 'registration');
  const [registrationToken] = useState(loc.state?.registrationToken || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/verify-otp', {
        email,
        otp,
        otp_type: otpType,
        registrationToken,
      });
      setAuth({ token: data.token, role: data.role });
      if (data.role === 'student') nav('/student');
      else if (data.role === 'faculty') nav('/faculty');
      else nav('/admin');
    } catch (e2) {
      setError(e2.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox to finish registration."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="One-time code">
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} required inputMode="numeric" />
        </Field>
        {!registrationToken ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Missing registration session. Please start registration again.
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}
        <Button disabled={loading || !registrationToken} className="w-full">
          {loading ? 'Verifying…' : 'Verify and continue'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/login">
          Back to sign in
        </Link>
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/">
          Home
        </Link>
      </div>
    </Card>
  );
}
