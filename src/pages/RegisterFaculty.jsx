import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api';
import { Button, Card, Field, Input, PasswordInput } from '../components/FormParts';

export default function RegisterFaculty() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/register/faculty', {
        name,
        faculty_code: facultyCode,
        email,
        password,
      });
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
    <Card title="Faculty Registration" subtitle="We'll email you an OTP to verify your account.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Faculty code">
          <Input value={facultyCode} onChange={(e) => setFacultyCode(e.target.value)} required />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>
        ) : null}
        <Button loading={loading} className="w-full">
          Send OTP
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="font-medium text-secondary transition-colors hover:text-accent" to="/login">
          Back to login
        </Link>
        <Link className="font-medium text-accent transition-colors hover:text-accent-light" to="/register/student">
          Register as student
        </Link>
      </div>
    </Card>
  );
}
