import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
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
    <Layout title="Users">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, username, or phone"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(0);
            setQuery(search);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Search
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-gray-500">Loading users…</p>}

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
                  <Link to={`/users/${row.id}`} className="font-medium text-primary hover:underline">
                    {row.full_name || '—'}
                  </Link>
                ),
              },
              { key: 'username', header: 'Username', render: (row) => row.username ?? '—' },
              { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
              { key: 'role', header: 'Role', render: (row) => row.role_intent },
              {
                key: 'banned',
                header: 'Banned',
                render: (row) => (row.is_banned ? 'Yes' : 'No'),
              },
              {
                key: 'created',
                header: 'Joined',
                render: (row) => formatDate(row.created_at),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <button
                    type="button"
                    disabled={busyId === row.id || row.is_admin}
                    onClick={() => toggleBan(row)}
                    className="text-sm font-medium text-primary hover:underline disabled:opacity-40"
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
