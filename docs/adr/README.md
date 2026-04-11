# Architecture Decision Records (ADRs)

This directory documents the load-bearing architectural decisions in Matlens —
the ones that shape the codebase in ways that would be expensive or confusing
to reverse, and that a new maintainer can't just derive from reading the code.

The format is loosely based on [Michael Nygard's template][nygard]. Each ADR
is numbered, dated, and has a clear **status**. When a decision is later
reversed or superseded, we don't delete the old ADR — we mark it
`Superseded by ADR-NNNN` and leave it in place so the history is readable.

## When to write an ADR

Write one when:

- The decision shapes the system architecture (runtime, vendor, protocol,
  storage, framework).
- The decision has non-obvious trade-offs that a reasonable engineer would
  second-guess six months later ("why didn't we use X?").
- The decision constrains future work (e.g. "we can't add feature Y because
  we chose storage Z").

Don't write one for routine code style, library upgrades, or local
implementation details — those belong in commit messages.

## Index

| # | Title | Status |
| --- | --- | --- |
| [0001](./0001-vercel-functions-on-hobby-plan.md) | Host the backend on Vercel Functions (Hobby plan) | Accepted |
| [0002](./0002-upstash-vector-for-rag.md) | Use Upstash Vector for RAG retrieval | Accepted |
| [0003](./0003-rate-limit-with-upstash-redis-fallback.md) | Persistent rate limit via Upstash Redis with in-memory fallback | Accepted |
| [0004](./0004-maiml-as-primary-export-format.md) | MaiML (JIS K 0200:2024) as the primary export / import format | Accepted |
| [0005](./0005-ai-gateway-with-direct-fallback.md) | Route AI calls through Vercel AI Gateway with a direct-provider fallback | Accepted |

[nygard]: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
