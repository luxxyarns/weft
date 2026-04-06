// Simple in-memory rate limiter — no extra dependencies
// Limits requests per IP per window.

import type { RequestHandler } from "express";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(opts: {
  windowMs?: number;    // default 60_000 (1 min)
  maxRequests?: number; // default 60
} = {}): RequestHandler {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.maxRequests ?? 60;
  const buckets = new Map<string, RateLimitBucket>();

  // Cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }, 300_000);

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    let bucket = buckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(ip, bucket);
    }

    bucket.count++;

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.status(429).json({ error: "Too many requests", retry_after_ms: bucket.resetAt - now });
      return;
    }

    next();
  };
}
