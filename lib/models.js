// Unified model resolver for Matlens AI calls.
//
// Two modes:
//   1. Vercel AI Gateway (preferred)
//      — single credential, provider fallback, observability, usage reporting.
//      Model IDs become slash-prefixed slugs like `openai/gpt-5.4-nano`
//      and the `ai` package's built-in gateway handles routing.
//
//      Auth modes supported transparently by `@ai-sdk/gateway`:
//        a. OIDC token (recommended on Vercel) — auto-provisioned in
//           production & preview deployments; `vercel env pull` refreshes
//           it locally. Zero manual rotation.
//        b. `AI_GATEWAY_API_KEY` — simpler for non-Vercel or local dev;
//           must be rotated manually from the Vercel dashboard.
//
//   2. Direct provider SDKs (fallback, legacy behavior)
//      — uses `@ai-sdk/openai` / `@ai-sdk/google` with per-provider API keys.
//      This path stays reachable so a gateway outage doesn't take the whole
//      app down, and so local dev without a gateway key still works.
//
// The branch is decided once at module load. Gateway mode engages when
// either `AI_GATEWAY_API_KEY` is set, an OIDC token is present (populated
// by `vercel env pull` into `VERCEL_OIDC_TOKEN`), or the operator forces
// it with `AI_GATEWAY_ENABLED=1`. `AI_GATEWAY_ENABLED=0` forces direct mode
// regardless — handy for reproducing provider-specific behavior locally.
//
// NOTE: we intentionally keep `@ai-sdk/openai` / `@ai-sdk/google` in
// package.json so the direct path survives — removing them would make the
// gateway a hard dependency, which we don't want yet.

import { gateway } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

function detectGatewayMode() {
  const forced = process.env.AI_GATEWAY_ENABLED;
  if (forced === '0' || forced === 'false') return false;
  if (forced === '1' || forced === 'true') return true;
  if (process.env.AI_GATEWAY_API_KEY) return true;
  // OIDC path — Vercel deployments and `vercel env pull` populate this.
  if (process.env.VERCEL_OIDC_TOKEN) return true;
  return false;
}

export const USE_GATEWAY = detectGatewayMode();

// Canonical model names the app knows about. Add new ones here rather than
// sprinkling string literals across the codebase.
export const MODEL_IDS = {
  openaiChat: 'gpt-5.4-nano',
  googleChat: 'gemini-2.5-flash',
};

/**
 * Resolve a LanguageModelV2 for the given logical provider.
 * @param {'openai' | 'gemini'} provider
 */
export function resolveChatModel(provider) {
  if (USE_GATEWAY) {
    return provider === 'gemini'
      ? gateway(`google/${MODEL_IDS.googleChat}`)
      : gateway(`openai/${MODEL_IDS.openaiChat}`);
  }
  return provider === 'gemini'
    ? google(MODEL_IDS.googleChat)
    : openai(MODEL_IDS.openaiChat);
}

/**
 * Check whether the current environment has credentials for the given
 * provider. In gateway mode, any of the three signals that
 * `detectGatewayMode` recognises (gateway API key, OIDC token, or an
 * explicit `AI_GATEWAY_ENABLED=1` operator override) counts as
 * "credentialed" — a single credential covers every provider. In direct
 * mode each provider needs its own per-provider key.
 *
 * Kept in lockstep with `detectGatewayMode`: if you add a new signal
 * there, add it here too, or OIDC-only deployments will silently start
 * returning 500s at the `/api/ai` credential gate.
 * @param {'openai' | 'gemini'} provider
 */
export function hasProviderKey(provider) {
  if (USE_GATEWAY) {
    const forced =
      process.env.AI_GATEWAY_ENABLED === '1' ||
      process.env.AI_GATEWAY_ENABLED === 'true';
    return Boolean(
      process.env.AI_GATEWAY_API_KEY ||
        process.env.VERCEL_OIDC_TOKEN ||
        forced
    );
  }
  if (provider === 'gemini') {
    return Boolean(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    );
  }
  return Boolean(process.env.OPENAI_API_KEY);
}
