import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, Truck, FileImage, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { ErrorBanner, LoadingState, PageSection } from '../components/ui/Feedback';
import { StatCard, StatCardSkeleton } from '../components/ui/StatCard';
import { formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardCounts, fetchRecentOrders } from '../services/adminApi';
import type { DashboardCounts, Order } from '../types/database';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const quickActions = [
  { to: '/users', label: 'Manage users', icon: Users, description: 'Search, view, and moderate accounts' },
  { to: '/orders', label: 'Review orders', icon: Package, description: 'Track fulfillment and update status' },
  { to: '/content', label: 'Moderate content', icon: FileImage, description: 'Review posts and product listings' },
  { to: '/admins', label: 'Admin access', icon: ShieldCheck, description: 'Create and manage admin accounts' },
];

export function DashboardPage() {
  const { profile } = useAuth();
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
        {
          label: 'Total users',
          value: counts.users,
          to: '/users',
          icon: Users,
          accent: 'bg-blue-50 text-blue-600',
          description: 'Registered marketplace accounts',
        },
        {
          label: 'Orders',
          value: counts.orders,
          to: '/orders',
          icon: ShoppingBag,
          accent: 'bg-violet-50 text-violet-600',
          description: 'All-time order volume',
        },
        {
          label: 'Deliveries',
          value: counts.deliveries,
          to: '/deliveries',
          icon: Truck,
          accent: 'bg-amber-50 text-amber-600',
          description: 'Rider fulfillment jobs',
        },
        {
          label: 'Posts',
          value: counts.posts,
          to: '/content',
          icon: FileImage,
          accent: 'bg-pink-50 text-pink-600',
          description: 'Seller content published',
        },
      ]
    : [];

  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <Layout title="Dashboard" subtitle="Overview of your ShopTok marketplace">
      {loading && (
        <div className="space-y-8">
          <div className="skeleton h-24 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <LoadingState label="Loading dashboard…" />
        </div>
      )}

      {error && (
        <ErrorBanner
          message="Failed to load dashboard"
          detail={
            error.includes('recursion')
              ? 'Database policy fix pending — run migration 20260902180000_fix_admin_rls_recursion.sql in Supabase SQL Editor.'
              : error
          }
        />
      )}

      {!loading && !error && counts && (
        <div className="space-y-8">
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5" />
            <div className="absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-primary/10" />
            <div className="relative">
              <p className="text-sm font-medium text-primary">{getGreeting()}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Here&apos;s what&apos;s happening across your marketplace today. Use the quick actions below
                to jump into common admin tasks.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <PageSection title="Quick actions">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="card card-hover group flex flex-col gap-3 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </PageSection>

          <PageSection
            title="Recent orders"
            action={
              <Link
                to="/orders"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
              >
                View all
                <ArrowRight className="h-4 w-4" />
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
                    <Link
                      to={`/orders/${row.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {row.order_number}
                    </Link>
                  ),
                },
                { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: 'total',
                  header: 'Total',
                  render: (row) => (
                    <span className="font-medium tabular-nums">
                      PKR {Number(row.total).toLocaleString()}
                    </span>
                  ),
                },
                { key: 'created_at', header: 'Created', render: (row) => formatDate(row.created_at) },
              ]}
            />
          </PageSection>
        </div>
      )}
    </Layout>
  );
}
