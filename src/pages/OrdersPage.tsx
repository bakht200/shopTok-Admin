import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import { Layout } from '../components/Layout';
import { ErrorBanner } from '../components/ui/Feedback';
import { Pagination, formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { PAGE_SIZE, fetchOrders } from '../services/adminApi';
import type { Order } from '../types/database';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'placed', label: 'Placed' },
  { value: 'packing', label: 'Packing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
      <FilterBar
        searchLabel="Search order number"
        searchValue={search}
        searchPlaceholder="ORD-..."
        onSearchChange={setSearch}
        onSubmit={() => {
          setPage(0);
          setQuery(search);
        }}
      >
        <FilterSelect
          id="order-status"
          label="Status"
          value={status}
          onChange={(v) => {
            setPage(0);
            setStatus(v);
          }}
          options={STATUS_OPTIONS}
        />
      </FilterBar>

      {error && (
        <div className="mb-4">
          <ErrorBanner message="Failed to load orders" detail={error} />
        </div>
      )}

      <DataTable
        loading={loading}
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
          {
            key: 'total',
            header: 'Total',
            render: (row) => (
              <span className="font-medium tabular-nums">PKR {Number(row.total).toLocaleString()}</span>
            ),
          },
          {
            key: 'buyer',
            header: 'Buyer ID',
            render: (row) => (
              <span className="font-mono text-xs text-slate-500">{row.buyer_id.slice(0, 8)}…</span>
            ),
          },
          { key: 'created', header: 'Created', render: (row) => formatDate(row.created_at) },
        ]}
      />

      {!loading && <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
    </Layout>
  );
}
