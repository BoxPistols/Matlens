// Structured logger for Matlens API routes.
//
// Emits one JSON-per-line log entry to stdout/stderr so Vercel Logs (and
// any downstream log shipper) can parse it without regex gymnastics. Every
// entry carries a timestamp, level, message, and the Vercel runtime
// environment / region — plus any caller-supplied metadata.
//
// Sensitive keys (api keys, tokens, passwords, authorization headers) are
// scrubbed before serialisation so a forgotten `error.config.headers` log
// can never leak a credential. The masking is recursive and case-insensitive.

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const DEFAULT_LEVEL = 'info';

function currentLevel() {
  const fromEnv = (process.env.LOG_LEVEL || '').toLowerCase();
  return fromEnv in LEVELS ? fromEnv : DEFAULT_LEVEL;
}

const SENSITIVE_KEY = /api[_-]?key|token|password|secret|authorization|cookie/i;

export function maskSensitive(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (typeof value !== 'object') return value;
  const out = {};
  for (const key of Object.keys(value)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = '***REDACTED***';
    } else {
      out[key] = maskSensitive(value[key]);
    }
  }
  return out;
}

function emit(level, message, meta = {}) {
  if (LEVELS[level] < LEVELS[currentLevel()]) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    region: process.env.VERCEL_REGION,
    env: process.env.VERCEL_ENV,
    ...maskSensitive(meta),
  };
  // error/warn → stderr, debug/info → stdout
  const sink = level === 'error' || level === 'warn' ? console.error : console.log;
  sink(JSON.stringify(entry));
}

export const log = {
  debug: (message, meta) => emit('debug', message, meta),
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};
