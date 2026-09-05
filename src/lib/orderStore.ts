// Persistent in-memory + disk order store for 100% data preservation across serverless requests and restarts

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
  paymentProofUrl?: string | null;
  upiTransactionId?: string | null;
  paymentAdminNote?: string | null;
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

function getDiskOrdersPath(): string {
  if (typeof window !== "undefined") return "";
  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
  );
  if (isServerless) {
    return "/tmp/awopticals_orders.json";
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodePath = require("path");
    return nodePath.join(process.cwd(), "prisma", "orders.json");
  } catch {
    return "/tmp/awopticals_orders.json";
  }
}

function loadOrdersFromDisk(): Map<string, StoredOrder> {
  const map = new Map<string, StoredOrder>();
  if (typeof window !== "undefined") return map;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeFs = require("fs");
    const filePath = getDiskOrdersPath();
    if (filePath && nodeFs.existsSync(filePath)) {
      const raw = nodeFs.readFileSync(filePath, "utf8");
      if (raw) {
        const list: StoredOrder[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((o) => {
            map.set(o.id, o);
            map.set(o.orderNumber, o);
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not load orders from disk:", err);
  }
  return map;
}

function saveOrdersToDisk(map: Map<string, StoredOrder>) {
  if (typeof window !== "undefined") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeFs = require("fs");
    const filePath = getDiskOrdersPath();
    if (filePath) {
      const list: StoredOrder[] = [];
      const seen = new Set<string>();
      map.forEach((o) => {
        if (!seen.has(o.id)) {
          seen.add(o.id);
          list.push(o);
        }
      });
      nodeFs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not save orders to disk:", err);
  }
}

const globalOrderCache = globalThis as unknown as { fallbackOrders?: Map<string, StoredOrder> };

if (!globalOrderCache.fallbackOrders) {
  globalOrderCache.fallbackOrders = loadOrdersFromDisk();
}

export function saveFallbackOrder(order: StoredOrder) {
  if (!globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders = new Map<string, StoredOrder>();
  }
  globalOrderCache.fallbackOrders.set(order.id, order);
  globalOrderCache.fallbackOrders.set(order.orderNumber, order);
  saveOrdersToDisk(globalOrderCache.fallbackOrders);
}

export function getFallbackOrder(idOrNumber: string): StoredOrder | undefined {
  if (!globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders = loadOrdersFromDisk();
  }
  return globalOrderCache.fallbackOrders.get(idOrNumber);
}

export function getAllFallbackOrders(): StoredOrder[] {
  if (!globalOrderCache.fallbackOrders || globalOrderCache.fallbackOrders.size === 0) {
    globalOrderCache.fallbackOrders = loadOrdersFromDisk();
  }
  const list: StoredOrder[] = [];
  const seen = new Set<string>();
  if (globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders.forEach((o) => {
      if (!seen.has(o.id)) {
        seen.add(o.id);
        list.push(o);
      }
    });
  }
  return list.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
}

export function updateFallbackOrder(idOrNumber: string, patch: Partial<StoredOrder>): StoredOrder | null {
  if (!globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders = loadOrdersFromDisk();
  }
  const existing = globalOrderCache.fallbackOrders.get(idOrNumber);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  globalOrderCache.fallbackOrders.set(updated.id, updated);
  globalOrderCache.fallbackOrders.set(updated.orderNumber, updated);
  saveOrdersToDisk(globalOrderCache.fallbackOrders);
  return updated;
}

export function deleteFallbackOrder(idOrNumber: string): boolean {
  if (!globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders = loadOrdersFromDisk();
  }
  const existing = globalOrderCache.fallbackOrders.get(idOrNumber);
  if (!existing) return false;
  globalOrderCache.fallbackOrders.delete(existing.id);
  globalOrderCache.fallbackOrders.delete(existing.orderNumber);
  saveOrdersToDisk(globalOrderCache.fallbackOrders);
  return true;
}

export function getFallbackOrdersByUser(userIdentifier: string): StoredOrder[] {
  if (!globalOrderCache.fallbackOrders) {
    globalOrderCache.fallbackOrders = loadOrdersFromDisk();
  }
  const result: StoredOrder[] = [];
  const seen = new Set<string>();
  const lowerId = (userIdentifier || "").toLowerCase().trim();

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

  return result;
}
