import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { ShieldPlus, UserCog } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { ErrorBanner, LoadingState } from '../components/ui/Feedback';
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Admin users</h2>
          </div>
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
              emptyMessage="No admins found."
              columns={[
                { key: 'name', header: 'Name', render: (row) => row.full_name || '—' },
                { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
                { key: 'joined', header: 'Joined', render: (row) => formatDate(row.created_at) },
              ]}
            />
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Add admin</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Creates an email/password account with full admin access.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="admin@company.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="admin-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name (optional)
              </label>
              <input
                id="admin-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {success && (
              <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? 'Creating admin…' : 'Create admin account'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
