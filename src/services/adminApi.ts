import { supabase } from '../lib/supabase';
import type {
  DashboardCounts,
  Delivery,
  Order,
  OrderEvent,
  OrderItem,
  Post,
  Product,
  Profile,
} from '../types/database';

const PAGE_SIZE = 20;

export async function fetchDashboardCounts(): Promise<DashboardCounts> {
  const { data, error } = await supabase.rpc('admin_dashboard_counts');
  if (error) throw error;
  return data as DashboardCounts;
}

export async function fetchRecentOrders(limit = 10): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function fetchProfiles(options: {
  search?: string;
  page?: number;
  adminsOnly?: boolean;
}): Promise<{ rows: Profile[]; total: number }> {
  const page = options.page ?? 0;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options.adminsOnly) {
    query = query.eq('is_admin', true);
  }

  if (options.search?.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(`full_name.ilike.${term},username.ilike.${term},phone.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { rows: (data ?? []) as Profile[], total: count ?? 0 };
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchUserStats(userId: string): Promise<{ orders: number; posts: number }> {
  const [ordersRes, postsRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', userId),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (postsRes.error) throw postsRes.error;

  return {
    orders: ordersRes.count ?? 0,
    posts: postsRes.count ?? 0,
  };
}

export async function setUserBanned(userId: string, isBanned: boolean): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId);
  if (error) throw error;
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<{ id: string; email: string }> {
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: input,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { id: string; email: string };
}

export async function fetchOrders(options: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<{ rows: Order[]; total: number }> {
  const page = options.page ?? 0;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options.search?.trim()) {
    query = query.ilike('order_number', `%${options.search.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { rows: (data ?? []) as Order[], total: count ?? 0 };
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
  if (error) throw error;
  return (data ?? []) as OrderItem[];
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const { data, error } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as OrderEvent[];
}

const STATUS_LABELS: Record<Order['status'], string> = {
  placed: 'Order placed',
  packing: 'Packing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error: orderError } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (orderError) throw orderError;

  const { error: eventError } = await supabase.from('order_events').insert({
    order_id: orderId,
    status,
    label: STATUS_LABELS[status],
    detail: 'Updated by admin',
  });

  if (eventError) throw eventError;
}

export async function fetchDeliveries(options: {
  status?: string;
  page?: number;
}): Promise<{ rows: Delivery[]; total: number }> {
  const page = options.page ?? 0;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('deliveries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { rows: (data ?? []) as Delivery[], total: count ?? 0 };
}

export async function fetchPosts(page = 0): Promise<{ rows: Post[]; total: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { rows: (data ?? []) as Post[], total: count ?? 0 };
}

export async function fetchProducts(page = 0): Promise<{ rows: Product[]; total: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { rows: (data ?? []) as Product[], total: count ?? 0 };
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchProfilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase.from('profiles').select('*').in('id', ids);
  if (error) throw error;

  const map = new Map<string, Profile>();
  for (const row of (data ?? []) as Profile[]) {
    map.set(row.id, row);
  }
  return map;
}

export { PAGE_SIZE };
