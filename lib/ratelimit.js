// Rate limit — Upstash Redis (persistent) with in-memory fallback
//
// Behavior:
//   - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN set → Upstash sliding window
//   - Not set → in-memory Map (per warm instance, degrades gracefully)
//
// Env vars:
//   UPSTASH_REDIS_REST_URL   Upstash Redis REST URL
//   UPSTASH_REDIS_REST_TOKEN Upstash Redis REST token
//   DAILY_LIMIT              Requests per user per day (default: 30)
//
// TODO: Once Upstash Redis is provisioned (e.g. via
//   `vercel integration add upstash` → Redis Database), just add
//   UPSTASH_REDIS_REST_URL / _TOKEN to Vercel env vars. No code change
//   required — this module auto-switches to the persistent backend.
//   Until then, the in-memory Map fallback keeps the pre-existing
//   per-warm-instance behavior (not bypass-proof, but no regression).

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '30', 10);

// ── Upstash singleton ─────────────────────────────────
let _ratelimit = null;
let _redisAvailable = null;

function getRatelimit() {
  if (_ratelimit) return _ratelimit;
  if (_redisAvailable === false) return null;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redisAvailable = false;
    return null;
  }

  _ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(DAILY_LIMIT, '1 d'),
    prefix: 'matlens:ai',
    analytics: true,
  });
  _redisAvailable = true;
  return _ratelimit;
}

// ── In-memory fallback (per warm instance) ─────────────
const memStore = new Map(); // key: "ip:date" → count

function memoryCheckRateLimit(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${ip}:${today}`;

  // Clean up old entries (different dates)
  for (const k of memStore.keys()) {
    if (!k.endsWith(`:${today}`)) memStore.delete(k);
  }

  const current = memStore.get(key) || 0;
  if (current >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
  }
  memStore.set(key, current + 1);
  return { allowed: true, remaining: DAILY_LIMIT - current - 1, limit: DAILY_LIMIT };
}

function memoryGetRemaining(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${ip}:${today}`;
  const current = memStore.get(key) || 0;
  return { remaining: Math.max(0, DAILY_LIMIT - current), limit: DAILY_LIMIT };
}

// ── Public API ────────────────────────────────────────
export function getClientId(req) {
  // Vercel's own trusted header takes precedence, then standard fallbacks.
  const vercelForwarded = req.headers['x-vercel-forwarded-for'];
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const ip =
    vercelForwarded ||
    (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) ||
    realIp ||
    req.socket?.remoteAddress ||
    'unknown';
  return ip;
}

export async function checkRateLimit(req) {
  const ip = getClientId(req);
  const rl = getRatelimit();
  if (!rl) return memoryCheckRateLimit(ip);

  const { success, remaining, limit } = await rl.limit(`ip:${ip}`);
  return {
    allowed: success,
    remaining: success ? remaining : 0,
    limit: limit ?? DAILY_LIMIT,
  };
}

export async function getRemainingQuota(req) {
  const ip = getClientId(req);
  const rl = getRatelimit();
  if (!rl) return memoryGetRemaining(ip);

  const { remaining, limit } = await rl.getRemaining(`ip:${ip}`);
  return { remaining, limit: limit ?? DAILY_LIMIT };
}

export function isRedisAvailable() {
  return getRatelimit() !== null;
}
