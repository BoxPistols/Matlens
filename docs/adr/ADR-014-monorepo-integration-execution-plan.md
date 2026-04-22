# ADR-014: monorepo 統合の実行計画

- ステータス: **Accepted**（2026-04-23 peer 側 owner 承認、両 repo 同時合意）
- 日付: 2026-04-23（初版 Proposed → 同日 Accepted 昇格）
- 関連 ADR: ADR-012（戦略）/ ADR-013（運用規約）
- 関連 peer / repo: `BoxPistols/machining-fundamentals/docs/adr/ADR-COM-014-monorepo-integration-execution-plan.md`（peer 側コピー、263 行完全一致）

## 改訂履歴

| バージョン | 日付 | 変更点 |
|---|---|---|
| 初版 Proposed | 2026-04-23 | 判断点 4 件の決定、monorepo ディレクトリ構造、Phase 4-A 〜 4-E 移行スケジュール、Rollback 計画を起票 |
| Accepted 昇格 | 2026-04-23 | peer 側 owner が ALL OK 承認、ADR-COM-014 として peer repo にコピー配置済。両 repo 同時昇格 |

---

## 背景

ADR-012 で親密化レベル 3 を目標とし、Phase 4 として monorepo 統合を掲げた。
ADR-013 で URL / 用語 / 更新ポリシーを明文化した。

peer 側 `docs/monorepo-decisions.md` で判断点 4 件の推奨方針が出たので、
Matlens 側が合意を形成し、**実行可能な計画** として本 ADR に固定する。

「戦略 → 運用規約 → 実行計画」の三層目に相当。

---

## 判断点 4 件の決定

peer 推奨方針に Matlens 側の微調整を加えた最終版。

### 判断 1: ADR 再採番 — **プレフィックス分離（段階的移行）**

- `ADR-MAT-*` — Matlens 固有
- `ADR-LRN-*` — learning（machining-fundamentals）固有
- `ADR-COM-*` — 共通パッケージ / 統合ルール

**移行方針**:
- monorepo 統合時点までは現名称（ADR-001〜014）を維持
- 統合時に一括改名し、旧名 → 新名のリダイレクトテーブルを `docs/adr/README.md` に掲載
- 履歴保持のため旧ファイルは残す（`@deprecated` マーカー付き）

**Matlens 既存 ADR の移行マッピング案**（統合時に適用）:

| 現名 | 移行後 | 備考 |
|---|---|---|
| ADR-001 レイヤードアーキテクチャ | ADR-MAT-001 | Matlens 固有 |
| ADR-002 切削ドメイン分離 | ADR-MAT-002 | Matlens 固有 |
| ADR-003 決定論的 fixture | ADR-MAT-003 | Matlens 固有 |
| ADR-004 Markdown レンダラ自前実装 | ADR-COM-001 | 両 app で使う可能性 → 共通化 |
| ADR-005 SLD 段階実装 | ADR-MAT-005 | 実装は Matlens 主、数学は @mc/math-cutting |
| ADR-006 試験片トラッカー二重ビュー | ADR-MAT-006 | Matlens 業務固有 |
| ADR-007 連動更新ルール | ADR-COM-002 | 両 app 共通 |
| ADR-008 JST 正規化 | ADR-COM-003 | 両 app 共通（時刻扱い） |
| ADR-009 純 SVG 可視化 | ADR-COM-004 | @mc/viz-svg / @mc/viz-concept 共通 |
| ADR-010 Stage 2 集計境界 | ADR-MAT-010 | Matlens 業務固有 |
| ADR-011 テスト戦略 | ADR-COM-005 | monorepo 共通 |
| ADR-012 親密化戦略 | ADR-COM-012 | 統合ルール |
| ADR-013 URL Contract | ADR-COM-013 | 統合ルール |
| ADR-014 統合実行計画 | ADR-COM-014 | 統合ルール |
| ADR-0001..0007（インフラ英語） | ADR-COM-101..107 | Vercel / Upstash 等は両 app で使う |

### 判断 2: デザイントークン — **ベース共通 + 業務別拡張**

```
packages/@mc/ui-tokens-base/
  ├─ light.css       # 共通（両 app で使う）
  ├─ dark.css        # 共通
  └─ index.ts        # CSS variable 型定義

packages/@mc/ui-tokens-matlens/
  ├─ eng.css         # Matlens 専用追加テーマ
  ├─ cae.css         # Matlens 専用追加テーマ
  └─ index.ts
```

**ルール**:
- `--accent` / `--bg-surface` / `--text-hi` など基本 variable は base で定義
- Matlens 固有の semantic token（`--test-in-progress`, `--damage-high-severity` 等）は
  matlens 側で追加
- learning 側は base のみを import し、light / dark の 2 テーマで完結

### 判断 3: ライセンス — **SPDX パッケージ別**

```
apps/matlens/           → MIT
apps/learning/          → MIT + CC BY 4.0 (dual)
apps/docs-site/         → CC BY 4.0 (docs body) + MIT (code)
packages/@mc/glossary/  → MIT (code) + CC BY 4.0 (用語定義テキスト)
packages/@mc/math-cutting/ → MIT
packages/@mc/standards/ → MIT（規格番号とメタのみ、全文なし）
packages/@mc/cutting-params/ → MIT
packages/@mc/exercises/ → MIT
packages/@mc/ai-prompts/ → MIT
packages/@mc/rag-knowledge/ → 混合（ソース次第、各 chunk にライセンス属性）
packages/@mc/viz-svg/    → MIT
packages/@mc/viz-concept/ → MIT + CC BY 4.0 (教育図解)
packages/@mc/ui-tokens-base/ → MIT
packages/@mc/ui-tokens-matlens/ → MIT
```

**実装**:
- 各 `package.json` に `"license": "<SPDX-id>"` 明記
- `/licenses/` ディレクトリに LICENSE ファイル集約
- デュアルライセンスパッケージは `LICENSE-MIT` + `LICENSE-CC-BY-4.0` 両方配置

### 判断 4: npm 公開範囲 — **4 package の段階的 public**

**初期（GitHub Packages private）**:
- 全 packages を GitHub Packages private でリリースフロー確認

**Phase 1（monorepo 統合直後、2 ヶ月程度）**:
- すべて private 維持、apps 内部でのみ使用

**Phase 2（安定後、npm public 化候補）**:
1. `@mc/glossary` — 用語データ、金属加工教育分野で広く使える
2. `@mc/math-cutting` — Taylor / Kienzle / SLD 計算、学術利用価値
3. `@mc/standards` — 規格定数、研究室で直接使える
4. `@mc/viz-svg` — 純 SVG チャート、chart ライブラリ代替

**npm 公開しないもの**:
- `@mc/exercises`, `@mc/ai-prompts`, `@mc/rag-knowledge` — 特定ドメインに密結合
- `@mc/viz-concept` — 教育図解で learning 固有
- `@mc/ui-tokens-*` — 両 app 固有

---

## monorepo ディレクトリ構造（確定版）

```
mc-monorepo/
├── apps/
│   ├── matlens/              # Matlens（材料試験 + 切削プロセス）
│   ├── learning/             # machining-fundamentals（教育）
│   └── docs-site/            # 統合ドキュメントサイト（Docusaurus 候補）
│
├── packages/
│   ├── @mc/glossary/
│   ├── @mc/math-cutting/
│   ├── @mc/standards/
│   ├── @mc/cutting-params/
│   ├── @mc/exercises/
│   ├── @mc/ai-prompts/
│   ├── @mc/rag-knowledge/
│   ├── @mc/viz-svg/
│   ├── @mc/viz-concept/
│   ├── @mc/ui-tokens-base/
│   ├── @mc/ui-tokens-matlens/
│   ├── @mc/shared-types/
│   └── @mc/link-checker/     # ADR-013 で合意した dead link チェック script
│
├── docs/
│   ├── adr/                  # ADR-COM-*, MAT-*, LRN-* 統合
│   ├── research/             # Matlens docs/research 移管（10 本）
│   ├── onsite/               # Matlens onsite kit（内容次第で public 化判断）
│   └── integration-points.md # 親密化の契約書（ADR-013 と併設）
│
├── scripts/
│   ├── verify-learn-more-links.mjs
│   └── generate-glossary-index.mjs
│
├── licenses/
│   ├── LICENSE-MIT
│   └── LICENSE-CC-BY-4.0
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 移行スケジュール

### Phase 4-A: 準備（現在〜2026-06）
- [x] ADR-012 / ADR-013 / ADR-014 の 3 ADR（戦略・規約・計画）を両 repo で固定化
- [x] URL Contract / integration-points.md の配置
- [ ] peer 側 repo に ADR-014 相当のコピー配置
- [ ] 移行シミュレーション（ローカルで dry-run、実マージなし）

### Phase 4-B: 最小統合（2026-06〜07）
- [ ] 新 monorepo repo 作成（`BoxPistols/mc-monorepo` 仮）
- [ ] 既存 Matlens / machining-fundamentals を **git subtree merge** で取り込み
  （履歴保持重視）
- [ ] `packages/@mc/math-cutting` 切り出し（Matlens の `src/features/cutting/utils/` から）
- [ ] `packages/@mc/glossary` 切り出し（peer 側の用語 + Pack 2 用語集）
- [ ] Turborepo + pnpm workspace 設定

### Phase 4-C: UI 共通化（2026-07〜08）
- [ ] `packages/@mc/viz-svg` 切り出し（ADR-009 実装を移植）
- [ ] `packages/@mc/ui-tokens-base` / `ui-tokens-matlens` 分離
- [ ] 両 apps が packages を import する形へ置換

### Phase 4-D: AI 機能統合（2026-08〜09）
- [ ] `packages/@mc/ai-prompts` / `rag-knowledge` 構築
- [ ] 両 apps で同じ Chat AI を使えるように

### Phase 4-E: 完成・公開（2026-09〜）
- [ ] ADR 再採番を一括実施
- [ ] npm public 化（4 package）
- [ ] 旧 repo は archived に

---

## Breaking Change 予告一覧

monorepo 統合までに Matlens 側で発生する可能性のある破壊的変更:

| 変更 | 影響 | Phase | 予告期間 |
|---|---|---|---|
| ADR 再採番（ADR-MAT-* へ） | 内部参照 / URL | 4-E | 2 週間以上 |
| デザイントークンの semantic 名変更 | Matlens 4 テーマ CSS | 4-C | 1 週間以上 |
| `src/features/cutting/utils/` の import パス変更 | `@mc/math-cutting` 化 | 4-B | 1 週間以上 |
| Repository 型の packages 化 | `@mc/shared-types` 化 | 4-B | 1 週間以上 |

すべて ADR-013 の Update Policy に従い、両 repo に同時 issue を立てて予告する。

---

## リスクと rollback 計画

### リスク

| リスク | 緩和策 |
|---|---|
| monorepo 化で Matlens の開発速度が一時低下 | Phase ごとに短期で区切り、各 Phase 完了時にベンチマーク（ビルド時間 / テスト時間 / PR マージ速度） |
| git 履歴の断絶 | `git subtree merge` で履歴保持、`--rejoin` を使わない |
| peer 側の Part A-C 執筆と干渉 | Phase 4-B 開始前に peer 側の大型執筆完了を確認 |
| npm public 化時の名前衝突 | `@mc/*` scope で予約、scope 取得を早期に実施 |
| 既存のデプロイ URL が変わる | Vercel 側で alias 維持、両 URL を cutover 期間中は並行運用 |

### Rollback 計画

Phase 4-B 完了時点で不具合があれば:
1. 既存 Matlens / machining-fundamentals の main は維持（削除しない）
2. 新 monorepo は実験ブランチとして扱い、main にマージしない
3. 各 Phase の完了ベンチマークが目標値を下回ったら Rollback 判断
4. Rollback 時は既存 repo を primary に戻し、packages は GitHub Packages private 状態で温存

### 完全断念の判断基準

以下すべてに該当したら monorepo 化を断念し、別 repo 運用を継続:
- Phase 4-C 時点で CI 時間が統合前より 3 倍以上
- 両 apps の個別デプロイができなくなる（Vercel の制約等）
- 3 ヶ月経過しても Phase 4-D に到達しない

---

## 実装チェックリスト（Phase 4-A）

### Matlens 側
- [ ] 本 ADR-014 merge（本 PR）
- [ ] peer 側 `docs/monorepo-decisions.md` との整合を cross-check
- [ ] ADR 再採番マッピング表を README で周知
- [ ] `src/features/cutting/utils/` に「将来 `@mc/math-cutting` として切り出し予定」コメント追加

### peer 側（依頼）
- [ ] 本 ADR のコピー配置
- [ ] `docs/monorepo-decisions.md` を本 ADR の決定内容と整合
- [ ] Part A / B / C の執筆完了見込みを共有（Phase 4-B 開始タイミングの判断に必要）

---

## 関連

- ADR-012（親密化戦略）
- ADR-013（URL Contract / Terminology Ownership）
- peer `BoxPistols/machining-fundamentals/docs/monorepo-decisions.md`（判断点 4 件の peer 側推奨方針）
- `integration-points.md`（両 repo ルートの契約書）
