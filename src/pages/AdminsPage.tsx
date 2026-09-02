import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { ShieldPlus, UserCog } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ErrorBanner, LoadingState, PageSection, SuccessBanner } from '../components/ui/Feedback';
import { formatDate } from '../components/Pagination';
import { createAdminUser, fetchProfiles } from '../services/adminApi';
import type { Profile } from '../types/database';

export function AdminsPage() {
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProfiles({ adminsOnly: true, page: 0 });
      setAdmins(result.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const created = await createAdminUser({
        email: email.trim(),
        password,
        full_name: fullName.trim() || undefined,
      });
      setSuccess(`Admin ${created.email} was created and can sign in immediately.`);
      setEmail('');
      setPassword('');
      setFullName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Admins" subtitle="Manage admin accounts and access">
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PageSection title="Admin users">
            {error && !submitting && (
              <div className="mb-4">
                <ErrorBanner message="Something went wrong" detail={error} />
              </div>
            )}
            {loading && <LoadingState label="Loading admins…" />}
            {!loading && (
              <DataTable
                rows={admins}
                rowKey={(row) => row.id}
                emptyMessage="No admin accounts found."
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    render: (row) => (
                      <span className="font-medium text-slate-900">{row.full_name || '—'}</span>
                    ),
                  },
                  { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
                  { key: 'joined', header: 'Joined', render: (row) => formatDate(row.created_at) },
                ]}
              />
            )}
          </PageSection>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary">
                <ShieldPlus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Add admin</h2>
                <p className="text-xs text-slate-500">Create a new admin account</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email"
                id="admin-email"
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />

              <Input
                label="Password"
                id="admin-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="Minimum 6 characters"
              />

              <Input
                label="Full name"
                id="admin-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Optional"
              />

              {success && <SuccessBanner message={success} />}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating admin…' : 'Create admin account'}
              </Button>
            </form>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200/70 bg-slate-50 p-4">
            <UserCog className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs leading-relaxed text-slate-500">
              New admins receive full access to the console immediately. Share credentials securely
              and encourage password changes on first login.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
