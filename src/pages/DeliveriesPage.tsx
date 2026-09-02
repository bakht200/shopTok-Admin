import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { ErrorBanner, LoadingState } from '../components/ui/Feedback';
import { Pagination, formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { PAGE_SIZE, fetchDeliveries, fetchProfilesByIds } from '../services/adminApi';
import type { Delivery, Profile } from '../types/database';

const STATUS_OPTIONS = ['all', 'offered', 'accepted', 'at_pickup', 'picked_up', 'delivered', 'cancelled'];

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
        <label htmlFor="delivery-status" className="mb-1.5 block text-sm font-medium text-slate-700">
          Filter by status
        </label>
        <select
          id="delivery-status"
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value);
          }}
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'all' ? 'All statuses' : opt.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4"><ErrorBanner message="Failed to load deliveries" detail={error} /></div>}
      {loading && <LoadingState label="Loading deliveries…" />}

      {!loading && (
        <>
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No delivery jobs found."
            columns={[
              { key: 'order_number', header: 'Order #', render: (row) => row.order_number },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              {
                key: 'rider',
                header: 'Rider',
                render: (row) => {
                  if (!row.rider_id) return <span className="text-slate-400">Unassigned</span>;
                  const rider = riders.get(row.rider_id);
                  return rider?.full_name || rider?.username || `${row.rider_id.slice(0, 8)}…`;
                },
              },
              { key: 'payout', header: 'Payout', render: (row) => `PKR ${Number(row.payout).toLocaleString()}` },
              { key: 'created', header: 'Created', render: (row) => formatDate(row.created_at) },
            ]}
          />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
