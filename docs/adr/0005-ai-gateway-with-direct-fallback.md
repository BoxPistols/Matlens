# ADR 0005: Route AI calls through Vercel AI Gateway with a direct-provider fallback

- **Status:** Accepted
- **Date:** 2026-04-09

## Context

`api/ai.js` originally called the model providers directly via
`@ai-sdk/openai` (`openai('gpt-5.4-nano')`) and `@ai-sdk/google`
(`google('gemini-2.5-flash')`), reading per-provider API keys from
`OPENAI_API_KEY` / `GEMINI_API_KEY`. This works but has several
operational downsides:

1. **Two keys to rotate** — each provider has its own credential, and
   the app breaks silently if either is missing or stale.
2. **No unified observability** — we can't see token usage, failure
   rates, or cost per request without parsing cloud-specific logs.
3. **No provider failover** — if OpenAI is down, we can't automatically
   retry against Gemini.
4. **No cost routing** — there's no way to route requests to whichever
   provider is cheapest today.

Vercel's **AI Gateway** (GA August 2025) solves all four via a unified
API, OIDC-based auth, provider routing, and usage reporting. But:

- We still want local dev to work without setting up a gateway account.
- We want a break-glass path in case the gateway itself is down.
- We're on AI SDK v6, which supports string model IDs like
  `'openai/gpt-5.4-nano'` that the gateway handles transparently.

## Decision

Introduce `lib/models.js` as a **single resolver** that returns a
`LanguageModelV2` in one of two modes:

1. **Gateway mode (preferred).** Engages automatically when any of the
   following are present:
   - `AI_GATEWAY_API_KEY` is set.
   - `VERCEL_OIDC_TOKEN` is set (populated by `vercel env pull` and
     auto-minted on production/preview deployments).
   - `AI_GATEWAY_ENABLED=1` is explicitly set (escape hatch).

   Returns the model via `gateway('openai/<name>')` /
   `gateway('google/<name>')`. A single credential covers both providers.

2. **Direct mode (fallback).** Used when none of the above hold, or when
   `AI_GATEWAY_ENABLED=0` forces it. Returns `openai(<name>)` /
   `google(<name>)` from the per-provider SDKs, reading
   `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` (with `GEMINI_API_KEY`
   as an alias).

`api/ai.js` and any future AI call sites call `resolveChatModel()` /
`hasProviderKey()` and never import `@ai-sdk/openai` / `@ai-sdk/google`
directly. The branch is decided once at module load.

The direct-mode packages stay in `package.json` on purpose — removing
them would make the gateway a hard dependency, which is incompatible
with goal (1) above.

## Alternatives considered

| Option | Why rejected |
| --- | --- |
| Gateway only | Requires every contributor to set up OIDC or an API key before `pnpm dev` even starts. High friction for a prototype. |
| Direct only | Keeps the pre-migration pain — two keys, no failover, no usage view. |
| Direct + manual gateway opt-in per call site | Duplication across `api/ai.js`, `lib/rag.js`, future endpoints. Easy to forget one. |
| AI Gateway via its own `@ai-sdk/gateway` package | Already re-exported by `ai` in v6. Adding the package to `package.json` directly is redundant. |

## Consequences

- **Positive:** Single toggle flips the whole app. Production gets OIDC
  auth for free. Local dev keeps working without any setup change. Error
  messages in `api/ai.js` are now mode-agnostic so operators don't need
  to know which auth path is in use to interpret a 500.
- **Negative:** Two code paths mean two things to maintain. Gateway
  outages don't auto-fall-back to direct — the code branch is decided
  at module load, not per request. Adding per-request failover would be
  a follow-up if gateway reliability becomes an issue.
- Adding a new provider means adding a branch to `resolveChatModel` and
  nothing else.
