import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/Feedback';
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
      <FilterBar
        searchLabel="Search users"
        searchValue={search}
        searchPlaceholder="Name, username, or phone"
        onSearchChange={setSearch}
        onSubmit={() => {
          setPage(0);
          setQuery(search);
        }}
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message="Failed to load users" detail={error} />
        </div>
      )}

      <DataTable
        loading={loading}
        rows={rows}
        rowKey={(row) => row.id}
        emptyMessage="No users match your search."
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
          {
            key: 'username',
            header: 'Username',
            render: (row) => (
              <span className="text-slate-600">{row.username ? `@${row.username}` : '—'}</span>
            ),
          },
          { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
          {
            key: 'role',
            header: 'Role',
            render: (row) => (
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                {row.role_intent}
              </span>
            ),
          },
          {
            key: 'banned',
            header: 'Status',
            render: (row) =>
              row.is_banned ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Banned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              ),
          },
          { key: 'created', header: 'Joined', render: (row) => formatDate(row.created_at) },
          {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
              <Button
                variant="ghost"
                size="sm"
                disabled={busyId === row.id || row.is_admin}
                onClick={() => toggleBan(row)}
                className={row.is_banned ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-600 hover:text-red-700'}
              >
                {busyId === row.id ? '…' : row.is_banned ? 'Unban' : 'Ban'}
              </Button>
            ),
          },
        ]}
      />

      {!loading && <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
    </Layout>
  );
}
