import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { ErrorBanner, LoadingState } from '../components/ui/Feedback';
import { Pagination, formatDate } from '../components/Pagination';
import { PAGE_SIZE, fetchProfiles, setUserBanned } from '../services/adminApi';
import type { Profile } from '../types/database';

export function UsersPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProfiles({ search: query, page });
      setRows(result.rows);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleBan(user: Profile) {
    setBusyId(user.id);
    try {
      await setUserBanned(user.id, !user.is_banned);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Layout title="Users" subtitle="Browse, search, and moderate marketplace users">
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label htmlFor="search" className="mb-1.5 block text-sm font-medium text-slate-700">
              Search users
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, username, or phone"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPage(0);
              setQuery(search);
            }}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Search
          </button>
        </div>
      </div>

      {error && <div className="mb-4"><ErrorBanner message="Failed to load users" detail={error} /></div>}
      {loading && <LoadingState label="Loading users…" />}

      {!loading && (
        <>
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              {
                key: 'name',
                header: 'Name',
                render: (row) => (
                  <Link to={`/users/${row.id}`} className="font-semibold text-primary hover:underline">
                    {row.full_name || '—'}
                  </Link>
                ),
              },
              { key: 'username', header: 'Username', render: (row) => row.username ?? '—' },
              { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
              { key: 'role', header: 'Role', render: (row) => <span className="capitalize">{row.role_intent}</span> },
              {
                key: 'banned',
                header: 'Banned',
                render: (row) => (
                  <span className={row.is_banned ? 'font-medium text-red-600' : 'text-slate-500'}>
                    {row.is_banned ? 'Yes' : 'No'}
                  </span>
                ),
              },
              { key: 'created', header: 'Joined', render: (row) => formatDate(row.created_at) },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <button
                    type="button"
                    disabled={busyId === row.id || row.is_admin}
                    onClick={() => toggleBan(row)}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-40"
                  >
                    {row.is_banned ? 'Unban' : 'Ban'}
                  </button>
                ),
              },
            ]}
          />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
