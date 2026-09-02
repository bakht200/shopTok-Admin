import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { DetailCard, ErrorBanner, LoadingState, SuccessBanner } from '../components/ui/Feedback';
import { formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { FilterSelect } from '../components/FilterBar';
import {
  fetchOrderById,
  fetchOrderEvents,
  fetchOrderItems,
  fetchProfileById,
  updateOrderStatus,
} from '../services/adminApi';
import type { Order, OrderEvent, OrderItem, Profile } from '../types/database';

const STATUS_OPTIONS: Order['status'][] = ['placed', 'packing', 'shipped', 'delivered', 'cancelled'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [buyer, setBuyer] = useState<Profile | null>(null);
  const [status, setStatus] = useState<Order['status']>('placed');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing order id');
      return;
    }

    const orderId = id;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const orderData = await fetchOrderById(orderId);
        if (!orderData) {
          setError('Order not found');
          return;
        }
        setOrder(orderData);
        setStatus(orderData.status);

        const [itemsData, eventsData, buyerData] = await Promise.all([
          fetchOrderItems(orderId),
          fetchOrderEvents(orderId),
          fetchProfileById(orderData.buyer_id),
        ]);

        setItems(itemsData);
        setEvents(eventsData);
        setBuyer(buyerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleStatusUpdate() {
    if (!order || !id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOrderStatus(id, status);
      const [orderData, eventsData] = await Promise.all([
        fetchOrderById(id),
        fetchOrderEvents(id),
      ]);
      setOrder(orderData);
      setEvents(eventsData);
      setSuccess('Order status updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title={order?.order_number ?? 'Order detail'}
      subtitle={order ? `Placed ${formatDate(order.created_at)}` : 'Loading order information'}
      backTo={{ label: 'Back to orders', href: '/orders' }}
    >
      {loading && <LoadingState label="Loading order…" />}
      {error && <ErrorBanner message="Unable to load order" detail={error} />}
      {success && <div className="mb-6"><SuccessBanner message={success} /></div>}

      {order && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Order number</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{order.order_number}</h2>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Buyer</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {buyer ? (
                    <Link to={`/users/${buyer.id}`} className="text-primary hover:underline">
                      {buyer.full_name || buyer.username || buyer.id}
                    </Link>
                  ) : (
                    order.buyer_id
                  )}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</dt>
                <dd className="mt-1 text-sm font-bold tabular-nums text-slate-900">
                  PKR {order.total.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment</dt>
                <dd className="mt-1 text-sm font-medium capitalize">{order.payment_method}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">ETA</dt>
                <dd className="mt-1 text-sm font-medium">{order.eta_label || '—'}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-lg border border-slate-200/70 bg-slate-50/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Shipping address</p>
              <p className="mt-1 text-sm text-slate-800">
                {order.shipping_name} · {order.shipping_phone}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                {order.shipping_line1}
                {order.shipping_line2 ? `, ${order.shipping_line2}` : ''}, {order.shipping_city},{' '}
                {order.shipping_region}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-6">
              <FilterSelect
                id="status"
                label="Update status"
                value={status}
                onChange={(v) => setStatus(v as Order['status'])}
                options={STATUS_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
              />
              <Button
                onClick={handleStatusUpdate}
                disabled={saving || status === order.status}
                size="sm"
                className="mb-0.5"
              >
                {saving ? 'Saving…' : 'Save status'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title={`Items (${items.length})`}>
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                        N/A
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        Qty {item.quantity} · {item.seller_name}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-slate-900">
                      PKR {(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
                {items.length === 0 && (
                  <p className="py-4 text-sm text-slate-500">No items in this order.</p>
                )}
              </ul>
            </DetailCard>

            <DetailCard title="Timeline">
              {events.length === 0 ? (
                <p className="text-sm text-slate-500">No events recorded yet.</p>
              ) : (
                <ol className="relative space-y-0">
                  {events.map((event, index) => (
                    <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < events.length - 1 && (
                        <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" aria-hidden />
                      )}
                      <span className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-white" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{event.label}</p>
                        {event.detail && <p className="mt-0.5 text-sm text-slate-500">{event.detail}</p>}
                        <p className="mt-1 text-xs text-slate-400">{formatDate(event.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </DetailCard>
          </div>
        </div>
      )}
    </Layout>
  );
}
