# 主要画面のラフワイヤー

5/18 着任のキックオフで「これが現状の Matlens、こう想像してます」と提示するための画面 PNG 集。
Storybook ではなく **本物の dev server で 20 画面を networkidle 待ちで full-page screenshot** する方式（実画面なのでヒアリングで「この列、要りますか？」と具体的に聞ける）。

## 生成手順

```sh
# 初回のみ Playwright の Chromium を入れる
pnpm exec playwright install chromium

# dev server 起動 + 全画面 screenshot（約 3-5 分）
pnpm capture:wireframes
```

出力先: `docs/onsite/wireframes/captures/<連番>-<画面名>.png`

`captures/` は `.gitignore` 対象（生成物・サイズ大・PR 都度差分が出るため）。
ヒアリング前に手元で再生成して持ち込む運用。

## 対象画面（20 ページ）

| # | 画面 | route | ヒアリング論点 |
|---|---|---|---|
| 01 | ダッシュボード | `#/dash` | 「最初の 30 秒で見たい情報は?」 |
| 02 | 材料データ一覧 | `#/list` | カラム / フィルタ / ソート優先度 |
| 03 | 材料データ詳細 | `#/detail_M-001` | 一覧 vs 詳細の情報粒度 |
| 04 | 新規登録フォーム | `#/new` | 必須項目 / 入力順 / バリデーション |
| 05 | 横断ベクトル検索 | `#/vsearch` | 検索キーワード起点を実演してもらう |
| 06 | RAG チャット | `#/rag` | エージェント介在余地 (Issue #112) |
| 07 | 類似事例検索 | `#/sim` | 過去事例引き出しパターン |
| 08 | 試験マトリクス | `#/matrix` | 材料 × 試験種別の経験有無俯瞰 |
| 09 | 試験片トラッカー | `#/specimens` | Kanban / Table 切替の必要性 |
| 10 | 運用ダッシュボード | `#/ops-dash` | 納期リスク早期警告の閾値 |
| 11 | 材料マスタ | `#/mat-master` | 既存 LIMS との重複範囲 |
| 12 | 規格マスタ | `#/std-master` | JIS / ASTM / ASME 等の優先順位 |
| 13 | レポート一覧 | `#/reports` | 提出形式 (PDF / MaiML / 別) |
| 14 | 工具ライフトラッカー | `#/tools` | 切削工程持ち込み時のみ |
| 15 | 切削条件エクスプローラ | `#/cutting-conditions` | 同上 |
| 16 | Petri net 可視化 | `#/petri` | 再加工ループ・廃棄判定 (flow 02/03 と接続) |
| 17 | ベイズ最適化 | `#/bayes` | 試験条件探索の高度化提案 |
| 18 | 経験式シミュレーション | `#/simulate` | 物理モデルへの抵抗感 / 受容 |
| 19 | 実験ダッシュボード | `#/experiment` | 研究員の typical 朝 |
| 20 | ヘルプ用語集 | `#/help` | ドメイン用語の認識合わせ |

## Figma / FigJam への取込

### A. SVG ベース（業務フロー図、`docs/onsite/flows/*.svg`）

1. Figma を開く → New File
2. SVG ファイルを **Finder からそのままドラッグ&ドロップ**
3. SVG は自動でレイヤー分解される（線・矩形・テキストを個別編集可）

### B. PNG ベース（本画面 screenshot、`captures/*.png`）

1. Figma で 1440 × 900 px のフレームを作成（dev server の viewport と一致）
2. PNG をドラッグ&ドロップ
3. フレーム上に Figma で **赤い矩形 / 矢印 / 注釈テキスト** を重ねて「ここを変えたい」を可視化
4. ヒアリングで現場の反応を新フレームに追記

### C. FigJam の Mermaid 直接埋込

FigJam（2024 以降）は sticky note で `/mermaid` コマンドが使える。
`docs/onsite/flows/*.mmd` のテキストをそのまま貼ると native ノードに展開される。
→ ヒアリング中に **その場でフロー編集**したい用途に最適。

## 関連

- [`../flows/`](../flows/) — 業務フロー Mermaid 5 本
- [`../hearing-sheets.md`](../hearing-sheets.md) — 画面別ヒアリング質問
- [`../../adr/0018-vue-to-react-replacement-proposal.md`](../../adr/0018-vue-to-react-replacement-proposal.md) — 既存資産を持参する論拠
- [Issue #113](https://github.com/BoxPistols/Matlens/issues/113) — 説得材料収集
