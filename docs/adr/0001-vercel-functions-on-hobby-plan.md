# ADR 0001: Host the backend on Vercel Functions (Hobby plan)

- **Status:** Accepted
- **Date:** 2026-04-09

## Context

Matlens ships as a single-tenant React SPA with a thin backend that handles
AI proxying, server-side RAG, data ingestion, and health checks. We needed
a deployment target that:

1. Hosts the static SPA and the API under one domain.
2. Doesn't require us to own a Linux box or a k8s cluster.
3. Costs nothing at prototype scale.
4. Supports the same Node runtime as local dev (ESM, recent Node features).
5. Integrates cleanly with GitHub PR previews.

We evaluated Cloudflare Workers, Netlify Functions, AWS Lambda behind API
Gateway, and Vercel Functions.

## Decision

Host both the SPA and the backend on **Vercel** using **Vercel Functions**
(Fluid Compute) on the **Hobby plan**.

Structural consequences of the Hobby plan:

- **Maximum 12 serverless functions per deployment.** This is the load-bearing
  constraint of this ADR. Every file under `/api` counts as a function, so
  shared helpers (validation, CORS, logger, request-id, rate limit, model
  resolver, AI error classifier) must live **outside** `/api` — they're in
  `/lib` at the repo root. A `.vercelignore` file keeps test files and
  fixtures out of the function bundle. See `lib/` and `.vercelignore`.
- Function execution timeout defaults to 300 s (formerly 60–90 s on older
  plans). Long-running AI calls are well within budget.
- No background jobs. One-off maintenance (Upstash ingest) runs from CI or
  a local script, not a cron.

## Alternatives considered

| Option | Why rejected |
| --- | --- |
| Cloudflare Workers | Streaming worked, but `@ai-sdk/*` packages assumed Node built-ins we'd have had to polyfill. Also no native Node.js runtime. |
| Netlify Functions | Slightly fewer edge cases than Vercel, but the PR preview integration was less polished at the time, and we were already paying the cost of learning Vercel for the SPA hosting. |
| AWS Lambda + API Gateway | Too much config for a prototype — IAM, domains, certs, CORS, logging, per-env vars, a custom SPA edge. Any time savings from Vercel's defaults would have been wasted re-creating them. |
| Self-hosted Node on a VPS | Cheap but owner-operated. We didn't want a pager. |

## Consequences

- **Positive:** Single config, zero-infra, free for current scale, native
  Node runtime, automatic PR previews, great DX.
- **Negative:** The 12-function cap has bitten us once (when `api/lib/` was
  counted as functions) and shaped the `/lib` layout. Any new endpoint has
  to fit under the cap or force a plan upgrade. Vendor lock-in on Vercel
  specifics (e.g. `@vercel/config`, gateway OIDC) means migration away would
  be non-trivial.
- If the app ever needs persistent background workers or more than 12
  endpoints, we'll need to either (a) upgrade to Pro, or (b) consolidate
  routing inside a single function via a micro-framework.
