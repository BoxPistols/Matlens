# ADR-011: テスト戦略（Vitest + 純関数 + 決定論的 fixture）

- ステータス: Accepted
- 日付: 2026-04-18
- 関連 issue / PR: #45, #48, #66, #67, テスト 600 件超

## 背景

Matlens は PoC だが、次の性質がある。

- 切削プロセスの **物理計算**（Taylor / Kienzle / SLD / FFT）を多く含む
- **ドメイン型が多い**（材料・案件・試験・試験片・報告書・工具・切削条件）
- **UI の状態遷移** が複数（Kanban D&D、ウィザード、フィルタ・検索）
- バックエンドは Mock で、Repository 差替えの将来を見据える

PoC ゆえにテストを省きたくなる誘惑があるが、

- 物理計算は仕様バグが後工程で発覚すると信頼失墜
- ドメイン型拡張時の型整合は CI で機械的に拾いたい
- Mock → REST 切替時に画面挙動が変わらないことを担保したい

## 決定

**Vitest を唯一のテストランナーとして採用**し、**層別にテスト戦略を分離**する。

### 階層別テスト戦略

| 階層 | テスト対象 | 手段 |
|---|---|---|
| Domain | 型・Zod schema・純関数バリデーション | Vitest（`*.test.ts`）|
| ドメインユーティリティ | 集計 (`src/domain/aggregations/`)、物理計算 | Vitest + 固定入力 → 期待値 |
| Infra / Repository | Mapper、Repository 実装 | Vitest + MSW |
| UI Components | レンダリング、a11y、インタラクション | Vitest + React Testing Library + `@testing-library/user-event` |
| Storybook | ビジュアル確認、UX レビュー | Storybook + play 関数（必要箇所のみ） |

### ルール

1. **純関数は必ずテスト**（Taylor / Kienzle / SLD / FFT は入力 → 期待値の組を多数）
2. **決定論的 fixture を使う**（ADR-003）— 実値を使ったテストで乱数に依存しない
3. **UI は "見えるもの" を `findByRole` / `findByText` で検証**
   （実装詳細ではなく、ユーザから見た挙動）
4. **a11y テストは `axe-core` を play 関数で限定的に実行**
5. **スナップショット乱用禁止** — 差分レビュー負荷が上がるだけ
6. **E2E は現状スコープ外**（PoC 期間ではコスト対効果が低い）

### テスト品質の指標

- **物理計算モジュール**: 代表値 + 境界値 + 無効入力で 10+ ケース
- **Repository**: Mock / REST の両実装で同じ期待値（同じテストを再利用）
- **集計ユーティリティ**: 空 / 単一 / 複数 / 境界日時のケースを網羅
- **UI**: 主要ユースケースとキーボード操作経路を最低 1 本ずつ

## 代替案と棄却理由

| 案 | 棄却理由 |
|---|---|
| Jest | 既に Vite + Vitest で環境が整っており、import / ESM 周りの齟齬なし |
| Playwright E2E 中心 | PoC 期間で投資対効果が低い。モックデータ相手の E2E は
  実データ接続後に再設計する前提で、今は Vitest + RTL でコンポーネント確実性を担保 |
| Cypress | 同上 |
| スナップショット中心 | レビュー時のノイズが多く、真のリグレッション検知が鈍る |

## 実装ポイント

- ファイル命名: `*.test.ts` / `*.test.tsx`（配置は対象と同階層）
- テストセットアップ: `vitest.setup.ts` で `jest-dom` マッチャと MSW を起動
- Repository テストの共有パターン:
  - Mock 実装テストと REST 実装テストが **同じ assertion を使う**
  - 共通の `it.each` テーブルで両モードを回す
- 物理計算テストの表現:
  - `fitTaylor` のように関数内にノイズを注入しないケースでは R² ≈ 1 を許容幅付きで断言
  - 境界で発散する関数（SLD blim）は `isFinite` と符号だけ断言
- 閾値定数は **`src/features/cutting/utils/standards.ts` に集約** し、
  テスト側も同じ定数をインポート（二重定義禁止）

## 影響

### ポジティブ
- 現在 600+ テストが維持されており、リファクタに耐える
- 物理計算の仕様バグが CI で即発覚
- Repository 差替え時の回帰検知が機械化されている
- `docs/onsite/` のヒアリング結果を fixture に反映した際、関連テストが即失敗
  → 「ドキュメント更新はテストで検証される」構造

### ネガティブ
- UI テストの保守コスト（文言変更で壊れやすい `findByText`）
  → role ベースの検索を優先するガイドラインを維持
- play 関数を書いた Storybook はメンテ対象が増える
  → 主要 Signature Screen のみに限定

## 将来の検討事項

- 実バックエンド接続後の契約テスト（REST スキーマ vs 実装）
- Playwright E2E の段階導入（重要ユースケース 3〜5 本から）
- ビジュアルリグレッション（Chromatic / Percy）の必要性判断
- 物理計算のプロパティベーステスト（fast-check 等）
