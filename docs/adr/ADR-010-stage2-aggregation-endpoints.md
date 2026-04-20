# ADR-010: 集計 / 横断検索エンドポイントを Stage 2 で REST へ切り出す

- ステータス: Accepted
- 日付: 2026-04-18
- 関連 issue / PR: #45 (Ops Dashboard), #48 (切削クロスドメイン), 横断検索

## 背景

Matlens には次のクロスドメイン集計・検索がある。

- **Ops Dashboard**: 案件 / 試験片 / レポート / 異常所見を横串に KPI 化
- **試験マトリクス**: 材料 × 試験種別のヒートマップ（件数 or 工数 or 売上）
- **損傷ギャラリー**: 損傷タイプ × 材料 × 確信度で絞り込み
- **横断セマンティック検索**: 材料 / 案件 / 損傷 / 報告書 を横断
- **切削 × 試験のクロス**（将来）: 材料 X の機械特性と切削加工性の相関

Stage 1（現状）は MSW + in-memory DB で全クライアント集計している。
データ量が小さいから成立しているが、

- 集計ごとに全件 fetch → クライアント側 reduce しており、スケールしない
- Repository インターフェースが「list / get / create / update / delete」で
  集計メソッドを持たず、画面側で都度アドホック実装
- 検索は文字列 `includes` の線形スキャンで、セマンティックな関連度はない

## 決定

**Stage 1 では現状の in-memory 集計を維持しつつ、Stage 2 で集計 / 検索を
REST エンドポイントに切り出す前提で境界を設計する**。

### Stage 1 で守ること（将来の REST 化を容易にする）

1. **集計結果は専用の戻り型を返す** — `Project[]` を返して画面側で reduce しない
   - 例: `dashboardRepository.getKpis(filter): Promise<DashboardKpis>`
   - 例: `matrixRepository.getHeatmap(axes, filter): Promise<MatrixCell[]>`
2. **フィルタ・軸は型で明示** — URL クエリにそのまま乗る形で設計
3. **集計ロジックは `src/domain/aggregations/` に純関数で配置** し、
   mock/rest 両方から呼べるようにする
4. **検索は `searchRepository.search(query, types): Promise<SearchHit[]>`**
   という単一メソッドに集約

### Stage 2 で切り出す REST エンドポイント（想定）

- `GET /api/v1/dashboard/kpis` — KPI 4 種
- `GET /api/v1/dashboard/timeline` — 活動タイムライン
- `GET /api/v1/matrix/tests` — 試験マトリクスヒートマップ
- `GET /api/v1/damage/gallery` — 損傷ギャラリー（ページング）
- `POST /api/v1/search` — セマンティック検索（ベクトル or 全文）
- `GET /api/v1/analytics/cutting-vs-tests` — クロスドメイン（将来）

いずれも **read-only** なので Stage 1 側の純関数集計が
そのままバックエンド実装のリファレンスになる。

## 代替案と棄却理由

| 案 | 棄却理由 |
|---|---|
| 最初から REST 実装 | バックエンドが別チームでまだ未整備。UI 側で先行できない |
| GraphQL で一本化 | 集計に強い一方で、本プロジェクトの読み手層（フルスタック + 運用）に
  学習コストを強いる。段階的に REST で切り出してから再評価 |
| 画面側で全件 fetch → reduce 継続 | 実データ量で破綻。設計不良のまま本番化する危険 |

## 実装ポイント

- Repository インターフェースに **集計メソッドを追加**
  - `getKpis(filter)`, `getHeatmap(axes)`, `search(q)` など
- Mock 実装では `src/domain/aggregations/` の純関数を in-memory DB 上で実行
- REST 実装では同エンドポイントに HTTP GET / POST
- 戻り型は **DTO ではなく Domain 型** に Mapper 経由で変換
  → 画面コードは mode に依存しない

## 影響

### ポジティブ
- 画面コードは Stage 1 / Stage 2 で変更不要（Repository 差替えのみ）
- 集計ロジックが純関数に集まり、テスト容易
- REST 化したとき、Mock 側のロジックが **仕様書代わり** になる

### ネガティブ
- Stage 1 でも専用の戻り型を設計する必要があり、初期実装コストが増える
- Repository のメソッド数が増える（画面ごとに 1〜2 個）
  → 命名規則と責務境界をレビューで維持
- セマンティック検索の Stage 2 実装は Upstash Vector 等のバックエンド依存が発生
  （ADR-0002 との整合）

## 将来の検討事項

- ページング・ソート・フィルタの共通パラメータ型（`PageRequest`, `SortOrder`）
- レスポンス形式の統一（`{ data, meta: { total, ... } }`）
- キャッシュ戦略（TanStack Query の staleTime / gcTime 設計）
- GraphQL 再評価のトリガ条件（REST エンドポイントが 20+ 本になったら、等）
