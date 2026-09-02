import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { fetchDashboardCounts, fetchRecentOrders } from '../services/adminApi';
import type { DashboardCounts, Order } from '../types/database';

export function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [countsData, recentOrders] = await Promise.all([
          fetchDashboardCounts(),
          fetchRecentOrders(10),
        ]);
        setCounts(countsData);
        setOrders(recentOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const statCards = counts
    ? [
        { label: 'Users', value: counts.users, to: '/users' },
        { label: 'Orders', value: counts.orders, to: '/orders' },
        { label: 'Deliveries', value: counts.deliveries, to: '/deliveries' },
        { label: 'Posts', value: counts.posts, to: '/content' },
      ]
    : [];

  return (
    <Layout title="Dashboard">
      {loading && <p className="text-gray-500">Loading dashboard…</p>}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!loading && counts && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow"
              >
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
              <Link to="/orders" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>

            <DataTable
              rows={orders}
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
                  key: 'created_at',
                  header: 'Created',
                  render: (row) => formatDate(row.created_at),
                },
              ]}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
