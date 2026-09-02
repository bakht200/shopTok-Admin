import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FilterSelect } from '../components/FilterBar';
import { Layout } from '../components/Layout';
import { ErrorBanner } from '../components/ui/Feedback';
import { Pagination, formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { PAGE_SIZE, fetchDeliveries, fetchProfilesByIds } from '../services/adminApi';
import type { Delivery, Profile } from '../types/database';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'at_pickup', label: 'At pickup' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function DeliveriesPage() {
  const [rows, setRows] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Map<string, Profile>>(new Map());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDeliveries({ status, page });
      setRows(result.rows);
      setTotal(result.total);

      const riderIds = result.rows
        .map((d) => d.rider_id)
        .filter((id): id is string => Boolean(id));
      const riderMap = await fetchProfilesByIds(riderIds);
      setRiders(riderMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout title="Deliveries" subtitle="Monitor rider jobs and fulfillment">
      <div className="card mb-6 p-4">
        <FilterSelect
          id="delivery-status"
          label="Filter by status"
          value={status}
          onChange={(v) => {
            setPage(0);
            setStatus(v);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message="Failed to load deliveries" detail={error} />
        </div>
      )}

      <DataTable
        loading={loading}
        rows={rows}
        rowKey={(row) => row.id}
        emptyMessage="No delivery jobs found."
        columns={[
          {
            key: 'order_number',
            header: 'Order #',
            render: (row) => <span className="font-medium text-slate-900">{row.order_number}</span>,
          },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'rider',
            header: 'Rider',
            render: (row) => {
              if (!row.rider_id) {
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    Unassigned
                  </span>
                );
              }
              const rider = riders.get(row.rider_id);
              return rider?.full_name || rider?.username || `${row.rider_id.slice(0, 8)}…`;
            },
          },
          {
            key: 'payout',
            header: 'Payout',
            render: (row) => (
              <span className="font-medium tabular-nums">PKR {Number(row.payout).toLocaleString()}</span>
            ),
          },
          { key: 'created', header: 'Created', render: (row) => formatDate(row.created_at) },
        ]}
      />

      {!loading && <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
    </Layout>
  );
}
