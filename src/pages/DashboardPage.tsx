import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, Truck, FileImage } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { ErrorBanner, LoadingState, PageSection } from '../components/ui/Feedback';
import { StatCard } from '../components/ui/StatCard';
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
        { label: 'Total users', value: counts.users, to: '/users', icon: Users, accent: 'bg-blue-50 text-blue-600' },
        { label: 'Orders', value: counts.orders, to: '/orders', icon: ShoppingBag, accent: 'bg-violet-50 text-violet-600' },
        { label: 'Deliveries', value: counts.deliveries, to: '/deliveries', icon: Truck, accent: 'bg-amber-50 text-amber-600' },
        { label: 'Posts', value: counts.posts, to: '/content', icon: FileImage, accent: 'bg-pink-50 text-pink-600' },
      ]
    : [];

  return (
    <Layout title="Dashboard" subtitle="Overview of your ShopTok marketplace">
      {loading && <LoadingState label="Loading dashboard…" />}
      {error && (
        <ErrorBanner
          message="Failed to load dashboard"
          detail={error.includes('recursion') ? 'Database policy fix pending — run migration 20260902180000_fix_admin_rls_recursion.sql in Supabase SQL Editor.' : error}
        />
      )}

      {!loading && !error && counts && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <PageSection
            title="Recent orders"
            action={
              <Link to="/orders" className="text-sm font-semibold text-primary hover:text-primary-dark">
                View all →
              </Link>
            }
          >
            <DataTable
              rows={orders}
              rowKey={(row) => row.id}
              emptyMessage="No orders yet."
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
                { key: 'created_at', header: 'Created', render: (row) => formatDate(row.created_at) },
              ]}
            />
          </PageSection>
        </div>
      )}
    </Layout>
  );
}
