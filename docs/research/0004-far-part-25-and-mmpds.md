# FAR Part 25 / MMPDS と材料データの統計要件メモ

**Status:** 学習用メモ (Draft)
**Date:** 2026-04-20
**Confidence:** 中 — 公開情報ベース、詳細はヒアリング・顧客指示書で確定

---

## なぜ押さえるか

- 航空機型式証明の根拠規則が **FAR (Federal Aviation Regulations) Part 25** — 民間輸送機のカテゴリ
- 日本でも「**JCAB** (国交省航空局) の型式証明」が FAR Part 25 に準拠する形で運用される
- エンジン側は **FAR Part 33**（Aircraft Engines）が対応するが、部品設計思想は近い
- Matlens 利用者（航空エンジン材料試験）が受ける「**この材料データは A basis / B basis ?**」という質問の出典が Part 25.613

---

## FAR Part 25.613 — 材料強度特性の要求

要点:

- 構造設計には **材料特性のばらつきを考慮した設計許容値** を使わねばならない
- ばらつきの扱いは **単一荷重経路 / 多重荷重経路** で区別される
  - **A-basis**: 99% の材料 で 95% 信頼区間 → 単一荷重経路（fail で構造喪失）部品に使用
  - **B-basis**: 90% の材料 で 95% 信頼区間 → 多重荷重経路部品に使用
  - **S-basis**: 仕様書上の保証最小値

## 統計的意味

| basis | 意味（ざっくり）|
|---|---|
| A-basis | 「この値を 100 本中 99 本は上回る」（信頼 95%）|
| B-basis | 「この値を 100 本中 90 本は上回る」（信頼 95%）|
| S-basis | 「規格でこの値以上を保証」 |

---

## MMPDS とは

- **Metallic Materials Properties Development and Standardization**
- 旧 MIL-HDBK-5（米軍ハンドブック）の後継
- FAA が認定する唯一の **航空機構造設計ハンドブック**
- Al / Ti / Ni / 鋼 の **A-basis / B-basis 値**を提示
- 毎年改訂（MMPDS-01 → MMPDS-17 以降…）

### 掲載項目（一例）

- 化学組成（AMS 仕様）
- 機械特性（引張強度・降伏点・伸び・E 係数）を **basis 値**で
- 疲労特性（S-N 曲線）
- クリープ特性
- 熱物性（線膨張率・熱伝導率）

---

## サンプル数の要求（抜粋）

- A-basis 値を出すのに必要な試験数は **統計的 tolerance limit** によって決まる
- 例: 正規分布を仮定した tolerance factor k₁₀₀（n, 0.99, 0.95）
  - n=30 → k ≈ 3.06（平均 − 3.06·σ が A-basis）
  - n=100 → k ≈ 2.68
  - n=299 → k ≈ 2.43（特別な計算要件がない限り MMPDS は n≥299 を推奨）
- **現実的には 1 合金 × 1 状態で 100 本単位の試験が必要**
- 受託試験では「A-basis 用サンプル試験」を依頼される場合、数ヶ月〜数年のプロジェクトになる

---

## 非金属材料の扱い（Composite Materials Handbook）

- CMH-17（旧 MIL-HDBK-17）が複合材料版の MMPDS 相当
- CFRP / GFRP の設計値を basis 値で提供
- layup（積層方向）依存性の扱いが金属と異なる
- **I 社グループ**のような航空系で CFRP を扱う場合はこちらも参照

---

## 日本の航空規制

- **航空法**（国交省）+ **耐空性審査要領** が国内の型式証明根拠
- 実態としては FAR Part 25 / 33 を参照する形が多い
- **JIS H 7700 系** が航空宇宙用チタン合金の日本規格（AMS 4928 相当）
- **JIS W 系** が航空機関連（JIS W 1101 アルミニウム系など）

---

## Matlens での示唆

- 受託試験で扱う統計値には **basis 値 / 平均値 / 規格値** の区別が重要
  - 現状の Matlens の Material は単一スカラー値（hv, ts 等）のみ
  - 将来拡張候補: **MaterialStatistic** 型（平均・標準偏差・A/B/S-basis・サンプル数・基準温度）
- A-basis 用案件は **数百本規模の試験片管理**を必要とする → Specimen Tracker のスケール要件
- 報告書には **試験片番号・試験日・装置校正履歴・データ除外の根拠（outlier removal）** を全件残す必要

---

## 現場で聞くこと

1. 「A-basis / B-basis データを出す案件の頻度はどのくらいですか？」
2. 「MMPDS にない新規材料の basis 値算出を依頼されたことはありますか？」
3. 「1 案件あたりの試験片数の分布は？（10 本 / 100 本 / 1000 本のどのクラス？）」
4. 「統計処理ツールは社内スクリプト？Excel？商用（Minitab 等）？」
5. 「outlier（外れ値）除外の社内ルールは明文化されていますか？」

---

## 参照

- FAR Part 25: https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-25
- MMPDS: https://www.mmpds.org/
- CMH-17: https://www.cmh17.org/
- JIS H 7700 系（JSA の検索）
- JCAB 耐空性審査要領
