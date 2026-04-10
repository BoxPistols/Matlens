// Shared CORS policy for Matlens API routes.
//
// The previous pattern was `Access-Control-Allow-Origin: *` which is fine
// for fully-public read endpoints but a footgun for anything that accepts
// user-controlled state (prompts, ingest, etc.) because any third-party
// site can silently bounce requests through the user's browser. We narrow
// it to an allowlist:
//
//   - Matlens production / preview deployments on Vercel
//   - localhost during development (port-agnostic)
//   - a custom list from ALLOWED_ORIGINS (comma-separated) for staging/prod
//
// Requests from outside the allowlist get `Access-Control-Allow-Origin`
// omitted entirely, which causes modern browsers to reject them at the
// preflight stage. Non-browser callers (curl, scripts) still work because
// CORS is a browser-enforced mechanism — for those we rely on the
// endpoint's own input validation and rate limiting.

const DEFAULT_ALLOWED = [
  /^https:\/\/matlens(-[\w-]+)?\.vercel\.app$/,
  /^https:\/\/matlens-storybook(-[\w-]+)?\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function getExtraAllowed() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Return true if the given Origin header value is allowed to call us.
 * A null / missing Origin means the request came from the same origin as
 * the page (or from a non-browser client); either way CORS doesn't apply
 * and we short-circuit to true.
 */
export function isOriginAllowed(origin) {
  if (!origin) return true;
  if (DEFAULT_ALLOWED.some(re => re.test(origin))) return true;
  const extras = getExtraAllowed();
  return extras.includes(origin);
}

/**
 * Apply the Matlens CORS policy to the given response. Returns whether
 * the origin is allowed so the caller can short-circuit on rejection.
 */
export function applyCors(req, res) {
  const origin = req.headers?.origin ?? '';
  const allowed = isOriginAllowed(origin);

  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Stream');
  res.setHeader('Access-Control-Max-Age', '86400');

  return allowed;
}
