// Shared domain types mirroring the Insforge backend schema

export type Role = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // hashed in real backend
  role: Role;
  google_id?: string;
  provider: "email" | "google" | "otp";
  avatar?: string;
  blocked?: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  phone: string;
  default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  sort_order: number;
}

export interface ProductVariant {
  variant_type: string;
  value: string;
  price?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category_id: string;
  price: number;
  mrp: number;
  stock: number;
  description: string;
  specs: Record<string, string>;
  images: string[];
  badges: string[];
  variants: ProductVariant[];
  status: "draft" | "published";
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at?: string;
  rating: number;
  reviews_count: number;
}

export interface CartItem {
  product_id: string;
  variant?: { type: string; value: string };
  quantity: number;
  addedAt: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "ready_for_pickup"
  | "dispatched"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "proof_submitted"
  | "approved"
  | "rejected";

export type DeliveryMethod = "pickup" | "delivery";

export interface PaymentProof {
  id: string;
  order_id: string;
  user_id: string;
  image_url: string;
  status: PaymentStatus;
  admin_note?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_method: DeliveryMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_id?: string;
  address_id?: string;
  address?: Address;
  items: {
    product_id: string;
    name: string;
    image: string;
    variant?: { type: string; value: string };
    price: number;
    quantity: number;
    total: number;
  }[];
  shipment?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_cart: number;
  max_discount?: number;
  expires_at: string;
  usage_limit: number;
  used: number;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "open" | "answered" | "closed";
  reply?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
