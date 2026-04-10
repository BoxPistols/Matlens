// Vercel Serverless Function — AI API Proxy with Rate Limiting
// 環境変数: OPENAI_API_KEY, GEMINI_API_KEY (→ GOOGLE_GENERATIVE_AI_API_KEY),
//          DAILY_LIMIT (default: 30),
//          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (persistent rate limit)
//
// Uses Vercel AI SDK v6 (`ai` + `@ai-sdk/openai` + `@ai-sdk/google`) for
// unified provider abstraction — one call site for OpenAI and Gemini.
//
// Modes:
//   POST /api/ai           → generateText, returns { text, remaining, limit }
//   POST /api/ai?stream=1  → streamText, returns text/plain stream of chunks
//                            (remaining/limit sent via x-ratelimit-* headers)

import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { checkRateLimit, getRemainingQuota } from '../lib/ratelimit.js';
import { classifyAIError } from '../lib/aiErrors.js';
import {
  ValidationError,
  validatePrompt,
  validateOptionalSystem,
  validateProvider,
  assertJsonContentType,
} from '../lib/validation.js';
import { applyCors } from '../lib/cors.js';
import { log } from '../lib/logger.js';
import { getRequestId, setRequestIdHeader } from '../lib/requestId.js';

// @ai-sdk/google reads from GOOGLE_GENERATIVE_AI_API_KEY; accept GEMINI_API_KEY
// as an alias since that's what the rest of the Matlens codebase uses.
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
}

const DEFAULT_SYSTEM =
  'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

function resolveModel(provider) {
  if (provider === 'gemini') return google('gemini-2.5-flash');
  return openai('gpt-5.4-nano');
}

function errorResponse(res, status, classified, rl) {
  const body = {
    error: classified.message,
    code: classified.code,
  };
  if (rl) {
    body.remaining = rl.remaining;
    body.limit = rl.limit;
  }
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  const requestId = getRequestId(req);
  setRequestIdHeader(res, requestId);
  const startedAt = Date.now();

  // CORS — restrict to Matlens deployments + localhost instead of `*`.
  // Non-browser callers (curl, server-to-server) will have no Origin and
  // are allowed through; input validation + rate limiting handle those.
  const corsAllowed = applyCors(req, res);
  if (!corsAllowed) {
    log.warn('cors rejected', { requestId, origin: req.headers?.origin });
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/ai → return rate limit status
  if (req.method === 'GET') {
    const { remaining, limit } = await getRemainingQuota(req);
    return res.status(200).json({ remaining, limit });
  }

  if (req.method !== 'POST') {
    return errorResponse(res, 405, { code: 'UNKNOWN', message: 'Method not allowed' });
  }

  // Input validation — reject bad content-type, unknown providers, and
  // oversized / empty / null-byte-infested prompts before touching the
  // rate limiter or the upstream model. Everything from req.body is
  // treated as untrusted.
  let provider;
  let prompt;
  let system;
  try {
    assertJsonContentType(req);
    const body = req.body || {};
    provider = validateProvider(body.provider);
    prompt = validatePrompt(body.prompt);
    system = validateOptionalSystem(body.system);
  } catch (e) {
    if (e instanceof ValidationError) {
      log.warn('validation failed', { requestId, error: e.message });
      return errorResponse(res, e.status || 400, { code: 'BAD_REQUEST', message: e.message });
    }
    throw e;
  }

  log.info('ai request received', {
    requestId,
    provider,
    promptLength: prompt.length,
    hasSystem: !!system,
  });

  // Provider key presence check (friendlier than downstream auth error)
  if (provider === 'gemini') {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return errorResponse(res, 500, { code: 'UNAUTHORIZED', message: 'GEMINI_API_KEY not configured' });
    }
  } else if (!process.env.OPENAI_API_KEY) {
    return errorResponse(res, 500, { code: 'UNAUTHORIZED', message: 'OPENAI_API_KEY not configured' });
  }

  // Rate limit check (Upstash Redis persistent or in-memory fallback)
  const rl = await checkRateLimit(req);
  if (!rl.allowed) {
    return errorResponse(res, 429, {
      code: 'RATE_LIMIT',
      message: `本日の利用上限（${rl.limit}回/日）に達しました。明日リセットされます。自分のAPIキーを設定すると無制限で利用できます。`,
    }, rl);
  }

  // Detect streaming mode — ?stream=1 query param OR x-stream: 1 header
  const wantsStream =
    req.query?.stream === '1' ||
    req.query?.stream === 'true' ||
    req.headers['x-stream'] === '1' ||
    (typeof req.url === 'string' && /[?&]stream=(1|true)\b/.test(req.url));

  if (wantsStream) {
    try {
      const result = streamText({
        model: resolveModel(provider),
        system: system || DEFAULT_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      });
      // Pass rate-limit info through headers since the body is the text stream.
      res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
      res.setHeader('X-RateLimit-Limit', String(rl.limit));
      // pipeTextStreamToResponse writes text/plain chunks to the Node response.
      result.pipeTextStreamToResponse(res);
      return;
    } catch (e) {
      const classified = classifyAIError(e);
      return errorResponse(res, 502, classified, rl);
    }
  }

  // Non-streaming path
  try {
    const { text } = await generateText({
      model: resolveModel(provider),
      system: system || DEFAULT_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    log.info('ai request completed', {
      requestId,
      provider,
      durationMs: Date.now() - startedAt,
      responseLength: text?.length ?? 0,
    });

    return res.status(200).json({
      text: text || '応答を取得できませんでした。',
      remaining: rl.remaining,
      limit: rl.limit,
    });
  } catch (e) {
    const classified = classifyAIError(e);
    log.error('ai request failed', {
      requestId,
      provider,
      durationMs: Date.now() - startedAt,
      code: classified.code,
      error: classified.message,
    });
    return errorResponse(res, 502, classified, rl);
  }
}
