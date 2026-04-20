# ADR-005: Stability Lobe Diagram の段階的実装（概念曲線 → 厳密化）

- ステータス: Accepted
- 日付: 2026-04-18
- 関連 issue / PR: #48, #66, #67

## 背景

切削条件エクスプローラの主要機能として、**Altintas 2012 の Stability Lobe Diagram (SLD)**
を表示したい。SLD は「回転数 vs 許容軸方向切込」の関係を示し、
びびり（regenerative chatter）の境界を視覚化する。

SLD の厳密実装には次の情報が必要:

1. 工作機械 + 工具の **Frequency Response Function (FRF)**
   （impact test での modal testing が必要）
2. 切削係数 Kc（材料 × 工具ジオメトリに依存、Kienzle 係数で近似可能）
3. 刃数・直径・工具姿勢

このうち **FRF は現場で impact test 設備を持っているかが不透明**。
ヒアリング前から FRF 前提の UI を作ると、現場で「impact test できません」と言われた瞬間に
機能が死ぬ。

## 決定

**2 段階で実装する**。

### Stage A（現状）: 概念的 SLD + approximateModalParams

- 単一 DOF の FRF を仮定（単一固有振動数 $f_n$ + 減衰比 $\zeta$ + 剛性 $k$）
- ユーザが「大まかな機械剛性ランク（剛性高 / 中 / 低）」を選ぶと
  `approximateModalParams(rank)` が典型値を返す
- Kc は Kienzle 係数集から材料選択で自動計算
- SLD は `computeStabilityLobes()` で数値計算し、純 SVG で描画
- **表示に "概念曲線（厳密な modal data ではありません）" のバッジを常時表示**

### Stage B（現場で impact test データが取れる / 顧客が既に持っている場合）

- FRF 実測値を CSV / JSON で取り込む UI を追加
- `frfSingleDOF()` の代わりに多 DOF 合成 FRF をサポート
- approximateModalParams は "推定用フォールバック" として残す

## 代替案と棄却理由

| 案 | 棄却理由 |
|---|---|
| 最初から厳密 SLD のみ実装 | 現場で impact test 文化がないと機能が死ぬ。導入ハードルが過大 |
| SLD を実装しない（数値のみ） | 切削プロセス研究者の「びびり予測を俯瞰したい」ニーズに応えられない |
| 外部ツール（CutPro 等）との連携のみ | 導入費が高く、顧客側のライセンス状況に依存 |

## 実装ポイント

- `src/features/cutting/utils/stabilityLobe.ts` に:
  - `frfSingleDOF(omega, fn, zeta, k)` — 単一 DOF FRF
  - `computeStabilityLobes(params, opts)` — Altintas 方程式で blim(n) の包絡線
  - `minBlimAtRpm(rpm, params)` — 現在条件のマージン判定用
  - `approximateModalParams(rank)` — 剛性ランク → $(f_n, \zeta, k)$ のマッピング
- 単位整合に注意:
  - Kc は N/mm²、FRF は m/N、blim は mm
  - 内部では SI (Kc_SI = Kc_N_mm2 × 10⁶, blim_m × 1000 → mm)
- 位相 $\psi = \arctan(\text{Re}/\text{Im})$、$\varepsilon = \pi - 2\psi$
  （Altintas 2012 式 3.38）
- SVG 描画は log スケールの回転数軸 + 線形の blim 軸

## 影響

### ポジティブ
- 現場で impact test 設備の有無に関わらず一次提案ができる
- 「概念曲線→実測取り込みで厳密化」という段階的導入ストーリーが語れる
- 切削プロセス研究者の **既存経験との整合性チェック** に使える
  （「この回転数帯でびびる経験と合ってる？」のダイアログが取れる）

### ネガティブ
- Stage A の出力は **設計値ではなく目安** であることを常に明示する必要がある
- Kc 値の精度がそのまま SLD 精度に直結する → Kienzle 係数集の更新責任
- 多 DOF 化した際に UI がどれだけ複雑化するかは未確定

## 将来の検討事項

- 5 軸加工・ボールエンドミル・姿勢依存 Kc の扱い（Stage C 候補）
- 工具個体（摩耗進行）による FRF 変化のモデル化
- 波形ビューアで取得した振動データから modal params を同定する逆解析 UI

## 参考文献

- Altintas, Y. (2012). *Manufacturing Automation: Metal Cutting Mechanics,
  Machine Tool Vibrations, and CNC Design* (2nd ed.), Cambridge University Press
  — 特に Chapter 3 (Chatter) 式 3.38 / 3.39
