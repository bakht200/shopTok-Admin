import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Store, Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { profile, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[45%] overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary-dark to-sidebar" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />

        <div className="relative flex flex-1 flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold">ShopTok</p>
              <p className="text-sm text-white/70">Admin Console</p>
            </div>
          </div>

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20">
              <Shield className="h-3.5 w-3.5" />
              Secure admin access
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Manage your marketplace with confidence
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/80">
              Users, orders, deliveries, and content moderation — all in one centralized dashboard.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
                Real-time order and delivery tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
                User moderation and admin management
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
                Content review for posts and products
              </li>
            </ul>
          </div>

          <p className="text-sm text-white/40">© ShopTok · Internal use only</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-slate-900">ShopTok Admin</p>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in with your admin credentials to continue</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Input
                label="Email address"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                icon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
              />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={submitting || loading} className="w-full" size="lg">
                {submitting ? 'Signing in…' : 'Sign in to dashboard'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
