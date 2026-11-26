// Simple in-memory sliding-window / token bucket rate limiter
const ipHits = new Map();

/**
 * Enforces rate limiting per IP or client identifier.
 * @param {string} identifier - e.g. IP address
 * @param {number} maxRequests - Max requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(identifier, maxRequests = 20, windowMs = 60000) {
  const key = identifier || 'unknown_client';
  const now = Date.now();
  
  // Clean up expired items periodically if map grows large
  if (ipHits.size > 10000) {
    for (const [k, data] of ipHits.entries()) {
      if (now > data.resetTime) {
        ipHits.delete(k);
      }
    }
  }

  let record = ipHits.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs
    };
    ipHits.set(key, record);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetMs: windowMs
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetTime - now)
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMs: Math.max(0, record.resetTime - now)
  };
}

