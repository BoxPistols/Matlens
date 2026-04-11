# ADR 0003: Persistent rate limit via Upstash Redis with in-memory fallback

- **Status:** Accepted
- **Date:** 2026-04-09

## Context

`/api/ai` proxies OpenAI and Gemini calls using a shared service key. Without
rate limiting, a single user (or a scraped URL) could burn through the
account's monthly quota in minutes. We need:

1. Per-user (or per-IP when no user id is available) daily cap.
2. Persistent across serverless cold starts — an in-memory counter resets
   to zero every time a function instance boots, which effectively gives
   attackers unlimited budget if they can churn instances.
3. Survives partial infrastructure outages without DoS-ing legitimate
   users.
4. Deployable to local dev without extra setup.

## Decision

Use **Upstash Redis** with `@upstash/ratelimit` as the primary rate limiter.
The limiter is built in `lib/ratelimit.js` and keyed by the caller's IP. The
daily cap is configurable via `DAILY_LIMIT` (default: 30).

When `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are not set, or
the Redis call throws for any reason, the limiter **falls back to an
in-memory Map** keyed the same way. The in-memory path is intentionally
lax — it's fine for local dev and acceptable as a short-term failover, but
it is not a durable protection against abuse.

The `/api/ai` response always includes `remaining` / `limit` in the JSON
body and mirrors them on `X-RateLimit-*` headers (headers-only for the
streaming path, since the body is a text stream).

## Alternatives considered

| Option | Why rejected |
| --- | --- |
| In-memory only | Defeated by serverless cold starts. Not acceptable. |
| Vercel KV / Edge Config | No longer offered by Vercel (see migration notes). |
| Self-hosted Redis | We don't run a server. |
| Cloudflare KV / D1 via rate-limit worker | Would have required a second hosting target. |

## Consequences

- **Positive:** Cap is durable across cold starts; the fallback keeps local
  dev and early prototype deployments working without credentials.
- **Negative:** The in-memory fallback is a silent security degradation.
  Operators must set the Upstash envs in production or they get the weak
  limit. The `engine` state in response headers and the logged
  `ratelimit backend` line let us notice in practice.
- If Upstash Redis pricing changes or the service degrades, the fallback
  at least prevents a hard 500 — the worst case is that the cap becomes
  process-local.
