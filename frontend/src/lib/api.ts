import type {
  Address,
  AuthResponse,
  Cart,
  Category,
  Order,
  OrderDetail,
  PaymentIntent,
  Product,
  ProductDetail,
  ProductPage,
  Review,
  ReviewSummary,
  ShippingInput,
  User,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "kairuchi.token";
const CART_TOKEN_KEY = "kairuchi.cart";

/** Thrown for any non-2xx response so callers can show the server's own words. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const cartTokenStore = {
  get: () =>
    typeof window === "undefined" ? null : localStorage.getItem(CART_TOKEN_KEY),
  set: (t: string) => localStorage.setItem(CART_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(CART_TOKEN_KEY),
};

function readError(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    // FastAPI validation errors arrive as a list of issues.
    if (Array.isArray(detail) && detail.length) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }
  if (status === 0) return "Can't reach the kitchen. Is the API running?";
  return `Something went wrong (${status}).`;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);

  if (rest.body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = tokenStore.get();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
    const cartToken = cartTokenStore.get();
    if (cartToken) finalHeaders.set("X-Cart-Token", cartToken);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, { ...rest, headers: finalHeaders });
  } catch {
    throw new ApiError("Can't reach the kitchen. Is the API running?", 0);
  }

  // The server hands guests back the cart token their browser should keep.
  const issued = res.headers.get("X-Cart-Token");
  if (issued && typeof window !== "undefined") cartTokenStore.set(issued);

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(readError(payload, res.status), res.status);
  return payload as T;
}

function qs(params: object) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

export interface ProductQuery {
  q?: string;
  category?: string;
  spice?: number;
  veg?: boolean;
  featured?: boolean;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "rating" | "name";
  page?: number;
  page_size?: number;
}

export const api = {
  health: () =>
    fetch(`${API_BASE}/health`).then((r) => r.json() as Promise<{ status: string }>),

  // --- catalogue ---
  categories: () => request<Category[]>("/categories", { auth: false }),
  category: (slug: string) => request<Category>(`/categories/${slug}`, { auth: false }),
  products: (query: ProductQuery = {}) =>
    request<ProductPage>(`/products${qs(query)}`, { auth: false }),
  product: (slug: string) => request<ProductDetail>(`/products/${slug}`, { auth: false }),
  related: (slug: string, limit = 4) =>
    request<Product[]>(`/products/${slug}/related?limit=${limit}`, { auth: false }),
  suggest: (q: string) =>
    request<Product[]>(`/products/suggest?q=${encodeURIComponent(q)}`, { auth: false }),

  // --- auth ---
  signup: (body: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<User>("/auth/me"),
  updateProfile: (body: { full_name?: string; phone?: string }) =>
    request<User>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),

  // --- addresses ---
  addresses: () => request<Address[]>("/users/me/addresses"),
  addAddress: (body: Omit<Address, "id">) =>
    request<Address>("/users/me/addresses", { method: "POST", body: JSON.stringify(body) }),
  deleteAddress: (id: number) =>
    request<void>(`/users/me/addresses/${id}`, { method: "DELETE" }),

  // --- cart ---
  cart: () => request<Cart>("/cart"),
  addToCart: (product_id: number, quantity = 1) =>
    request<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    }),
  updateCartItem: (itemId: number, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (itemId: number) =>
    request<Cart>(`/cart/items/${itemId}`, { method: "DELETE" }),
  clearCart: () => request<Cart>("/cart", { method: "DELETE" }),

  // --- orders + payments ---
  checkout: (shipping: ShippingInput, payment_method: "razorpay" | "cod" = "razorpay") =>
    request<PaymentIntent>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ shipping, payment_method }),
    }),
  paymentConfig: () =>
    request<{ provider: string; key_id: string | null; currency: string; cod_enabled: boolean }>(
      "/payments/config",
      { auth: false },
    ),
  verifyPayment: (body: {
    order_number: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }) =>
    request<OrderDetail>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  orders: () => request<Order[]>("/orders"),
  order: (orderNumber: string, email?: string) =>
    request<OrderDetail>(`/orders/${orderNumber}${email ? `?email=${encodeURIComponent(email)}` : ""}`),
  cancelOrder: (orderNumber: string) =>
    request<OrderDetail>(`/orders/${orderNumber}/cancel`, { method: "POST" }),

  // --- reviews ---
  recentReviews: (limit = 8) =>
    request<Review[]>(`/reviews/recent?limit=${limit}`, { auth: false }),
  productReviews: (slug: string, sort: "newest" | "highest" | "lowest" = "newest") =>
    request<Review[]>(`/reviews/product/${slug}?sort=${sort}`, { auth: false }),
  reviewSummary: (slug: string) =>
    request<ReviewSummary>(`/reviews/product/${slug}/summary`, { auth: false }),
  writeReview: (slug: string, body: { rating: number; title?: string; body: string }) =>
    request<Review>(`/reviews/product/${slug}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // --- contact ---
  contact: (body: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) =>
    request<{ ok: boolean; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),
};
