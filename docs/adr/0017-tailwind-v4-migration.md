# ADR-0017: Tailwind CSS v3 → v4 移行戦略

- Status: Proposed
- Date: 2026-05-03
- 関連: PR #98 (Dependabot bump、計画的延期), Issue #115

## Context

Dependabot が `tailwindcss` を `^3.4.0` → `^4.2.4` に bump する PR #98 を提案している。
Tailwind v4 は **メジャーバージョンアップ**で、ビルドアーキテクチャと API が大きく変わる:

- **PostCSS プラグイン名変更**: `tailwindcss` → `@tailwindcss/postcss`
- **Vite 統合プラグイン推奨**: `@tailwindcss/vite`（高速）
- **`@theme` ディレクティブ**: theme 拡張は CSS 内 `@theme { --color-foo: ... }` で書く新方式
- **autoprefixer が組込み**: 別 deps として持つと冗長
- **`bg-opacity-*` / `text-opacity-*` 削除**: `bg-black/50` 形式に強制
- **デフォルトカラーパレットの再構成**

CI が緑（Vercel Preview SUCCESS）なのは Tailwind v4 の v3 互換モードが効いているためで、
**実際のスタイル出力が v3 と一致する保証はない**（サイレント壊れリスク）。

加えて、本番アプリ（Vue/Nuxt）の推奨スタックとして Tailwind v4 + PrimeVue Unstyled を
想定しており（`onsite_readiness_brief_2026_05.md`）、Matlens 側でも v4 への移行は
方針的には正しい。問題は「いつ・どう移行するか」。

## Decision

### 採用方針
- **Tailwind v3 → v4 への移行を採用する**
- ただし **Dependabot PR #98 を直接マージせず**、独立した移行 branch で計画的に対応する
- 移行作業は Phase 0 抽出（Issue #108）の `@matlens/tokens` パッケージ化と一体で進める

### 移行ステップ
1. **影響箇所の grep**:
   - `bg-opacity-*` / `text-opacity-*` / `border-opacity-*` / `divide-opacity-*` の使用箇所
   - カスタムテーマトークンの参照箇所（CSS 変数）
   - PostCSS / Vite 設定ファイル
2. **branch `feat/tailwind-v4-migration` で実証**:
   - `tailwindcss@^4.2.4` 導入
   - `@tailwindcss/postcss` または `@tailwindcss/vite` を採用
   - `tailwind.config.{js,ts}` を v4 互換に整理 or `@theme` directive へ移行
   - `autoprefixer` を deps から削除
   - 影響箇所の utility 書き換え
3. **検証**:
   - `pnpm build` 後の `dist/assets/` の CSS サイズ比較（v3 vs v4）
   - 4 テーマ（light / dark / sepia / contrast）すべてで Storybook 目視
   - 主要 28 画面のスポットチェック
   - design-tokens 連携の崩れがないか確認
4. **Dependabot PR #98 を close** し、新 PR で取り込む

### Vue 側との整合
- 本番 Vue/Nuxt 側でも Tailwind v4 + PrimeVue Unstyled が推奨スタック
- Matlens 側で先に v4 移行を済ませておけば、`@matlens/tokens`（`@theme` 形式の CSS variables）が Vue 側にもそのまま import 可能になる
- リプレイスシナリオ（ADR-0018）採用時の作業量が縮減

## Consequences

### 良い点
- v4 の高速ビルド + 改善された開発体験を享受
- 本番 Vue/Nuxt 側との Tailwind バージョン整合
- `@matlens/tokens` パッケージ化（Phase 0）の前提が整う
- `bg-opacity-*` 等の deprecated パターンを根絶

### 痛い点
- 影響箇所の utility 書き換えが必要（`bg-black/50` 等）
- `tailwind.config` の構造移行コスト
- Storybook 4 テーマでの目視確認工数（半日想定）

### 中立
- Dependabot PR #98 は close（Dependabot は新 PR を再生成しなくなる）

## 代替案（不採用）

### A: PR #98 をそのままマージ
- v3 互換モードでビルドは通るが、サイレント壊れリスクが残る
- `autoprefixer` の冗長性も解消されない
- 移行作業を「やった気になる」だけで実態は v3 のまま動作する

### B: Tailwind v3 を据え置き
- v4 の改善を逃す
- 本番 Vue/Nuxt 側との不整合
- `@matlens/tokens` パッケージ化時に v3/v4 二重管理が発生

### C: Tailwind 自体を捨てる（PrimeVue/MUI 等のテーマシステムへ）
- 移行コスト最大、現状の design-tokens との非互換
- Matlens の 28 画面の class 書き換えが必要
- 採用に値する根拠なし

## 検証

- `pnpm build` の dist サイズ比較で v4 が同等以下
- Storybook 4 テーマでの目視で視認性に変化なし（または改善）
- 855 tests pass を維持
- design-tokens 連携の `tokens.json` が v4 環境でも生成可能

## 関連
- PR #98（Dependabot 自動生成、本 ADR 採用後に close）
- Issue #115（本 ADR 起票元）
- Issue #108（Phase 0 抽出と一体化）
- Memory: `onsite_readiness_brief_2026_05.md`（Tailwind v4 + PrimeVue Unstyled 推奨）
