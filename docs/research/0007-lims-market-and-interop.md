# LIMS 市場と相互運用性メモ

**Status:** 学習用メモ (Draft)
**Date:** 2026-04-20
**Confidence:** 中 — 公開情報ベース、実際の導入状況・運用実態は顧客ヒアリングで確認

---

## なぜ押さえるか

- 既存ラボには **高確率で LIMS (Laboratory Information Management System) が存在**
- Matlens を「置換」と位置付けると導入ハードルが高い
  → 「**補完 / 連携レイヤ**」として刺さる余地が大きい
- 連携するには主要 LIMS の **API / 出力フォーマット / データモデル** を知っている必要

---

## LIMS / ELN / SDMS の区別

| 略称 | フルネーム | 役割 |
|---|---|---|
| **LIMS** | Laboratory Information Management System | 試験管理（サンプル受入〜結果〜レポート）|
| **ELN** | Electronic Laboratory Notebook | 実験ノート電子化（手順・観察・考察）|
| **SDMS** | Scientific Data Management System | 装置データの一元管理 |
| **LES** | Laboratory Execution System | 工程ガイダンス（手順強制）|

**Matlens** は現時点では LIMS の **サンプル / 試験 / レポート** 領域と重なり、
ELN 領域（手書きメモ的運用）も一部カバー。

---

## 主要 LIMS（公開情報ベース）

### グローバル大手

| 製品 | ベンダ | 強み | 弱み | Matlens 相性 |
|---|---|---|---|---|
| **LabWare LIMS** | LabWare 社（米） | 大規模 / 法規制対応 / カスタマイズ力 | UI 古い / カスタマイズ高コスト | 補完（UI 層） |
| **Matrix Gemini** | Autoscribe（英） | 中堅向け / 柔軟 | 物理試験は弱め | 補完 |
| **Sample Manager LIMS** | Thermo Fisher | 化学系強 / QC 向き | 機械試験弱め | 補完 |
| **STARLIMS** | Abbott Informatics | 規制対応 / ISO 17025 | エンタープライズ価格 | 補完 |
| **iLES / iStudy** | IDBS | バイオ・ライフサイエンス | 材料試験非対応 | 対象外 |

### 日本製 / 日本でよく使われる

| 製品 | ベンダ | 特徴 |
|---|---|---|
| **AAE Cube** | アステリア | 中小ラボ向け / 低価格 |
| **myLabManager** | 東亜ディーケーケー | 水質・環境系 |
| **社内開発 LIMS** | 自社 IT 部門 | 業務密着だが属人化 / 改修遅 |

### 切削プロセス系（LIMS ではなく専門ツール）

| 製品 | 用途 |
|---|---|
| **CutPro** (MAL) | Stability Lobe / 切削力解析 |
| **LabVIEW + NI Hardware** | 切削抵抗・振動データ取得 |
| **MATLAB** | 波形 FFT / 統計 |
| **hyperMILL / NX CAM** | CAM 軌跡生成 |

---

## データモデルの観察

どの LIMS も大枠は似ている:

```
Customer / Organization
   └─ Project / Request
         └─ Sample (or Specimen)
               └─ Test / Analysis
                     └─ Result (measurement + unit)
                           └─ Report
```

Matlens の Domain もほぼ同じ構造:

- `Project` ⇔ LIMS の Project / Request
- `Specimen` ⇔ LIMS の Sample
- `Test` ⇔ LIMS の Test / Analysis
- `Test.resultMetrics` ⇔ LIMS の Result
- `Report` ⇔ LIMS の Report

→ **補完 / 連携のしやすさ**の構造的根拠。Repository 層を REST 差替可能に
しているので、既存 LIMS をバックエンドにする構成も技術的に成立する。

---

## 連携パターン

### A. 片方向取り込み（LIMS → Matlens）

- LIMS の REST / SOAP / DB ビューで **試験結果を pull**
- Matlens は可視化・検索・俯瞰に特化
- 最も障壁が低い
- 既存 LIMS の IT チームに API 開放を依頼するだけ

### B. 双方向同期

- Matlens で入力したサンプル・試験を LIMS に push
- サンプルの state（受入 → 試験中 → 完了）を双方が追う
- **二重ソース問題**（どちらが master か）が常に発生
- ConflictResolution ポリシーが必要

### C. 連携層（Matlens = API Gateway）

- Matlens が LIMS / Excel / センサ装置の前面 UI
- 背後で LIMS / Excel / センサに fan-out
- 顧客の IT 部門が「置換」ではなく「追加」と認識しやすい

### D. 置換

- 既存 LIMS の契約終了・リプレース時
- データ移行 + 業務慣性の壁
- 通常は PoC 成果を持って段階置換に進む

---

## 試験機メーカの出力フォーマット

| メーカ | ソフト | 出力 |
|---|---|---|
| **Instron** | BlueHill Universal / Bluehill 3 | CSV, RAW, XML |
| **Zwick/Roell** | testXpert II / III | CSV, TDX |
| **MTS** | TestSuite | CSV, TDMS (NI) |
| **島津** | TrapeziumX | CSV, TXT |
| **A&D** | STAR | CSV |
| **東京衡機** | TCD Graph | CSV |
| **Shimadzu 硬度計** | ハードウェア付属 | CSV, BMP（画像）|

連携層で扱うべき最頻フォーマット:
- CSV: 8〜9 割のケース
- TDMS (National Instruments): 波形データで必須
- XML: Bluehill Universal 系で一部

---

## MaiML (JIS K 0200:2024) の位置付け

- LIMS 出力の **変換ハブ**としての MaiML
- Matlens 経由で「LIMS → MaiML → 顧客提出」の経路が取れる
- LIMS ベンダが MaiML 直接出力に対応するかは現時点では限定的
  → 当面は Matlens が変換レイヤを担う価値

---

## 現場で聞くこと

1. 「現在使っている LIMS の製品名・バージョンは？」
2. 「LIMS の API 開放状況（REST / DB ビュー / 帳票 CSV）は？」
3. 「LIMS で困っている点（速度・検索性・画面デザイン）は？」
4. 「試験機ソフトからの取込は手入力？CSV？API？」
5. 「LIMS の保守契約・改修見積はどの規模？」
6. 「LIMS リプレースの検討はされていますか？」
7. 「部門ごとに異なる LIMS / Excel が並列稼働している状況は？」

---

## Matlens の立ち位置候補

| 状況 | 立ち位置 |
|---|---|
| 大規模 LIMS があり運用成熟 | **補完 / 連携**（UI 層 + 俯瞰 + MaiML 変換）|
| 社内 LIMS の改修遅延 | **段階置換**（1〜2 年で部分リプレース）|
| LIMS が切削プロセス系に弱い | **新領域追加**（切削 Matlens + 既存 LIMS 補助）|
| 部門 Excel 運用 | **統合**（横断検索 + レポート共通化）|

---

## 参照

- LabWare: https://www.labware.com/
- Autoscribe Matrix Gemini: https://www.autoscribeinformatics.com/
- Thermo Fisher SampleManager: https://www.thermofisher.com/
- MaiML: https://www.maiml.org/
- AnIML（Analytical Information Markup Language、化学系で先行）: https://animl.org/
