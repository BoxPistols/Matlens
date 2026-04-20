# 特殊切削技術（MQL / クライオ / 超音波 / ハイブリッド）メモ

**Status:** 学習用メモ (Draft)
**Date:** 2026-04-20
**Confidence:** 中 — 公開情報ベース、現場での採用状況はヒアリングで確認

---

## なぜ押さえるか

- 航空エンジン材料（Ti-6Al-4V、Inconel 718、耐熱合金）の切削は
  **通常条件では経済性・品質が満たせない**
- そのため特殊切削技術が研究・実用の両方で活発
- 「知らない」と会話についていけず、提案の当たりどころが外れる

---

## 1. MQL（最少量潤滑）

### 1.1 何か

- **Minimum Quantity Lubrication**: 切削油を **エアに混ぜて霧状**で供給
- 供給量: 10〜100 mL/h（ウェット切削の 1/1000〜1/10000）
- 目的: 環境配慮（廃油削減）+ 摩擦低減

### 1.2 適用領域

- 転削（フライス・ドリル）: 広く普及
- 旋削: 比較的普及
- 5 軸同時制御: 工具姿勢変化で MQL ノズルが追従しないことがある
- 高精度研削: 部分的採用

### 1.3 効果と限界

- **熱伝達はウェットに劣る** → 高温切削（Inconel 718 等）では不十分な場合あり
- **切屑排出性が弱い** → 深穴加工で詰まる
- **ミスト飛散** → 作業環境対策（吸引装置）が必要
- 対策: **内部給油 MQL**（工具中心から刃先へ直送）、**クライオ併用 MQL**

### 1.4 Matlens への示唆

- `CuttingCondition.coolant` に `mql` / `mql_internal` / `dry` / `flood` / `cryo` 等の enum
- 切削条件エクスプローラで **冷却方式別の工具寿命比較**

---

## 2. クライオ切削（低温切削）

### 2.1 何か

- 冷却材に **液体窒素（LN₂, -196 ℃）** / **液化 CO₂（-78 ℃）** を使う
- 刃先 or ワーク表面に直接噴射 → 極低温化で熱軟化抑制

### 2.2 効果

- **Ti-6Al-4V**: 工具寿命 2〜3 倍、切削温度 50〜100 ℃低減、表層は圧縮残留応力
- **Inconel 718**: 白層抑制、工具寿命 2 倍程度
- **ステンレス**: MQL より熱伝達良好
- ワーク温度上昇を抑えて **寸法精度向上**（熱膨張差の縮小）

### 2.3 課題

- **設備投資**（LN₂ 貯蔵タンク / 供給配管 / 安全対策）
- **工具への急冷サーマルショック**（セラミクス工具は割れやすい）
- **ワーク表面の水滴結露** → 錆・寸法誤差
- **加工能率**（MRR）は必ずしも向上しない（切削抵抗は低下するが寿命重視）

### 2.4 業界動向

- 航空エンジン OEM（GE Aviation 等）が Ti / Inconel 加工で実用化
- 日本メーカは研究段階 + 一部実用化
- CO₂ は LN₂ より取扱容易（常温液化可）だが冷却能力は劣る

### 2.5 Matlens への示唆

- `CuttingCondition.coolant = 'cryo_ln2' / 'cryo_co2'` 対応
- 温度測定（0009 参照）とセットで扱う研究データを記録できる構造

---

## 3. 超音波振動切削（UAM / UVT）

### 3.1 何か

- **Ultrasonic Assisted Machining / Ultrasonic Vibration Turning**
- 工具に **20 〜 60 kHz の超音波振動**を重畳
- 振幅: 数 µm

### 3.2 モード

- **軸方向振動（送り方向）**: 旋削で主流
- **楕円振動**: より高度、切削抵抗 50% 以上低減の報告
- **トルク振動（刃先回転方向）**: 特殊旋削

### 3.3 効果

- 切削抵抗 30〜70% 低減
- **バリ抑制**、面粗さ向上
- 難削材（Ti 合金、超合金、セラミクス、ガラス）で効果大
- **工具寿命 2〜5 倍**の報告あり

### 3.4 課題

- **専用機 or 専用ホルダ**が必要（主軸に超音波振動子を内蔵）
- コスト高、適用できる加工が限定的
- 5 軸同時制御 + 超音波の統合機は少数

### 3.5 メーカ例

- **SAUER Ultrasonic**（DMG MORI 系）: 商用機
- **Sonotrode（超音波工具ホルダ）**: 後付け可能な一部製品
- **理化学研究所**: 楕円振動切削の研究拠点

### 3.6 Matlens への示唆

- `Tool.features` に `ultrasonicAssisted: boolean` + 振動条件
- 波形ビューアで **超音波周波数帯の成分**を表示する機能（FFT 高周波側の拡張）

---

## 4. ハイブリッド製造（DED + 切削 / LPBF + 切削）

### 4.1 何か

- **積層造形（Additive）+ 切削（Subtractive）** を 1 台の機械で交互に行う
- **DED + Milling**: 指向性エネルギー堆積（レーザ金属粉 or ワイヤ）を終え、切削で仕上げ
- **LPBF 後工程としての切削**: 別機だが連続するフロー

### 4.2 目的

- **補修（repair）**: 欠けた部位に盛って切削
- **複雑形状の製造**: 内部冷却通路を持つタービンブレード等
- **材料コスト削減**: 必要な部位だけ盛る
- **リードタイム短縮**: 鋳造・鍛造不要

### 4.3 機械メーカ

| メーカ | 製品 | 特徴 |
|---|---|---|
| **DMG MORI** | LASERTEC 65 DED hybrid | ヘッド交換で DED / milling |
| **Mazak** | INTEGREX i-400AM | DED ノズル + 5 軸ミル旋盤 |
| **松浦機械** | LUMEX Avance-25 | LPBF + 切削（パウダーベッド方式） |
| **Optomec** | LENS | DED 専用だがツール経路はハイブリッド思想 |

### 4.4 切削研究の論点

- 積層部は **凝固組織が通常鍛造品と異なる** → 被削性が変わる
- 層境界・気孔・積層方向が **工具寿命に影響**
- 積層 as-built vs HIP 後 vs 熱処理後で切削条件を変える必要

### 4.5 Matlens への示唆

- `Material.processHistory` に `additive` / `subtractive` / `hip` / `heatTreatment` のシーケンス
- 工具ライフトラッカーで **素材前処理別の寿命比較**

---

## 5. その他の特殊加工（概要のみ）

| 技術 | 原理 | 用途 |
|---|---|---|
| **EDM（放電加工）** | 放電で材料除去 | 超硬材、複雑形状 |
| **ECM（電解加工）** | 電気化学溶解 | タービンブレード冷却孔 |
| **レーザ加工** | レーザ照射 | 薄板切断、穴あけ、マーキング |
| **AWJ（アブレシブウォータージェット）** | 砥粒混合水噴射 | 大型板、熱影響層なし加工 |
| **クライオ + UAM** | 低温 + 超音波 | Ti 合金の極限切削条件 |

---

## 現場で聞くこと

1. 「MQL の社内採用状況と課題は何ですか？（内部給油 / 外部給油）」
2. 「クライオ切削の研究・実用化状況は？（LN₂ / CO₂）」
3. 「超音波振動切削の設備はお持ちですか？（SAUER / サードパーティ）」
4. 「ハイブリッド製造機（LASERTEC 等）の利用・検討状況は？」
5. 「積層造形品の切削加工条件は鍛造品と比べてどう変えていますか？」
6. 「EDM / ECM 等の非従来加工との使い分け基準は？」

---

## Matlens で先んじて設計できる項目

- [ ] `CuttingCondition.coolant` enum を拡張（mql / mql_internal / cryo_ln2 / cryo_co2 / dry / flood）
- [ ] `Tool.features` に `ultrasonicAssisted` / `internalCoolant` 等のブールフラグ
- [ ] `Material.processHistory`（素材の前処理履歴）を型化
- [ ] 切削条件エクスプローラのフィルタに **冷却方式**と**素材前処理**を追加

---

## 参照

- Sharma, V.S. et al. (2016). Cooling techniques for improved productivity in
  turning, *IJPR*.
- Shokrani, A. et al. (2012). Environmentally conscious machining of
  difficult-to-machine materials with regard to cutting fluids, *IJMTM*.
- Liu, J. et al. (2021). A review on ultrasonic vibration-assisted cutting,
  *JMP*.
- Merklein, M. et al. (2020). Hybrid additive manufacturing technologies –
  An analysis regarding potentials and applications, *CIRP Annals*.
- DMG MORI LASERTEC: https://en.dmgmori.com/
