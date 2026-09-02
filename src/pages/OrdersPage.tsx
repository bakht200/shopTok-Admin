import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { ErrorBanner, LoadingState } from '../components/ui/Feedback';
import { Pagination, formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { PAGE_SIZE, fetchOrders } from '../services/adminApi';
import type { Order } from '../types/database';

const STATUS_OPTIONS = ['all', 'placed', 'packing', 'shipped', 'delivered', 'cancelled'];

export function OrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchOrders({ search: query, status, page });
      setRows(result.rows);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, query, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout title="Orders" subtitle="Track and manage customer orders">
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="order-search" className="mb-1.5 block text-sm font-medium text-slate-700">
              Search order number
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="order-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="ORD-..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="order-status" className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="order-status"
              value={status}
              onChange={(e) => {
                setPage(0);
                setStatus(e.target.value);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'all' ? 'All statuses' : opt}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setPage(0);
              setQuery(search);
            }}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            Search
          </button>
        </div>
      </div>

      {error && <div className="mb-4"><ErrorBanner message="Failed to load orders" detail={error} /></div>}
      {loading && <LoadingState label="Loading orders…" />}

      {!loading && (
        <>
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No orders match your filters."
            columns={[
              {
                key: 'order_number',
                header: 'Order #',
                render: (row) => (
                  <Link to={`/orders/${row.id}`} className="font-semibold text-primary hover:underline">
                    {row.order_number}
                  </Link>
                ),
              },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'total', header: 'Total', render: (row) => `PKR ${Number(row.total).toLocaleString()}` },
              {
                key: 'buyer',
                header: 'Buyer',
                render: (row) => <span className="font-mono text-xs text-slate-500">{row.buyer_id.slice(0, 8)}…</span>,
              },
              { key: 'created', header: 'Created', render: (row) => formatDate(row.created_at) },
            ]}
          />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
