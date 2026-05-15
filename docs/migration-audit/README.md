# 移行監査キット（5/18 着任直後に動かす）

Issue #113 (リプレイス提案の説得材料収集) のための計測テンプレ + 自動化スクリプト集。
5/18 着任後の最初の 1 週間 (5/18-5/24) で数値を埋め、5/25-5/31 で ADR-0018 草稿に反映する。

## 計測対象 3 タスク

| # | タスク | テンプレ | 自動化スクリプト | 実行場所 |
|---|---|---|---|---|
| 1 | 既存 Vue コードベース棚卸し | [`01-vue-codebase-template.md`](./01-vue-codebase-template.md) | [`scripts/audit-vue-codebase.sh`](./scripts/audit-vue-codebase.sh) | **本番 Vue リポ** で実行 |
| 2 | チーム React 経験実測 | [`02-team-experience-template.md`](./02-team-experience-template.md) | [`scripts/measure-team-experience.sh`](./scripts/measure-team-experience.sh) | 本番 Vue リポで実行 |
| 3 | Matlens A ランク資産マッピング | [`03-matlens-asset-mapping.md`](./03-matlens-asset-mapping.md) | `pnpm verify:agnostic` | **本リポ (Matlens)** で実行 |

タスク 3 は **本日 (2026-05-15) 完了済**。結果は ADR-0018 の「Matlens A ランク資産の実測 SLOC」セクションに反映済。

## 運用ルール

- **本ディレクトリは PUBLIC** (Matlens OSS 仮名化ルール遵守)
- 実測値に **顧客企業名 / 個人氏名 / 製品名** を入れない (`M社` `L社` `S社` `Y拠点` の仮名で書く)
- 機密データを含む実測結果は **社内別レポ (private)** に蓄積、本リポにはサマリ統計のみ

## 5/18-5/24 のスケジュール

| 日 | 作業 |
|---|---|
| 5/18 (月) | 本番 Vue リポへの読取アクセス取得 → `audit-vue-codebase.sh` 走らせる |
| 5/19 (火) | `measure-team-experience.sh` でチーム React/Vue commit 比率出す |
| 5/20-5/22 | 棚卸しシート埋め + 不明箇所のヒアリング (`docs/onsite/hearing-sheets.md`) |
| 5/23-5/24 | サマリ表作成 → ADR-0018 草稿の数値プレースホルダ更新 |

## 関連

- [Issue #107](https://github.com/BoxPistols/Matlens/issues/107) — リプレイス計画 ADR
- [Issue #113](https://github.com/BoxPistols/Matlens/issues/113) — 説得材料収集（本キットの起票元）
- [ADR-0018](../adr/0018-vue-to-react-replacement-proposal.md) — 本数値の最終受け皿
- [`docs/onsite/`](../onsite/) — 業務フロー + ヒアリングシート（ヒアリング側）
