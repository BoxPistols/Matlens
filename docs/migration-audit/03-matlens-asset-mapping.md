# 棚卸し 3: Matlens A ランク資産マッピング

**本タスクは 2026-05-15 完了済**。`pnpm verify:agnostic` で機械計測。

## 実測結果（2026-05-15 計測）

`pnpm verify:agnostic` の SLOC 集計から（テスト / Storybook 除く）:

| 領域 | SLOC | ランク | 流用方針 |
|---|---:|---|---|
| `src/services/` | 2,458 | A | MaiML / nlQuery / bayesianOpt 等 純 TS、そのまま import |
| `src/infra/repositories/mock/` | 1,029 | A | InMemoryTable / フィルタ、Repository 抽象を React 側でも使う |
| `src/features/tests/matrix/` | 1,007 | A | 異常率 / 顧客集計の純関数 |
| `src/domain/` | 856 | A | 型 / Zod schema / 定数、`@matlens/domain` パッケージ化候補 |
| `src/features/cutting/utils/` | 792 | A | FFT / Stability Lobe / Kienzle / Taylor |
| `design-tokens/src/` | 412 | A | CSS 変数 + Tailwind v4 移行で再利用 |
| `src/features/dashboard/utils/` | 345 | A | KPI 集計の純関数 |
| `src/infra/repositories/interfaces/` | 334 | A | Repository 抽象（DI 境界） |
| `src/features/tools/utils/` | 63 | A | 工具摩耗ステータス |
| `src/shared/utils/` | 51 | A | 汎用ユーティリティ |
| **合計 (A ランク)** | **7,347** | | |

## 派生指標

| 指標 | 値 | 出典 |
|---|---:|---|
| 新規 React/Next アプリ想定 SLOC（30-50 画面想定） | 20,000-30,000 | 一般的な業務 SPA |
| **Matlens 資産で充足できる割合** | **約 25-35%** | 7,347 / 25,000 |
| 「ゼロ起点ではない」の定量的裏付け | ✅ | A ランク 7,347 行は 0 ではない |

## 境界制約の検証

| チェック | 結果 |
|---|---|
| `src/domain/` から React/Vue/TanStack Query import | **ゼロ** ✅ |
| `src/infra/repositories/interfaces/` から React/Vue import | **ゼロ** ✅ |
| `src/services/` から React/Vue import | **ゼロ** ✅ |
| ESLint `no-restricted-imports` で error レベル禁止 | 設定済 ✅ |

→ うっかり Vue 専用 API が混入するリスクは構造的に塞がっている (#108 Phase 0 の前提クリア)。

## Vue 側で流用する場合

Issue #110 / #111 のフォールバック（Vue 継続）でも上記資産は同じく流用可能:
- `domain/` → `@matlens/domain` パッケージ化して Nuxt から import
- `services/` の MaiML は DOMParser 依存を引数注入化（Phase 0 タスク #108）
- `design-tokens/` → Nuxt の `tailwind.config.ts` + `nuxt.config.ts` から import

→ **採否どちらに転んでもこの 7,347 行は資産として残る**。リスクヘッジ完了。

## 反映先

- ADR-0018「Matlens A ランク資産の実測 SLOC」セクション
- Issue #113 タスク 3「Matlens 移植可能資産マッピング」

## 更新時の手順

```sh
# 再計測（コードが大きく動いたとき）
pnpm verify:agnostic | tee /tmp/asset-sloc.txt

# 数値を本ファイルと ADR-0018 にコピー
```
