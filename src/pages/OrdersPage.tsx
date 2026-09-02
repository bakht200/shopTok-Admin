import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
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
    <Layout title="Orders">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="order-search" className="mb-1 block text-sm font-medium text-gray-700">
            Search order #
          </label>
          <input
            id="order-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="order-status" className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Search
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-gray-500">Loading orders…</p>}

      {!loading && (
        <>
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              {
                key: 'order_number',
                header: 'Order #',
                render: (row) => (
                  <Link to={`/orders/${row.id}`} className="font-medium text-primary hover:underline">
                    {row.order_number}
                  </Link>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'total',
                header: 'Total',
                render: (row) => `PKR ${row.total.toLocaleString()}`,
              },
              {
                key: 'buyer',
                header: 'Buyer ID',
                render: (row) => (
                  <span className="font-mono text-xs text-gray-500">{row.buyer_id.slice(0, 8)}…</span>
                ),
              },
              {
                key: 'created',
                header: 'Created',
                render: (row) => formatDate(row.created_at),
              },
            ]}
          />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
