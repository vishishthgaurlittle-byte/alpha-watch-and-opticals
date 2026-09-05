// In-memory / cache fallback order store for zero-downtime serverless resilience

export interface StoredOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  userEmail: string;
  userName: string;
  userPhone: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  shippingAddress: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id?: string;
    productId: string;
    name: string;
    image: string;
    variant: string | null;
    price: number;
    quantity: number;
    total: number;
  }>;
}

const globalOrderCache = globalThis as unknown as { fallbackOrders?: Map<string, StoredOrder> };

if (!globalOrderCache.fallbackOrders) {
  globalOrderCache.fallbackOrders = new Map<string, StoredOrder>();
}

export function saveFallbackOrder(order: StoredOrder) {
  globalOrderCache.fallbackOrders?.set(order.id, order);
  globalOrderCache.fallbackOrders?.set(order.orderNumber, order);
}

export function getFallbackOrder(idOrNumber: string): StoredOrder | undefined {
  return globalOrderCache.fallbackOrders?.get(idOrNumber);
}

export function getFallbackOrdersByUser(userIdentifier: string): StoredOrder[] {
  const result: StoredOrder[] = [];
  const seen = new Set<string>();
  const lowerId = (userIdentifier || "").toLowerCase().trim();

  if (globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders.forEach((order) => {
      if (seen.has(order.id)) return;
      if (
        (order.userId && order.userId === userIdentifier) ||
        (order.userEmail && order.userEmail.toLowerCase() === lowerId)
      ) {
        seen.add(order.id);
        result.push(order);
      }
    });
  }

  return result;
}
