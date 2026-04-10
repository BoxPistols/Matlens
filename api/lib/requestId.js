// Request ID helper. Vercel auto-injects an `x-vercel-id` header that we
// reuse so log entries are stitched into a single trace from edge → function
// → outbound provider call. If the platform header is missing (running
// locally / unit tests) we fall back to a fresh UUID.
//
// The id is also echoed back to the client via `x-request-id` so an end
// user reporting "I got an error" can paste a request id and we can find
// every related log entry instantly.

import { randomUUID } from 'node:crypto';

export function getRequestId(req) {
  const headers = req?.headers ?? {};
  return (
    headers['x-vercel-id'] ||
    headers['x-request-id'] ||
    randomUUID()
  );
}

export function setRequestIdHeader(res, requestId) {
  if (res?.setHeader) {
    res.setHeader('x-request-id', requestId);
  }
}
