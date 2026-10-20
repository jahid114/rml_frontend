import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/primitives';
import { useDocumentMeta } from '@/lib/seo';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useDocumentMeta({
    title: 'Sign in',
    robots: 'noindex, nofollow',
    path: '/admin/login',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(identifier, password);
    setLoading(false);
    if (ok) navigate('/admin');
    else setError('Invalid username/email or password');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-ink">RML Admin</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to manage content</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-ink">
              Email or username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
