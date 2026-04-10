// Health check endpoint — exposes service-level status so uptime monitors,
// CI smoke tests, and the operations runbook can all verify a deployment
// is healthy from a single shallow probe.
//
// Returns 200 when every checked subsystem is OK, 503 if any are degraded.
// Each subsystem is reported individually so a partial outage (e.g. AI key
// missing but vector DB live) can still be diagnosed at a glance.

import { applyCors } from './lib/cors.js';
import { log } from './lib/logger.js';
import { getRequestId, setRequestIdHeader } from './lib/requestId.js';

function checkEnv(name) {
  return process.env[name] ? 'ok' : 'not_configured';
}

export default async function handler(req, res) {
  const requestId = getRequestId(req);
  setRequestIdHeader(res, requestId);

  // Health checks should be readable from anywhere — uptime probes, status
  // pages, etc. Skip the strict CORS enforcement and just attach the
  // baseline headers.
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Subsystems are intentionally cheap to evaluate — we never call out to a
  // provider here, just verify the configuration the runtime needs to
  // operate. Any real network probe should be a separate /api/health/deep.
  const services = {
    openai: checkEnv('OPENAI_API_KEY'),
    gemini:
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
        ? 'ok'
        : 'not_configured',
    upstashRedis:
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? 'ok'
        : 'not_configured',
    upstashVector:
      process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN
        ? 'ok'
        : 'not_configured',
  };

  // OpenAI is the only mandatory service for the platform to function at
  // all (everything else has graceful fallbacks). If it's missing we
  // declare the deployment degraded.
  const status = services.openai === 'ok' ? 'ok' : 'degraded';
  const httpCode = status === 'ok' ? 200 : 503;

  const body = {
    status,
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? null,
    env: process.env.VERCEL_ENV ?? null,
    services,
    requestId,
  };

  if (status !== 'ok') {
    log.warn('health check degraded', { requestId, services });
  }

  return res.status(httpCode).json(body);
}
