# ADR-0018: 本番アプリの Vue/Nuxt → React/Next 早期リプレイス計画

- Status: Proposed
- Date: 2026-05-03
- 関連: Issue #107 (本 ADR 起票元), Issue #108 (Phase 0 抽出), Issue #109 (現場入りキット), Issue #113 (説得材料収集)

## Context

Matlens は kickoff 用 PoC で React + Vite。現場の本番アプリは別リポジトリで Vue/Nuxt スタート済み。
チームは全員フルスタックだがバックエンド主体で、フロントエンドおよび UI/UX 設計は a.ito が
リードする見込み。本番開発は始まったばかりで、**今が技術選定のリプレイスコスト最小タイミング**。

### 重要な前提シフト（誤認しやすい）

- **2025-07 に Vercel が NuxtLabs を買収**。Nuxt と Next.js は同じ親会社配下となり、
  「Vue は周縁エコシステム」という古い認知は事実誤認
- → 「React に行くから安全」を判断軸にしない。タイミング × チームスキル × 既存資産 × AI 連携で押す

### 早期リプレイスを支持する根拠

| 軸 | 根拠 |
|---|---|
| **タイミング** | 本番開発が始まったばかり = Vue コードベース最小 = 移行コストが底値。1 ヶ月遅れごとに既存コード量が指数増、提案通過確率が下がる |
| **既存資産** | Matlens PoC（React + Vite）の 28 画面 + 純 TS ロジック + デザイントークン + ADR がそのまま土台。**ゼロ起点ではない** |
| **a.ito 生産性** | React/Next で 1.5-2x のスループット |
| **AI 連携** | 10-12 月の AI SDK v6 + AI Gateway は Next.js 一級市民。Vue 版（`@ai-sdk/vue`）も存在するが参考実装の厚みが桁違い |
| **採用市場** | 北米基準で React 求人優位（補助材料、決め手ではない） |

## Decision

### 採用方針
1. **6/30 までに本 ADR を Accepted に格上げ**することを目標とする
2. **5/18 着任 1 週目（5/18-5/24）に Issue #113 で説得材料を実測**:
   - 既存 Vue コードの行数 / 画面数 / E2E カバレッジ
   - チームの React 実務経験（Git 履歴ベース）
   - Matlens PoC からの移植可能資産率
3. **5/25-5/31 で本 ADR を草稿 → 数値根拠で更新**
4. **6/1-6/14 で意思決定者向けプレゼン + Phase 0 並行着手（採用前提）**
5. **6/15-6/30 で ADR レビュー → Accepted / Rejected 判定**

### 移行戦略の優先順序
1. **ページ単位の置換**（推奨ベースライン）: `/v2/*` だけ Next、リバースプロキシ分割
2. **Web Components ブリッジ**: 表示部品を `defineCustomElement` で提供。React 19 が Custom Elements property 自動判別を改善済
3. **single-spa / qiankun**: 30 画面では過剰、組織分割が物理的に必要なときだけ
4. **iframe**: 最終手段

### 推奨スタック
- **Next.js 15 (App Router) + React 19**
- **状態管理**: Zustand or TanStack Query のサーバ状態 + URL state を主軸（Redux は使わない）
- **UI**: shadcn/ui + Radix UI + Tailwind v4（Matlens の延長で完全互換）
- **テスト**: Vitest 4 + React Testing Library + Playwright + Storybook 9
- **i18n**: next-intl（型生成 + middleware ロケール検出）
- **フォーム**: React Hook Form + Zod (`@hookform/resolvers`)
- **AI**: AI SDK v6 + AI Gateway（Next 一級市民）

### 失敗パターン（避ける）
- 「BE は React を読めるはず」幻想 → 1 週間ペアプロで実測
- 段階移行が永久に終わらない → **強制カットオーバー日**を最初に引く
- どちらにも振り切らない（最悪パターン）
- Vercel ロックイン軽視（ITAR 案件はセルフホスト検証）

## Consequences

### 採用時（pros）
- 5/18 から 6/30 までに方針確定 → 7 月から実装フェーズに集中可能
- Matlens の 28 画面 + framework-agnostic 資産（domain/ tokens/ services/）がそのまま土台
- AI SDK v6 連携が一級市民でストリーミング UI の参考実装が桁違いに豊富
- a.ito の生産性最大化

### 採用時（cons）
- 既存 Vue コードの破棄コスト（ただし「タイミング」根拠でこれが最小値）
- BE 主体チームの React 学習コスト（ペアプロで実証）
- 政治的合意形成コスト（数値ベース提案で軽減）

### Rejected 時（フォールバック）
- Phase 0 抽出（#108）は Vue 継続でも 100% 価値が残る
- 推奨スタックは Nuxt 4 + Pinia 3 + PrimeVue Unstyled に切替
- ハーネス整備（#111）を Vue 版で実施
- AI エージェント（#112）は `@ai-sdk/vue` で実装
- リプレイス提案は「将来の選択肢」として ADR に残し、再提案の余地を残す

## Matlens A ランク資産の実測 SLOC（2026-05-15 計測）

`pnpm verify:agnostic` で計測した **そのまま流用可能な純 TS / data 資産**。
React / Vue いずれを選んでも UI レイヤーだけ書き換えれば再利用できる領域。

| モジュール | SLOC | 内容 |
|---|---:|---|
| `src/services/` | 2,458 | MaiML / nlQueryCompile / bayesianOpt / empiricalFormulas 等 純 TS |
| `src/infra/repositories/mock/` | 1,029 | InMemoryTable / フィルタ / 純 TS Repository 実装 |
| `src/features/tests/matrix/` | 1,007 | 異常率 / 顧客集計の純関数 |
| `src/domain/` | 856 | 型 / Zod schema / 定数 |
| `src/features/cutting/utils/` | 792 | FFT / Stability Lobe / Kienzle / Taylor 経験式 |
| `design-tokens/src/` | 412 | CSS 変数 + Tailwind tokens（v4 移行先 / Vue でも流用可） |
| `src/features/dashboard/utils/` | 345 | KPI 集計の純関数 |
| `src/infra/repositories/interfaces/` | 334 | Repository 抽象（DI 境界） |
| `src/features/tools/utils/` | 63 | 工具摩耗ステータス計算 |
| `src/shared/utils/` | 51 | 汎用ユーティリティ |
| **合計 (A ランク)** | **7,347** | テスト / Storybook 除く実装行数 |

### この数値が説得力を持つ理由

- **30-50 画面規模の新規 React/Next アプリ想定 SLOC を 20-30k 行**とすると、Matlens A ランク資産で **約 25-35% を即座に充足**できる
- 「ゼロ起点ではない」の定量的裏付けとして ADR レビューに使用
- 反対派の典型反論「移行コストが見えない」に対し「**UI 層 (Vue から書き直す層) のみ**」と境界が明示できる
- Issue #113 のタスク 3 (Matlens 移植可能資産マッピング) は本セクションで充足済

### 同時に確認した境界制約

- `pnpm verify:agnostic` で domain / infra/interfaces / services から React / Vue / TanStack Query import がゼロであることを確認済 ✅
- ESLint `no-restricted-imports` でも error レベルで禁止済
- → 「うっかり Vue 専用 API が混入する」リスクは構造的に塞がっている

## 完全リライトのコスト感

業務系 SPA で 30-50 画面規模を完全リライトする場合:
- 中堅 2 名 × 4-6 ヶ月（中央値 6 ヶ月）。業務ヒアリング並行で 1.5 倍
- **E2E (Playwright) は 8 割再利用、ユニットは 0-2 割**
- 残る資産: OpenAPI 型 / Zod schema / Tailwind tokens / 純 TS ドメインロジック / 純 SVG / MaiML パーサ
- 失われる資産: Vue 専用 directive / template slot / Pinia reactivity / Nuxt SSR フェッチ

## 想定反論と切り返し

| 反論 | 切り返し |
|---|---|
| 「Vue でもう書き始めた」 | コミット履歴で実測。N 行未満なら破棄コスト 1-2 日。それ以上ならページ単位段階移行で吸収 |
| 「BE 主体に React は無理」 | Git 履歴で React 経験を実測。0 ならペアプロ 1 週間で実証。Matlens の 28 画面が学習教材 |
| 「Vue は十分モダン (NuxtLabs/Vercel 体制)」 | 事実として認める。**それでも** タイミング × 既存資産 × AI 連携で React を選ぶ |
| 「移行コストが見えない」 | Phase 0（2 週間）で domain/infra/tokens を切り出せば残コストは UI 層のみで限定 |
| 「政治的に重い」 | 5/18 着任 1 週目に「現状観察結果」として持ち込む。意思決定者の関与なしに既成事実化させない |

## 検証

- 5/18-5/24: Issue #113 で数値実測完了
- 5/31 までに ADR 草稿が数値根拠で埋まる
- 6/30 までに Accepted / Rejected が確定
- Accepted 時: 7/1 から Next で実装フェーズ開始
- Rejected 時: Phase 0 で抽出した framework-agnostic 資産を Vue 側で活用

## 代替案（不採用）

### A: Vue 継続を初期から決め打ち
- a.ito の生産性 + AI 連携 + 既存資産の優位を活かしきれない
- 「なぜ Vue か」の説明根拠が「既に始まっているから」のみで弱い

### B: 段階移行を最終的に永久化
- 失敗パターンとして明示済み。**強制カットオーバー日**を引かない限り選ばない

### C: 完全リライトを 7 月以降に決定
- 1 ヶ月遅れごとに既存 Vue コード量が増えて提案通過確率が下がる
- 「タイミング」根拠を放棄することになる

## 関連

- Issue #107（本 ADR の起票元）
- Issue #108（Phase 0 抽出 = どちらに転んでも価値が残る保険）
- Issue #109（5/18 現場入りキット）
- Issue #110（MaiML / Petri net / Excel UX 本番方針 = フレームワーク非依存）
- Issue #111（ハーネス整備、採否で方針分岐）
- Issue #112（AI エージェント UI、AI SDK v6 + Next 一級市民）
- Issue #113（リプレイス提案 説得材料収集 = 本 ADR の数値根拠）
- ADR-0017（Tailwind v4 移行 = Phase 0 と一体）
- Memory: `replacement_proposal_stance.md` / `onsite_readiness_brief_2026_05.md`
