# ADR-012: machining-fundamentals との親密化統合戦略

- ステータス: **Accepted**（2026-04-23 両 repo で合意、Phase 1 実装で実証済）
- 日付: 2026-04-23（初版 Proposed → 同日 Accepted 昇格）
- 関連 peer / PR: `~/dev/Asagiri/Metal/machining-fundamentals`（GitHub: BoxPistols/machining-fundamentals）
- 関連 ADR: ADR-001 / ADR-002 / ADR-005 / ADR-009 / ADR-013 / ADR-014

## 改訂履歴

| バージョン | 日付 | 変更点 |
|---|---|---|
| 初版 Proposed | 2026-04-23 | 親密化レベル 3 目標、相互リンク戦略 5 パターン、Phase 0〜4 の草稿 |
| Accepted 昇格 | 2026-04-23 | Phase 1 実装（PR #74）で 4 画面 learnMore が peer 配信の 24 anchor を実参照可能になったことで、戦略の技術的実証が完了。peer 側も同日同意。両 repo 同時昇格 |

---

## 背景

同一マシン上で並行開発している 2 つのプロジェクトがある。

| プロジェクト | 役割 | 性格 |
|---|---|---|
| **Matlens** | 材料試験 + 切削プロセス研究の業務 PoC UI | 実務 / 研究データ管理 / 業界固有 |
| **machining-fundamentals** | 金属加工の学習アプリ | 教育 / 一般化 / 公開前提 |

両者は **ドメインが深く重なる**:
- Matlens の `src/features/cutting/utils/` にある Taylor / Kienzle / Altintas SLD を
  machining-fundamentals が学習題材として使える
- machining-fundamentals が整備する 6 章分の材料科学基礎を
  Matlens のユーザーが「詳しく学ぶ」導線として参照できる
- 両者の用語集は高い重複を持つ
- AI Chat の知識ベース（RAG）は統合すると精度向上が見込める

ユーザーから次の方針が示された:

> 「machining-fundamentals の内容は、このアプリ（Matlens）のドキュメントツールに
>  なるくらい親密にしたい」

従来の「偶然ドメインが近い 2 つのアプリ」から一歩踏み込み、
machining-fundamentals を **Matlens の事実上の公式ドキュメント** として位置づける。

---

## 親密化レベルの定義

| レベル | 関係性 | 現時点 |
|---|---|---|
| **1. 並列** | 偶然ドメインが重なっているだけの独立プロジェクト | ここから脱する |
| **2. 共通基盤** | monorepo で packages を共有（`@mc/math-cutting` 等）、apps は独立 | 準備中 |
| **3. 相互参照で強結合** | 用語・画面・学習章が双方向リンク、AI / RAG / 検索を統合 | **本 ADR の目標** |
| **4. 完全統合** | 1 ドメインに 1 エクスペリエンス、学習 / 業務は UI モード切替 | 将来検討 |

---

## 決定

**レベル 3（相互参照で強結合）** を目標とし、Phase 0〜4 の段階的統合を行う。

### 相互リンク戦略 5 パターン

1. **用語集の双方向リンク**
   - Matlens の用語ツールチップ・バッジから machining-fundamentals の該当章 anchor へ
   - machining-fundamentals の用語定義から Matlens の該当画面へ
   - 実装: 共通化した `@mc/glossary` の各 entry に
     `learnChapter: string` と `matlensRoute: string` を持たせる

2. **Matlens PAGE_GUIDES の「詳しく学ぶ」導線**
   - 各画面のヘルプパネルに `learnMoreUrl` を追加
   - 例: 切削条件エクスプローラ → Part B ch03「切削条件の基礎」
   - 実装変更は `src/data/pageGuides.ts` 型拡張（ADR-007 連動更新）

3. **machining-fundamentals 章末に「Matlens で実例」カード**
   - 章の最後に Matlens の該当画面へのスクショ + 遷移ボタン
   - iframe 埋込 or 外部リンク（URL 安定性が前提）

4. **AI Chat / RAG の知識ベース統合**
   - 両 app の Chat AI は同じ RAG を参照
   - 出典表示で「これは machining-fundamentals Part B ch03」「これは Matlens docs/research/0008」を明示
   - 実装: `@mc/rag-knowledge` パッケージで embed を共有

5. **検索の横断**
   - 両 app の検索バーは共通コンポーネント
   - 結果タイプ: 用語 / 学習章 / Matlens 画面 / Matlens 規格マスタ
   - 実装: `@mc/search` パッケージ（MiniSearch ベース）

---

## 実装フェーズ

### Phase 0: 方針合意 + `integration-points.md` 作成
- 両 repo のルートに `integration-points.md` を配置
- 親密化のビジョン（レベル 3）を明文化
- URL 規約の合意
- どちらが master か（**用語は machining-fundamentals、実装は Matlens**）

### Phase 1: Matlens → machining-fundamentals の単方向リンク
- `src/data/pageGuides.ts` の型に `learnMoreUrl` / `learnMoreLabel` を追加
- 主要用語のツールチップに「詳しく学ぶ」リンクを追加
- machining-fundamentals 側の URL 規約を採用
- この段階で machining-fundamentals の変更は最小（URL の安定化のみ）

### Phase 2: machining-fundamentals → Matlens の双方向化
- 章末に「Matlens で実例を見る」カード
- 主要用語ページから Matlens 画面へ
- 両 repo の用語集を突合し差分を埋める

### Phase 3: RAG 統合 + 検索横断
- `@mc/rag-knowledge` に両者の章 / 画面 / 研究ノートを embed
- 検索コンポーネントを共通化

### Phase 4: monorepo 統合（決定次第）
- `apps/learning` と `apps/matlens` を 1 つの repo に
- packages: `@mc/glossary` `@mc/math-cutting` `@mc/standards` `@mc/cutting-params`
  `@mc/exercises` `@mc/ai-prompts` `@mc/rag-knowledge` `@mc/viz-svg`
  `@mc/ui-tokens` `@mc/shared-types`
- 相互リンクは相対パスで完結し URL が壊れない

---

## URL 規約（Phase 0 で合意予定）

### machining-fundamentals 側
- 永続 URL: `/<partX>/<chNN[-slug]>#<anchor>`
- 章構成変更でも anchor は変えない（破壊的変更は minor release 境界のみ）
- 例: `/partB/ch05-tool-wear#vb` / `/partA/ch03-crystal-structure#fcc`

### Matlens 側
- 画面ルート: `/#/<screen-id>[/<sub>]`
- 既存ルートは変えない（ADR-007 連動更新で差分を周知）
- 例: `/#/tools` / `/#/cutting-conditions` / `/#/std-master/iso-3685`

---

## 代替案と棄却理由

| 案 | 棄却理由 |
|---|---|
| **レベル 2 のままで十分**（packages 共通化のみ） | user 方針「ドキュメントツールになるくらい親密に」に合致しない。学習章と実画面が直結する体験は相互リンクなしでは実現できない |
| **Matlens 内に学習コンテンツを内包** | Matlens の機密性・業務 UX を壊す。学習者と業務ユーザーの期待値が異なる |
| **完全統合（レベル 4）を今すぐ目指す** | 両プロジェクトの成熟度・公開範囲・ライセンス（Matlens MIT 単独 / machining-fundamentals MIT + CC BY 4.0 デュアル）を揃えるコストが過大。段階的に進める方が安全 |
| **Matlens の docs/research/ に学習コンテンツを書き続ける** | docs/research/ は「現場入り準備用の学習ドラフト」スコープ。一般化された教育コンテンツは別プロジェクトの役割分担が明確な方が保守しやすい |

---

## 影響

### ポジティブ
- ユーザーが業務画面で「なぜこの計算式？」と思ったら即座に学習章へ飛べる
- 学習者が「実際の業務ツールではどう使う？」を体験できる
- 用語集・数学モジュール・可視化コンポーネントの重複開発が消える
- AI Chat の回答精度が両方の知識を参照することで向上
- ADR-002（切削ドメイン分離）や ADR-005（SLD 段階実装）の設計判断が教育コンテンツとして公開される → 設計判断が後世への資産になる

### ネガティブ
- URL 安定性の維持コスト（両 repo で破壊的変更に注意）
- 相互リンクの dead link 検知が運用課題
  → Phase 1 完了後に CI で両 app の URL を横断チェックする
- machining-fundamentals のコンテンツ更新が Matlens UX に影響するため、
  章追加・リネーム時の影響範囲が広がる
- ライセンス違い（Matlens MIT / machining-fundamentals MIT + CC BY 4.0）が混在し、
  各ファイルがどちらのライセンスに属するか明示する必要

### リスクと緩和策
| リスク | 緩和策 |
|---|---|
| machining-fundamentals の URL 変更で Matlens から大量に dead link 発生 | URL 規約を Phase 0 で合意、変更時は両 repo に issue 同時投下 |
| Matlens 業務ユーザーが学習寄り UI に誘導されすぎて混乱 | 「詳しく学ぶ」は optional な誘導に留め、業務フローの主導権は Matlens 側 |
| 両 repo のライセンス混在で機密情報漏洩 | 固有名詞や実案件情報は絶対に machining-fundamentals に含めない。Matlens の docs/onsite/ 相当を混ぜない |
| 統合作業で Matlens 本体の機能開発が止まる | Phase 1 の作業量を具体的にスコープ切り（PAGE_GUIDES 型変更 + 20 箇所程度のリンク追加） |

---

## 判断が必要なポイント（peer と user 合意待ち）

1. **Matlens 既存 ADR の扱い**
   - monorepo 統合時、ADR-001〜011 を再採番するか、そのまま引き継ぐか
   - 現時点の推奨: **そのまま引き継ぐ**（履歴保持のため）

2. **デザイントークン**
   - Matlens 4 テーマ（light / dark / eng / cae）を machining-fundamentals も使うか別々か
   - 現時点の推奨: **共通化**（`@mc/ui-tokens`）、machining-fundamentals 側で light / dark のみ有効化

3. **ライセンス**
   - monorepo での license.json 配置
   - 現時点の推奨: **packages は MIT、apps/docs は個別に判断**（apps/learning は MIT + CC BY 4.0 デュアル、apps/matlens は MIT 単独）

4. **パッケージ公開範囲**
   - `@mc/glossary` などを npm に公開するか、private monorepo に留めるか
   - 現時点の推奨: **統合後に決定**（まず private で成熟させる）

---

## 関連ドキュメント

- [ADR-001](./ADR-001-repository-and-layered-architecture.md) — レイヤードアーキテクチャ
- [ADR-002](./ADR-002-cutting-domain-separation.md) — 切削ドメイン分離
- [ADR-005](./ADR-005-stability-lobe-phased-implementation.md) — SLD 段階実装
- [ADR-007](./ADR-007-synchronized-doc-updates.md) — PAGE_GUIDES / announcements / README 連動更新
- [ADR-009](./ADR-009-pure-svg-zero-dependency-visualization.md) — 純 SVG 可視化
- `docs/research/` — Matlens のドメインリサーチ 10 本
- `~/Documents/matlens-onsite-prep/` — ローカル保管の現場入り準備キット（非公開）

---

## 次のアクション

1. 本 ADR を peer と user にレビューしてもらう
2. Phase 0 の `integration-points.md` を両 repo に配置
3. URL 規約を machining-fundamentals 側で確定してもらう
4. Matlens の PAGE_GUIDES 型拡張を実装 → Phase 1 着手
5. ステータスを **Proposed → Accepted** に更新するのは、上記 3 が完了した時点
