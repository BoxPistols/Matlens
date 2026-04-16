# ADR-001: レイヤードアーキテクチャと Repository パターンの採用

- ステータス: Accepted
- 日付: 2026-04-17
- 対象ブランチ: `claude/refactor-architecture-TWjJm`

## 背景

Matlens PoC では、受託試験・材料調査事業向けの SaaS UI/UX を構築します。
将来的に Vercel Functions + Supabase / Neon 等の実バックエンドへ差し替えることを
見越し、UI 層がデータアクセス詳細に依存しない構造が必要でした。

## 決定

次の 4 層でソースコードを構成します。

1. **Domain 層 (`src/domain/`)**: ドメインの型・Zod スキーマ・定数のみ。外部依存なし。
2. **Infra 層 (`src/infra/`)**: Repository のインターフェースと Mock / REST 実装、
   DTO ⇄ Domain を変換する Mapper、`fetch` ラッパの `apiClient`、DI コンテナ。
3. **Mocks 層 (`src/mocks/`)**: Seeds（手書きマスタ）、faker ベースの Generator、
   in-memory DB、MSW ハンドラ。
4. **App / Features 層**: React コンポーネント。Repository は
   `useRepositories()` 経由でしか取得しない。

## 実装ポイント

- `createRepositories(mode)` によって `mock` / `rest` / `graphql` を切替可能。
  現時点では `mock` のみ実装。
- Repository は必ず Domain 型を返し、DTO を外部に漏らさない。
- Mapper は純粋関数のみ。Handler / REST Repo の両方で共有する。
- `VITE_BACKEND_MODE=mock` / `VITE_MSW_ENABLED=true` で段階的に切替。

## 代替案と棄却理由

- **Repository を導入しない**: 初期コストは小さいが、後続フェーズで
  本バックエンドに接続する際、UI コードに fetch / クエリロジックが散在して
  置換コストが跳ね上がる。棄却。
- **tRPC / Hono RPC**: 魅力的だが、今回は UI/UX PoC として単独で動くことを
  優先。将来 REST 実装を差し替える際に再検討する。

## 影響

- 既存 `src/services/mockApi.ts` はそのまま残し、新アーキテクチャ側は
  `src/infra/repositories/` 経由で段階的に置換する。
- 新機能（案件・試験片・試験マトリクス等）は本アーキテクチャを前提に実装する。
