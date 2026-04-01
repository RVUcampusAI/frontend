import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api';
import { Button, Card, Field, Input, PasswordInput } from '../components/FormParts';

export default function RegisterStudent() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/register/student', { name, usn, email, password });
      nav('/verify-otp', {
        state: {
          email,
          otp_type: 'registration',
          registrationToken: data.registrationToken,
        },
      });
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Student Registration" subtitle="We’ll email you an OTP to verify your account.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="USN">
          <Input value={usn} onChange={(e) => setUsn(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <Button disabled={loading} className="w-full">
          {loading ? 'Sending OTP…' : 'Send OTP'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="text-slate-700 hover:text-slate-900" to="/login">
          Back to login
        </Link>
        <Link className="text-slate-700 hover:text-slate-900" to="/register/faculty">
          Register as faculty
        </Link>
      </div>
    </Card>
  );
}

