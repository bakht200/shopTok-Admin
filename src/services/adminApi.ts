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

function parseInvokeError(error: unknown, data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: string }).error === 'string') {
    return (data as { error: string }).error;
  }
  if (error instanceof Error) {
    if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
      return 'Admin API not deployed. Ask your developer to run: node scripts/deploy-admin-backend.mjs';
    }
    return error.message;
  }
  return 'Request failed';
}

async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    throw new Error(parseInvokeError(error, data));
  }
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as { error: string }).error));
  }
  return data as T;
}

type ListResult<T> = { rows: T[]; total: number };

function profilesFromJson(rows: unknown): Profile[] {
  return (rows ?? []) as Profile[];
}

export async function fetchDashboardCounts(): Promise<DashboardCounts> {
  const { data, error } = await supabase.rpc('admin_dashboard_counts');
  if (error) throw error;
  return data as DashboardCounts;
}

export async function fetchRecentOrders(limit = 10): Promise<Order[]> {
  const { data, error } = await supabase.rpc('admin_list_orders', {
    p_search: null,
    p_status: null,
    p_limit: limit,
    p_offset: 0,
  });
  if (error) throw error;
  const parsed = data as ListResult<Order>;
  return parsed.rows ?? [];
}

export async function fetchProfiles(options: {
  search?: string;
  page?: number;
  adminsOnly?: boolean;
}): Promise<ListResult<Profile>> {
  const page = options.page ?? 0;
  const { data, error } = await supabase.rpc('admin_list_profiles', {
    p_search: options.search?.trim() || null,
    p_admins_only: options.adminsOnly ?? false,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  if (error) throw error;
  const parsed = data as ListResult<Profile>;
  return { rows: profilesFromJson(parsed.rows), total: parsed.total ?? 0 };
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.rpc('admin_get_profile', { p_id: id });
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function fetchUserStats(userId: string): Promise<{ orders: number; posts: number }> {
  const { data, error } = await supabase.rpc('admin_get_user_stats', { p_user_id: userId });
  if (error) throw error;
  return data as { orders: number; posts: number };
}

export async function setUserBanned(userId: string, isBanned: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_banned', {
    p_user_id: userId,
    p_is_banned: isBanned,
  });
  if (error) throw error;
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<{ id: string; email: string }> {
  const { data, error } = await supabase.rpc('admin_create_user', {
    p_email: input.email.trim(),
    p_password: input.password,
    p_full_name: input.full_name?.trim() || null,
  });

  if (!error && data && typeof data === 'object' && 'id' in data && 'email' in data) {
    return data as { id: string; email: string };
  }

  if (error && error.code !== 'PGRST202') {
    throw new Error(error.message);
  }

  return invokeFunction('admin-create-user', input);
}

export async function fetchOrders(options: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<ListResult<Order>> {
  const page = options.page ?? 0;
  const { data, error } = await supabase.rpc('admin_list_orders', {
    p_search: options.search?.trim() || null,
    p_status: options.status && options.status !== 'all' ? options.status : null,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  if (error) throw error;
  const parsed = data as ListResult<Order>;
  return { rows: (parsed.rows ?? []) as Order[], total: parsed.total ?? 0 };
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('admin_get_order', { p_id: id });
  if (error) throw error;
  return (data as Order | null) ?? null;
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase.rpc('admin_list_order_items', { p_order_id: orderId });
  if (error) throw error;
  return (data ?? []) as OrderItem[];
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const { data, error } = await supabase.rpc('admin_list_order_events', { p_order_id: orderId });
  if (error) throw error;
  return (data ?? []) as OrderEvent[];
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error } = await supabase.rpc('admin_update_order_status', {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) throw error;
}

export async function fetchDeliveries(options: {
  status?: string;
  page?: number;
}): Promise<ListResult<Delivery>> {
  const page = options.page ?? 0;
  const { data, error } = await supabase.rpc('admin_list_deliveries', {
    p_status: options.status && options.status !== 'all' ? options.status : null,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  if (error) throw error;
  const parsed = data as ListResult<Delivery>;
  return { rows: (parsed.rows ?? []) as Delivery[], total: parsed.total ?? 0 };
}

export async function fetchPosts(page = 0): Promise<ListResult<Post>> {
  const { data, error } = await supabase.rpc('admin_list_posts', {
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  if (error) throw error;
  const parsed = data as ListResult<Post>;
  return { rows: (parsed.rows ?? []) as Post[], total: parsed.total ?? 0 };
}

export async function fetchProducts(page = 0): Promise<ListResult<Product>> {
  const { data, error } = await supabase.rpc('admin_list_products', {
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  if (error) throw error;
  const parsed = data as ListResult<Product>;
  return { rows: (parsed.rows ?? []) as Product[], total: parsed.total ?? 0 };
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_post', { p_id: id });
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_product', { p_id: id });
  if (error) throw error;
}

export async function fetchProfilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase.rpc('admin_get_profiles_by_ids', { p_ids: ids });
  if (error) throw error;

  const map = new Map<string, Profile>();
  for (const row of (data ?? []) as Profile[]) {
    map.set(row.id, row);
  }
  return map;
}

export { PAGE_SIZE };
