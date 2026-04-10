// Shared input validation helpers for Matlens API routes.
//
// These run on the server before any business logic or outbound call
// executes, so downstream providers never see bad input and an attacker
// cannot coerce large / malformed / null-byte-infested payloads into the
// pipeline. Every validator throws a ValidationError with a short user-
// facing message on failure — the route handler converts that to an HTTP
// 400 response.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

// Absolute maximums. These are deliberately generous but bounded.
const MAX_PROMPT_LENGTH = 4000;
const MAX_SYSTEM_LENGTH = 4000;
const MAX_QUERY_LENGTH = 500;
const MAX_TOPK = 20;
const MIN_TOPK = 1;
const MAX_MATERIALS_PER_INGEST = 500;
const MAX_INGEST_STRING_FIELD = 2000;

const ALLOWED_PROVIDERS = new Set(['openai-nano', 'openai-mini', 'gemini']);
const ALLOWED_CATEGORIES = new Set([
  'METAL',
  'CERAMIC',
  'POLYMER',
  'COMPOSITE',
  'OTHER',
]);

// Reject null bytes — some downstream providers choke on them, and they
// are a common smuggling primitive. Applies everywhere we take free-form
// text.
function assertNoNullBytes(value, fieldName) {
  if (value.includes('\x00')) {
    throw new ValidationError(`${fieldName} contains a null byte`);
  }
}

/**
 * Validate a prompt / system message coming from a client. Normalizes
 * Unicode to NFKC so zero-width characters and visually-identical tricks
 * resolve to a canonical form before length checks.
 */
export function validatePrompt(prompt, { field = 'prompt', max = MAX_PROMPT_LENGTH } = {}) {
  if (typeof prompt !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  assertNoNullBytes(prompt, field);
  const normalized = prompt.normalize('NFKC');
  if (normalized.length === 0) {
    throw new ValidationError(`${field} is empty`);
  }
  if (normalized.length > max) {
    throw new ValidationError(`${field} is too long (max ${max} chars)`);
  }
  return normalized;
}

export function validateOptionalSystem(system) {
  if (system === undefined || system === null) return undefined;
  return validatePrompt(system, { field: 'system', max: MAX_SYSTEM_LENGTH });
}

/**
 * Reject anything not on the provider allowlist so a malicious client
 * cannot trick the router into calling an unexpected upstream.
 */
export function validateProvider(provider) {
  if (typeof provider !== 'string') {
    throw new ValidationError('provider must be a string');
  }
  if (!ALLOWED_PROVIDERS.has(provider)) {
    throw new ValidationError(`invalid provider: ${provider}`);
  }
  return provider;
}

export function validateSearchQuery(query) {
  return validatePrompt(query, { field: 'query', max: MAX_QUERY_LENGTH });
}

/**
 * topK for vector search — must be a positive integer within sane bounds.
 */
export function validateTopK(k, fallback = 6) {
  if (k === undefined || k === null) return fallback;
  if (typeof k !== 'number' || !Number.isInteger(k)) {
    throw new ValidationError('k must be an integer');
  }
  if (k < MIN_TOPK || k > MAX_TOPK) {
    throw new ValidationError(`k must be between ${MIN_TOPK} and ${MAX_TOPK}`);
  }
  return k;
}

export function validateCategoryFilter(category) {
  if (category === undefined || category === null || category === '') return undefined;
  if (typeof category !== 'string') {
    throw new ValidationError('category must be a string');
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new ValidationError(`invalid category: ${category}`);
  }
  return category;
}

function assertString(value, field, max = MAX_INGEST_STRING_FIELD) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  assertNoNullBytes(value, field);
  const normalized = value.normalize('NFKC');
  if (normalized.length > max) {
    throw new ValidationError(`${field} is too long (max ${max} chars)`);
  }
  return normalized;
}

function assertFiniteNumber(value, field) {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError(`${field} must be a finite number`);
  }
  return value;
}

/**
 * Validate the shape of a materials array for /api/ingest. Returns a
 * fresh array of sanitised records so downstream code never touches the
 * raw request body.
 */
export function validateIngestMaterials(materials) {
  if (!Array.isArray(materials)) {
    throw new ValidationError('materials must be an array');
  }
  if (materials.length === 0) {
    throw new ValidationError('materials is empty');
  }
  if (materials.length > MAX_MATERIALS_PER_INGEST) {
    throw new ValidationError(
      `too many materials (max ${MAX_MATERIALS_PER_INGEST} per request)`
    );
  }
  return materials.map((mat, i) => {
    if (!mat || typeof mat !== 'object') {
      throw new ValidationError(`materials[${i}] must be an object`);
    }
    const id = assertString(mat.id, `materials[${i}].id`, 64);
    if (!id) throw new ValidationError(`materials[${i}].id is required`);
    return {
      id,
      name: assertString(mat.name, `materials[${i}].name`),
      cat: assertString(mat.cat, `materials[${i}].cat`, 64),
      comp: assertString(mat.comp, `materials[${i}].comp`),
      memo: assertString(mat.memo, `materials[${i}].memo`),
      hv: assertFiniteNumber(mat.hv, `materials[${i}].hv`),
      ts: assertFiniteNumber(mat.ts, `materials[${i}].ts`),
      el: assertFiniteNumber(mat.el, `materials[${i}].el`),
      dn: assertFiniteNumber(mat.dn, `materials[${i}].dn`),
    };
  });
}

/**
 * Enforce Content-Type: application/json on POST endpoints so CSRF-style
 * "simple request" form submissions from another origin cannot hit them.
 */
export function assertJsonContentType(req) {
  const ct = req.headers?.['content-type'] ?? '';
  if (!ct.toLowerCase().includes('application/json')) {
    const err = new ValidationError('Unsupported Media Type — expected application/json');
    err.status = 415;
    throw err;
  }
}

// Shared limits re-exported so tests / other modules can reference them.
export const LIMITS = {
  MAX_PROMPT_LENGTH,
  MAX_SYSTEM_LENGTH,
  MAX_QUERY_LENGTH,
  MAX_TOPK,
  MIN_TOPK,
  MAX_MATERIALS_PER_INGEST,
  MAX_INGEST_STRING_FIELD,
};
