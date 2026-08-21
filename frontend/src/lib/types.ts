export type Accent = "chilli" | "turmeric" | "leaf" | "indigo" | "rose";

export interface Category {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  accent: Accent;
  image_url: string | null;
  sort_order: number;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  price: string;
  compare_at_price: string | null;
  unit_label: string;
  sku: string;
  stock_qty: number;
  spice_level: number;
  is_veg: boolean;
  is_featured: boolean;
  image_url: string | null;
  rating_avg: string;
  rating_count: number;
  category: Category;
}

export interface ProductDetail extends Product {
  description: string;
  ingredients: string | null;
  shelf_life: string | null;
  gallery: string[] | null;
  pairs_with: string | null;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  item_count: number;
  subtotal: string;
  shipping_fee: string;
  total: string;
  free_shipping_threshold: string;
  amount_to_free_shipping: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "razorpay" | "cod";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string;
  image_url: string | null;
  unit_label: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  message: string | null;
  at: string | null;
  done: boolean;
  current: boolean;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: string;
  shipping_fee: string;
  total: string;
  ship_full_name: string;
  ship_phone: string;
  ship_email: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  notes: string | null;
  placed_at: string;
  items: OrderItem[];
}

export interface OrderDetail extends Order {
  events: { status: OrderStatus; message: string; created_at: string }[];
  tracking: TrackingStep[];
}

export interface PaymentIntent {
  order_number: string;
  provider: "razorpay" | "mock" | "cod";
  key_id: string | null;
  provider_order_id: string | null;
  amount_paise: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
  author_name: string;
  product_slug: string | null;
  product_name: string | null;
}

export interface ReviewSummary {
  average: number;
  count: number;
  breakdown: Record<string, number>;
}

export interface ShippingInput {
  full_name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
}
