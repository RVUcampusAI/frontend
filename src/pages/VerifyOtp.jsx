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
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
            Missing registration session. Please start registration again.
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>
        ) : null}
        <Button loading={loading} disabled={!registrationToken} className="w-full">
          Verify and continue
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/login">
          Back to sign in
        </Link>
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/">
          Home
        </Link>
      </div>
    </Card>
  );
}
