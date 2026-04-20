# ADR-009: 可視化は純 SVG + 依存ゼロ（chart ライブラリ不採用）

- ステータス: Accepted
- 日付: 2026-04-18
- 関連 issue / PR: #18 (Petri net), #22 / #30 (Bayes GP), #48 (Stability Lobe), #66 / #67

## 背景

Matlens は次の可視化を必要とする。

- ペトリネット（PR #18）
- ガウス過程回帰 1D/2D（PR #22, #30）
- Vc × f 散布図（切削条件エクスプローラ）
- Stability Lobe Diagram（SLD）
- VB 摩耗進展チャート（Taylor 予測付き）
- FFT スペクトル / 波形時間領域
- KPI ミニチャート

一般的には Recharts / ECharts / Chart.js / D3 / Plotly / Visx など chart 系 OSS を
使うが、いずれも次のトレードオフを持つ。

- **バンドルサイズ**: Recharts ≈ 100 kB、ECharts ≈ 300 kB、Plotly ≈ 1 MB+（圧縮後）
- **カスタマイズ性**: 独自表現（ペトリネット、SLD、phase lag）は結局プラグインや
  裏 API を叩く必要があり、ライブラリの恩恵が薄い
- **テーマ統合**: 4 テーマ（light/dark/chlorine/matlens）に追従させるには CSS 変数注入が必要で、
  chart ライブラリ側が CSS 変数をフルサポートしていないケースが多い
- **型安全**: 純 TS 実装なら入力型が Matlens ドメイン型のまま使える

## 決定

**全ての可視化を純 SVG で自前実装する**。chart ライブラリは採用しない。

### 原則

1. 出力は JSX の `<svg>` 配下の要素ツリー
2. 色・フォント・線幅は **CSS カスタムプロパティ経由**（テーマ切替で追従）
3. 軸・目盛・凡例は共通コンポーネント化（`AxisX`, `AxisY`, `Legend`）
4. データスケーリング（linear / log）は純関数で分離
5. アニメーションは CSS `transition` / SMIL を最小限に使用
6. 印刷・SVG ダウンロードを第一級で扱う（chart ライブラリは SVG 取得が面倒な場合あり）

### スコープ外

- 大規模データ（10⁵ 点以上）のインタラクティブ描画 → 必要になったら個別検討
- 3D 可視化（Crystal3DPage は Three.js で例外的に実装済み）

## 代替案と棄却理由

| 案 | 棄却理由 |
|---|---|
| Recharts | バンドル大、SLD・ペトリネットのような独自表現には向かない |
| ECharts | 更に大。Matlens の 4 テーマに追従させる工数が純 SVG と大差ない |
| D3 | 低レベル API で柔軟だが、React との統合に追加層が必要。純 SVG で十分 |
| Visx | React 親和性は高いが +30〜50 kB。カスタム描画では結局 SVG プリミティブを使う |
| Canvas ベース | パン・ズーム不要な現要件では SVG の利点（セレクタ、CSS、a11y）が上回る |

## 実装ポイント

- 共通ユーティリティ:
  - `src/components/chart/axis.ts` — 軸レイアウト計算
  - `src/components/chart/scale.ts` — linear / log スケーラ
  - `src/components/chart/tick.ts` — 目盛間隔の自動決定
- ペトリネット・SLD 等、ドメイン固有の可視化は
  `src/features/<domain>/components/` 配下に配置
- SVG ダウンロードは `serializeSvg(svgNode)` + Blob でワンクリック取得
- テストは描画結果の構造（`<circle cx="..." r="..."/>` 等）を RTL で検証

## 影響

### ポジティブ
- メインバンドルを 150 kB 台に維持（依存ゼロの威力）
- 4 テーマ追従が自然（CSS カスタムプロパティをそのまま使う）
- 型安全（ドメイン型が直接 props になる）
- a11y 対応が直接書ける（`role="img"` + `aria-label` / `<title>` + `<desc>`）
- 印刷・PDF 出力（Phase 4）で SVG がそのまま綺麗に出る

### ネガティブ
- 初期実装コストがやや高い（軸・目盛・凡例を自作）
- 共通化が甘いと、画面ごとに類似コードが増える
  → 共通コンポーネント化をレビューで継続的に指摘
- **巨大データの可視化（10⁵+ 点）は現状非対応** → 採用時に別途検討

## 将来の検討事項

- パン・ズームが必要な画面（例: 長期 FFT スペクトログラム）が出た場合、
  `d3-zoom` だけピンポイント導入 or 自前実装
- 大量点描画は Canvas ハイブリッド（背景 Canvas、前景 SVG）を検討
- SVG → PDF 変換時のフォント埋め込み要件（現状ブラウザ印刷に委ねる）
