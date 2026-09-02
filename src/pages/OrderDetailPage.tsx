import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { formatDate } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
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
      setSuccess('Order status updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Order detail">
      <Link to="/orders" className="mb-6 inline-block text-sm font-medium text-primary hover:underline">
        ← Back to orders
      </Link>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

      {order && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{order.order_number}</h2>
                <p className="mt-1 text-sm text-gray-500">Created {formatDate(order.created_at)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Buyer</dt>
                <dd className="font-medium">
                  {buyer ? (
                    <Link to={`/users/${buyer.id}`} className="text-primary hover:underline">
                      {buyer.full_name || buyer.username || buyer.id}
                    </Link>
                  ) : (
                    order.buyer_id
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Total</dt>
                <dd className="font-medium">PKR {order.total.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Shipping to</dt>
                <dd>
                  {order.shipping_name}, {order.shipping_line1}, {order.shipping_city}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd>{order.shipping_phone}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-6">
              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                  Update status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Order['status'])}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={saving || status === order.status}
                onClick={handleStatusUpdate}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save status'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <ul className="mt-4 divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-500">
                      Qty {item.quantity} · {item.seller_name}
                    </p>
                  </div>
                  <p className="font-medium">PKR {(item.unit_price * item.quantity).toLocaleString()}</p>
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500">No items.</p>}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
            <ol className="mt-4 space-y-4">
              {events.map((event) => (
                <li key={event.id} className="border-l-2 border-primary/30 pl-4">
                  <p className="font-medium text-gray-900">{event.label}</p>
                  {event.detail && <p className="text-sm text-gray-500">{event.detail}</p>}
                  <p className="text-xs text-gray-400">{formatDate(event.created_at)}</p>
                </li>
              ))}
              {events.length === 0 && <p className="text-sm text-gray-500">No events yet.</p>}
            </ol>
          </div>
        </div>
      )}
    </Layout>
  );
}
