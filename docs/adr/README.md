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

### インフラ / 外部サービス系（英語）

| # | Title | Status |
| --- | --- | --- |
| [0001](./0001-vercel-functions-on-hobby-plan.md) | Host the backend on Vercel Functions (Hobby plan) | Accepted |
| [0002](./0002-upstash-vector-for-rag.md) | Use Upstash Vector for RAG retrieval | Accepted |
| [0003](./0003-rate-limit-with-upstash-redis-fallback.md) | Persistent rate limit via Upstash Redis with in-memory fallback | Accepted |
| [0004](./0004-maiml-as-primary-export-format.md) | MaiML (JIS K 0200:2024) as the primary export / import format | Accepted |
| [0005](./0005-ai-gateway-with-direct-fallback.md) | Route AI calls through Vercel AI Gateway with a direct-provider fallback | Accepted |
| [0006](./0006-petri-net-visualization.md) | ペトリネット可視化ライブラリ選定（純 SVG 自作） | Accepted |
| [0007](./0007-simulation-tiers-and-disclosure.md) | シミュレーション階層と根拠の開示方針 | Accepted |

### フロントエンド / ドメイン設計系（日本語）

| # | Title | Status |
| --- | --- | --- |
| [ADR-001](./ADR-001-repository-and-layered-architecture.md) | レイヤードアーキテクチャと Repository パターンの採用 | Accepted |
| [ADR-002](./ADR-002-cutting-domain-separation.md) | 切削ドメインを別型・別画面として分離する | Accepted |
| [ADR-003](./ADR-003-deterministic-fixtures.md) | 決定論的 fixture の採用（seed 固定 + 手書き seeds 優先） | Accepted |
| [ADR-004](./ADR-004-custom-markdown-renderer.md) | Markdown レンダラを自前実装する | Accepted |
| [ADR-005](./ADR-005-stability-lobe-phased-implementation.md) | Stability Lobe Diagram の段階的実装（概念曲線 → 厳密化） | Accepted |
| [ADR-006](./ADR-006-specimen-tracker-dual-view.md) | 試験片トラッカーを Kanban + Table の二重ビューで提供する | Accepted |
| [ADR-007](./ADR-007-synchronized-doc-updates.md) | PAGE_GUIDES / announcements / README の連動更新ルール | Accepted |
| [ADR-008](./ADR-008-timezone-normalization-jst.md) | タイムゾーン正規化（内部 UTC / 表示 JST） | Accepted |
| [ADR-009](./ADR-009-pure-svg-zero-dependency-visualization.md) | 可視化は純 SVG + 依存ゼロ（chart ライブラリ不採用） | Accepted |
| [ADR-010](./ADR-010-stage2-aggregation-endpoints.md) | 集計 / 横断検索エンドポイントを Stage 2 で REST へ切り出す | Accepted |
| [ADR-011](./ADR-011-testing-strategy.md) | テスト戦略（Vitest + 純関数 + 決定論的 fixture） | Accepted |
| [ADR-012](./ADR-012-machining-fundamentals-integration.md) | machining-fundamentals との親密化統合戦略 | Proposed |

[nygard]: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
