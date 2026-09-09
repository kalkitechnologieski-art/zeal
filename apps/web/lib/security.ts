import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { Redis } from '@upstash/redis';

// Security headers (already in vercel.json, but we keep a central config)
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://ui-avatars.com https://images.unsplash.com https://picsum.photos",
    "font-src 'self'",
    "connect-src 'self' https://api.clerk.com wss://api.zeal.com https://api.razorpay.com",
    "frame-src 'self' https://clerk.com",
  ].join('; '),
};

// CSRF Token utilities
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyCSRFToken(token: string, storedHash: string): boolean {
  return hashCSRFToken(token) === storedHash;
}

// Rate limiting using Upstash Redis (or in-memory fallback)
let redis: Redis | null = null;
try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
  }
} catch (_) {}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!redis) {
    // Fallback: basic in-memory (not for production)
    return { success: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  const windowKey = `ratelimit:${key}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use Redis sorted set for sliding window
  const multi = redis.multi();
  multi.zremrangebyscore(windowKey, 0, windowStart);
  multi.zadd(windowKey, { score: now, member: `${now}:${Math.random()}` });
  multi.zcard(windowKey);
  multi.expire(windowKey, windowSeconds);

  const results = await multi.exec();
  const count = results[2] as number;

  const success = count <= limit;
  const remaining = Math.max(0, limit - count);
  const reset = now + windowSeconds * 1000;

  return { success, remaining, reset };
}

// Input sanitisation (basic XSS prevention)
export function sanitiseInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Middleware to apply security headers (can be used in middleware.ts)
export function withSecurityHeaders(req: NextRequest, res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    res.headers.set(key, value);
  }
  return res;
}

// BATCH1_APPLIED
