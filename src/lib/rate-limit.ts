// In-memory sliding window rate limiter for API routes

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitRecord>();

export function rateLimit(ip: string, limit = 5, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const record = tracker.get(ip);

  if (!record || now > record.resetTime) {
    tracker.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true; // Allowed
}
