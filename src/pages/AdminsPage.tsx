import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
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
      setSuccess(`Admin ${created.email} created successfully.`);
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
    <Layout title="Admins">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Admin users</h2>
          {loading && <p className="text-gray-500">Loading…</p>}
          {!loading && (
            <DataTable
              rows={admins}
              rowKey={(row) => row.id}
              emptyMessage="No admins found."
              columns={[
                { key: 'name', header: 'Name', render: (row) => row.full_name || '—' },
                { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
                {
                  key: 'joined',
                  header: 'Joined',
                  render: (row) => formatDate(row.created_at),
                },
              ]}
            />
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Add admin</h2>
          <p className="mt-1 text-sm text-gray-500">
            Creates a Supabase Auth user with email/password and sets is_admin.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="admin-name" className="mb-1 block text-sm font-medium text-gray-700">
                Full name (optional)
              </label>
              <input
                id="admin-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create admin'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
