export type Profile = {
  id: string;
  phone: string | null;
  full_name: string;
  username: string | null;
  bio: string;
  address: string;
  cnic: string | null;
  avatar_url: string | null;
  interests: string[];
  region: string;
  role_intent: 'shopping' | 'business' | 'rider';
  onboarding_complete: boolean;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  buyer_id: string;
  status: 'placed' | 'packing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  shipping_fee: number;
  subtotal: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_line1: string;
  shipping_line2: string;
  shipping_city: string;
  shipping_region: string;
  eta_label: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  post_id: string | null;
  seller_id: string | null;
  title: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  seller_name: string;
  created_at: string;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  status: string;
  label: string;
  detail: string | null;
  created_at: string;
};

export type Delivery = {
  id: string;
  order_id: string;
  rider_id: string | null;
  status: 'offered' | 'accepted' | 'at_pickup' | 'picked_up' | 'delivered' | 'cancelled';
  store_name: string;
  customer_name: string;
  pickup_address: string;
  dropoff_address: string;
  items_summary: string;
  payout: number;
  order_number: string;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
};

export type Post = {
  id: string;
  seller_id: string;
  product_id: string;
  caption: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  seller_name: string;
  like_count: number;
  comment_count: number;
  created_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  created_at: string;
};

export type DashboardCounts = {
  users: number;
  orders: number;
  deliveries: number;
  posts: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      order_events: { Row: OrderEvent; Insert: Partial<OrderEvent>; Update: Partial<OrderEvent> };
      deliveries: { Row: Delivery; Insert: Partial<Delivery>; Update: Partial<Delivery> };
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
    };
    Functions: {
      admin_dashboard_counts: { Returns: DashboardCounts };
      is_admin: { Returns: boolean };
    };
  };
};
