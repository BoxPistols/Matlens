# ADR 0002: Use Upstash Vector for RAG retrieval

- **Status:** Accepted
- **Date:** 2026-04-09

## Context

The RAG chat and "similar materials" features both need approximate
nearest-neighbor search over a ~hundreds-to-thousands row material database.
Needs:

1. Serverless-friendly — no persistent connections, no warm pool. The
   API routes run on Vercel Functions; a stateful DB driver would pay a
   cold-start penalty every invocation.
2. HTTP/REST API so the same client works from both the serverless
   function and occasional maintenance scripts.
3. Free or near-free at prototype scale.
4. Metadata filtering (we filter by `category = 'METAL'` etc.).
5. Owner-operated observability is optional — we don't want to run a
   separate vector DB instance.

## Decision

Use **Upstash Vector** via `@upstash/vector` for the RAG index. The index
is keyed by Matlens material id and stores 1536-dim embeddings from OpenAI
`text-embedding-3-small`, plus category / name / composition metadata for
filtering. See `lib/rag.js`.

Graceful-degradation policy: if `UPSTASH_VECTOR_REST_URL` /
`UPSTASH_VECTOR_REST_TOKEN` are unset (local dev without credentials),
`api/search.js` falls back to a pure keyword match against the in-memory
db posted with the request. Users see slightly dumber results instead of
a hard error, and the engine badge in the UI flips from "upstash" to
"keyword" so operators can see which path is in use.

## Alternatives considered

| Option | Why rejected |
| --- | --- |
| pgvector on Supabase | Also a good fit but adds a Postgres dependency we don't otherwise need. The Upstash HTTP API has zero cold-start cost. |
| Pinecone | Excellent product but the free tier was less generous and the HTTP SDK less idiomatic with AI SDK's `embed` helper. |
| Weaviate self-hosted | We don't want to run a server. |
| FAISS in-memory | Impossible on Vercel Functions — no persistence between invocations. Would need a bundled index shipped with the function, and we can't re-index on the fly. |

## Consequences

- **Positive:** Zero server to operate, HTTP-native, free at current scale,
  metadata filter support, client works the same in both API routes and
  ingestion scripts.
- **Negative:** Hard dependency on a third-party vendor for RAG. An Upstash
  outage degrades to keyword search rather than full failure (per the
  fallback policy), which is acceptable but not invisible.
- Changing vector stores later requires rewriting `lib/rag.js` and re-ingesting
  all materials. The `lib/rag.js` contract is narrow (`embed`, `search`,
  `ingestMaterials`), which limits the blast radius.
