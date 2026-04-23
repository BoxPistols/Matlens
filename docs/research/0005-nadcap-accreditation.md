# NADCAP（航空系試験所認定）メモ

**Status:** 学習用メモ (Draft)
**Date:** 2026-04-20
**Confidence:** 中 — 公開情報ベース、実認証取得状況はヒアリングで確認

---

## なぜ押さえるか

- 航空系の試験業務を受ける試験所に**事実上必須**の認定が **NADCAP**
- 海外大手 OEM（Boeing / Airbus / GE / P&W / Rolls-Royce 等）および国内大手の **調達基準に NADCAP 認定を要求**
- ISO 17025 が「試験所の能力一般」を認定するのに対し、NADCAP は **航空宇宙特有の工程・試験** を監査
- 日本のラボが海外 OEM の案件を取るには NADCAP を持っているか否かが効く

---

## 正式名称と組織

- **NADCAP**: National Aerospace and Defense Contractors Accreditation Program
- 運営: **PRI** (Performance Review Institute) — SAE International の下部組織
- 1990 年創設、現在 60+ 国で運用
- Task Group ごとに専門監査員が評価

---

## Task Group 一覧（主要）

| Task Group | 対象 | 基準文書 |
|---|---|---|
| **Materials Testing (MTL)** | 機械試験・金属組織・化学分析 | AC7101 シリーズ |
| **Heat Treating (HT)** | 熱処理 | AC7102 |
| **Nondestructive Testing (NDT)** | NDE（UT/RT/MT/PT/ET） | AC7114 |
| **Welding** | 溶接 | AC7110 |
| **Surface Enhancement** | ショットピーニング等 | AC7117 |
| **Chemical Processing** | 表面処理・メッキ | AC7108 |
| **Coatings** | コーティング | AC7109 |
| **Composites** | 複合材加工 | AC7118 |
| **Sealants** | シーラント | AC7120 |
| **Measurement & Inspection** | 計測・検査 | AC7130 |
| **Conventional Machining** | 機械加工（従来系） | AC7126 |
| **Non-Conventional Machining** | 非従来加工（EDM/ECM/レーザ）| AC7116 |
| **Elastomer Seals** | シール材 | AC7121 |

**受託試験事業で特に重要**: Materials Testing (MTL)、NDT、Measurement & Inspection

---

## AC7101 シリーズ（Materials Testing）の構造

| 文書 | 対象試験 |
|---|---|
| AC7101 | 全 MTL 共通の品質システム要求 |
| AC7101/1 | 機械試験（引張・圧縮・曲げ・硬度） |
| AC7101/2 | 金属組織（マクロ・ミクロ） |
| AC7101/3 | 化学分析（発光分光・ICP・LECO） |
| AC7101/4 | 高温機械試験（高温引張・クリープ） |
| AC7101/5 | 動的試験（疲労・衝撃） |
| AC7101/6 | 腐食試験 |

**監査チェックリスト**は PRI のサイトから登録制で取得可能。試験ごとに
「どの装置で、どの規格（ASTM E8 等）に従い、誰が検証したか」を
全件トレースする要求がある。

---

## ISO 17025 との関係

- **前提**: NADCAP は ISO 17025 認定を **追加の必須前提** とする（AC7101 冒頭で明記）
- 関係: ISO 17025（試験所能力の国際一般）+ NADCAP（航空宇宙追加要求）
- 二重認定を維持している国内ラボは少数（JAB + NADCAP 両方）

---

## 監査サイクル

- 初回認証: 約 6〜12 ヶ月の準備 + 現地監査（数日）+ 是正処置
- **維持監査**: 毎年 or 毎 2 年（Task Group による）
- **merit status**: 過去 2 回連続で不適合なしだと監査頻度を 2 年に延長可能
- 不適合レベルが重いと **サスペンド**（認証一時停止、調達停止のリスク）

---

## 現場で聞くこと

1. 「NADCAP Materials Testing の認定は取得していますか？」
2. 「認証を取得している Task Group とスコープを教えてください」
3. 「ISO 17025 と NADCAP の監査エビデンスを二重管理していますか？」
4. 「merit status 取得中の Task Group はありますか？」
5. 「調達元の OEM から NADCAP 必須要求を受ける案件の比率はどのくらい？」

---

## Matlens の示唆

- NADCAP 監査では **「試験ごとの全トレーサビリティ」**が要求される
  - 装置 ID → 校正履歴 → 試験片番号 → 試験方法（規格 + 版）→ 実施者 → 結果 → レポート
  - 既に Matlens は **Material / Specimen / Test / Standard / Report** の相互 ID 参照を持つ
  - 拡張余地: 装置 (`Instrument`) とその校正履歴 (`CalibrationRecord`) を型化する
- **試験方法の規格番号 + 版** を Test レコードに保持する必要（現状は Standard マスタと弱結合）
- 監査に備える **エクスポート**（監査員がオフラインで見られる PDF / MaiML）は Phase 4 候補

---

## 参照

- PRI / NADCAP 公式: https://p-r-i.org/nadcap/
- AC7101 シリーズ（会員登録制で取得）
- eAuditNet（監査システム）: https://www.eauditnet.com/
