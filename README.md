# Matlens

材料特性データの統合管理プラットフォーム。**MaiML (JIS K 0200:2024) ネイティブ**のデータ CRUD、
**Petri net ワークフロー可視化**、**結晶構造 3D ビューア**、**ベイズ最適化** (1D/2D ガウス過程回帰)、
**経験式シミュレーション** (Hall-Petch / Larson-Miller / JMAK / ROM)、
AI ベクトル検索と RAG チャット、**自然言語クエリ変換**、
**バイリンガル UI (JP/EN)**、**UI 密度トグル** (3 段階) を統合した研究支援システム。

対象ドメイン: 金属・セラミクス・ポリマー・複合材料の組成・加工・試験・レポートのライフサイクル管理。

## 数値サマリ

| 項目 | 数 |
|------|-----|
| ページ数 | 23 |
| サンプルデータ | 88 件 (金属合金 52, セラミクス 12, ポリマー 14, 複合材料 10) |
| テスト (Vitest) | 605 件 (51 ファイル) |
| E2E テスト (Playwright) | 4 ファイル |
| 用語集 (HELP_TERMS) | 48 エントリ (材料工学/AI/システム/操作ガイド/ページガイド) |
| PAGE_GUIDES | 18 ページ分 |
| FAQ | 24 件 |
| お知らせ | 27+ 件 |

## Tech Stack

| カテゴリ | 技術 |
|---------|------|
| ランタイム | React 18 + TypeScript 6 (strict + `noUncheckedIndexedAccess`) |
| ビルド | Vite 6 |
| スタイリング | Tailwind CSS 3 + CSS Variables (4 テーマ) |
| 3D | Three.js + React Three Fiber + Drei |
| AI (LLM) | AI SDK v6 + Vercel AI Gateway / OpenAI GPT-5.4 nano・mini / Google Gemini 2.5 Flash |
| ベクトル検索 | Upstash Vector (サーバー) / TensorFlow.js + Universal Sentence Encoder (ブラウザフォールバック) |
| データフォーマット | MaiML (JIS K 0200:2024), PNML (ISO/IEC 15909-2), CSV/JSON/Markdown |
| 数値最適化 | ガウス過程回帰 + Expected Improvement (1D/2D、純 TypeScript、依存なし) |
| 経験式 | Hall-Petch / Larson-Miller / JMAK / 複合則 ROM (純 TypeScript) |
| グラフ | Chart.js 4 |
| アイコン | Lucide React |
| i18n | 自前辞書 (JP/EN)、useLang フック + localStorage + タブ間同期 |
| Markdown | marked.js + isomorphic-dompurify |
| テスト | Vitest + Testing Library + jest-axe (a11y) |
| E2E テスト | Playwright |
| コンポーネントカタログ | Storybook 10 (addon-a11y, addon-docs, addon-vitest) |
| デザイントークン連携 | Figma Variables (カスタムプラグイン経由) |
| コード品質 | husky + commitlint (Conventional Commits) + ESLint |
| デプロイ | Vercel (Fluid Compute Functions + 静的ホスティング) |

## Getting Started

```bash
# 依存関係のインストール
npm install --legacy-peer-deps

# 開発サーバー起動 (http://localhost:5173)
npm run dev

# ビルド
npm run build

# バンドル解析付きビルド
npm run build:analyze

# ビルドプレビュー
npm run preview
```

### Storybook

```bash
npm run storybook        # 開発サーバー起動 (http://localhost:6006)
npm run build-storybook  # 静的ビルド (storybook-static/)
```

Storybook は 5 カテゴリで構成:

| カテゴリ | 内容 |
|---------|------|
| `00-Guide` | Introduction, HowToUse, ForDesigners, ComponentDevelopment, AIAndDesignSystem, CssReference |
| `01-DesignPhilosophy` | Overview, ComponentDesignGuide (6 原則), TechnicalStack |
| `02-DesignTokens` | Color, Typography, Spacing, Shadows (4 テーマ対応) |
| `03-Components` | Atoms / Molecules / Organisms (Atomic Design) |
| `04-Patterns` | Dashboard, FormLayout, SearchResults |

右下の FAB ボタンから起動する **ChatSupport コンシェルジュ** が、FAQ / StoryGuide / AI API の 3 層で質問に回答する。API キーはチャット内の設定パネルから入力し、localStorage に永続化される。

### テスト

```bash
npm run test              # Vitest 単発実行 (605 件)
npm run test:watch        # ウォッチモード
npm run test:coverage     # カバレッジ付き
npx playwright test       # E2E テスト (4 ファイル)
```

### その他のスクリプト

```bash
npm run lint              # ESLint
npm run lint:fix          # ESLint 自動修正
npm run typecheck         # tsc --noEmit
```

## プロジェクト構成

```
Matlens/
├── api/
│   └── ai.js                    Vercel Serverless Function (AI プロキシ)
├── e2e/                          Playwright E2E テスト
│   ├── navigation.spec.ts
│   ├── material-flow.spec.ts
│   ├── ui-settings.spec.ts
│   └── faceted-search.spec.ts
├── public/                       静的アセット (favicon, manifest)
├── src/
│   ├── App.tsx                   ルートコンポーネント + ルーティング
│   ├── main.tsx                  エントリポイント
│   ├── index.css                 テーマ CSS 変数 (4 テーマ)
│   ├── types.ts                  共通型定義
│   │
│   ├── components/               UI コンポーネント (コロケーション)
│   │   ├── atoms/                Button, Badge, Card, Input, Select...
│   │   ├── molecules/            Modal, SearchBox, Toast, KpiCard,
│   │   │                         StepWizard, FacetGroup, RangeFilter,
│   │   │                         DownloadPreviewModal...
│   │   ├── Icon/                 Lucide React ラッパー (34 種)
│   │   ├── Tooltip/              Portal 方式ツールチップ
│   │   ├── Topbar/               ヘッダー + グローバル検索 + 密度トグル + 言語切替
│   │   ├── Sidebar/              サイドナビゲーション (モバイルオーバーレイ対応)
│   │   ├── SupportPanel/         サポートパネル (ヘルプ/FAQ/AI 設定)
│   │   ├── MaterialVisual/       材料ビジュアル (CSS/SVG)
│   │   └── DataDisclaimer/       データ免責バナー
│   │
│   ├── pages/                    23 ページ (各フォルダにコロケーション)
│   │   ├── Dashboard/            ダッシュボード (KPI + Chart.js)
│   │   ├── MaterialList/         材料一覧 (テーブル/カード/コンパクト + ファセット検索)
│   │   ├── MaterialForm/         新規登録 / 編集フォーム (ステップウィザード)
│   │   ├── Detail/               材料詳細 (prev/next ナビ + Provenance バッジ)
│   │   ├── Catalog/              材料カタログ (CSS ビジュアル)
│   │   ├── Crystal3D/            結晶構造 3D ビューア (Three.js)
│   │   ├── PetriNet/             金属試験ワークフロー可視化 (P/T ネット + PNML + インポート)
│   │   ├── BayesianOpt/          ベイズ最適化 (GP 回帰 + EI 獲得関数、1D/2D)
│   │   ├── Simulation/           経験式シミュレーション (Hall-Petch/Larson-Miller/JMAK/ROM)
│   │   ├── ProcessTimeline/      加工タイムライン
│   │   ├── Overlay/              予測 vs 実績オーバーレイ
│   │   ├── MultiModal/           マルチスケールビューア
│   │   ├── VectorSearch/         意味検索 (Upstash / TF.js)
│   │   ├── RAGChat/              AI チャット (RAG)
│   │   ├── Similar/              類似材料比較
│   │   ├── ApiDebug/             API テスト (Mock REST)
│   │   ├── TestSuite/            テストスイート
│   │   ├── Help/                 ヘルプ・用語集・ページガイド
│   │   ├── About/                技術スタック
│   │   ├── MasterSettings/       カテゴリ・バッチ管理
│   │   ├── UxDesign/             UX 設計ノート
│   │   └── Voice/                音声 (無効化中)
│   │
│   ├── hooks/
│   │   ├── useAI/                AI API 呼び出し + キー管理 + レートリミット
│   │   ├── useEmbedding/         TF.js ベクトル検索エンジン
│   │   ├── useTheme/             テーマ切替 (light/dark/eng/cae)
│   │   ├── useLang/              言語切替 (JP/EN、localStorage + タブ間同期)
│   │   ├── useDensity/           UI 密度トグル (compact/regular/relaxed)
│   │   ├── useAnnouncements/     お知らせ管理
│   │   └── useVoice/             Web Speech API
│   │
│   ├── i18n/                     国際化辞書 (JP/EN バイリンガル)
│   │   ├── index.ts              エントリ
│   │   └── terms.ts              翻訳キー定義
│   │
│   ├── context/
│   │   └── AppContext.ts         React Context + useReducer (CRUD)
│   │
│   ├── data/                     定数・サンプルデータ (リファクタリング済み分割構成)
│   │   ├── constants.ts          re-export のみ (後方互換)
│   │   ├── navItems.ts           NAV_ITEMS, STORYBOOK_URL, SUPPORT_TABS
│   │   ├── providers.ts          PROVIDERS, RATE_LIMITS, OWN_KEY_STORAGE
│   │   ├── helpContent.ts        HELP_TERMS (48), PAGE_GUIDES (18), FAQ_ITEMS (24), PageGuide 型
│   │   ├── announcements.ts      お知らせデータ (27+ 件)
│   │   ├── initialDb.ts          サンプル材料データ (88 件)
│   │   ├── metalTestSamples.ts   金属試験サンプル
│   │   ├── metalTestWorkflow.ts  金属試験ワークフロー定義
│   │   └── mockProcessData.ts    タイムライン用モックデータ
│   │
│   ├── services/
│   │   ├── mockApi.ts            fetch インターセプター (Mock REST API)
│   │   ├── maiml.ts              MaiML (JIS K 0200:2024) シリアライザ/パーサ
│   │   ├── pnml.ts               PNML (ISO/IEC 15909-2) エクスポーター
│   │   ├── pnmlImport.ts         PNML インポーター
│   │   ├── bayesianOpt.ts        ガウス過程回帰 + EI 獲得関数 (1D/2D)
│   │   ├── empiricalFormulas.ts  経験式 (Hall-Petch/Larson-Miller/JMAK/ROM)
│   │   ├── nlQueryCompile.ts     自然言語クエリ → 構造化フィルタ変換
│   │   ├── tfjsSemanticSearch.ts TF.js USE によるブラウザ内ベクトル検索
│   │   ├── downloadFile.ts       Blob ダウンロード共通ユーティリティ
│   │   └── safeMarkdown.ts       marked + DOMPurify (XSS 対策)
│   │
│   └── stories/                  Storybook ガイド・パターン
│
├── design-tokens/                 デザイントークン (TS 単一ソース)
│   ├── src/                       TS ソース (colorTokens, sizeTokens 等)
│   ├── figma-plugin/              Figma プラグイン (code.ts → code.js)
│   ├── scripts/                   ビルドスクリプト (esbuild + Node TS)
│   ├── tokens.json                Tokens Studio 形式 (生成成果物)
│   └── README.md
│
├── playwright.config.ts          Playwright 設定
├── index.html                    Vite エントリ
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
├── vitest.config.ts
├── vercel.json
├── .npmrc                        legacy-peer-deps=true
└── package.json
```

各コンポーネント・ページ・フックはフォルダ単位でコロケーション。ソースファイル + テスト + Storybook ストーリーが同じフォルダに配置される。

## 全 23 ページ一覧

| # | ページ | パス | 説明 |
|---|--------|------|------|
| 1 | Dashboard | `/` | KPI カード + Chart.js グラフ。全体の概況 |
| 2 | MaterialList | `/materials` | テーブル/カード/コンパクト 3 ビュー + ファセット検索 + 自然言語クエリ |
| 3 | MaterialForm | `/materials/new` | 3 ステップウィザード (基本情報→物性データ→確認) で材料登録 |
| 4 | Detail | `/materials/:id` | 材料詳細。prev/next ナビ、Provenance バッジ、AI チャット連携 |
| 5 | Catalog | `/catalog` | 材料カタログ。CSS/SVG による材料ビジュアル |
| 6 | Crystal3D | `/crystal3d` | 結晶構造 3D ビューア (Three.js + React Three Fiber) |
| 7 | PetriNet | `/petri-net` | 金属試験ワークフローを Petri net で可視化。PNML インポート/エクスポート |
| 8 | BayesianOpt | `/bayesian` | 1D/2D ガウス過程回帰によるベイズ最適化。EI 獲得関数 |
| 9 | Simulation | `/simulation` | 経験式シミュレーション (Hall-Petch / Larson-Miller / JMAK / ROM) |
| 10 | ProcessTimeline | `/timeline` | 材料の加工履歴を時系列で可視化 |
| 11 | Overlay | `/overlay` | シミュレーション予測と実測データの比較表示 |
| 12 | MultiModal | `/multimodal` | マクロ〜ミクロの複数スケールを統合表示 |
| 13 | VectorSearch | `/search` | 意味検索 (Upstash Vector / TF.js USE フォールバック) |
| 14 | RAGChat | `/chat` | AI チャット。ベクトル検索で取得した材料データを RAG コンテキストに注入 |
| 15 | Similar | `/similar` | 類似材料の比較・レーダーチャート |
| 16 | ApiDebug | `/api-debug` | Mock REST API のテスト・デバッグ |
| 17 | TestSuite | `/tests` | テストスイートの実行状況 |
| 18 | Help | `/help` | 用語集 (48 エントリ) + ページガイド (18 ページ) + FAQ (24 件) |
| 19 | About | `/about` | 技術スタック・バージョン情報 |
| 20 | MasterSettings | `/settings` | カテゴリ・バッチ管理 |
| 21 | UxDesign | `/ux` | UX 設計ノート |
| 22 | Voice | `/voice` | 音声操作 (無効化中) |
| 23 | — | — | (新規ページ追加予定枠) |

## 主な機能

| 機能 | 説明 |
|------|------|
| ステップ式入力ウィザード | StepWizard コンポーネントで 3 ステップ (基本情報→物性データ→確認) の材料登録 |
| ファセット検索 + プリセット | FacetGroup / RangeFilter でマルチセレクト・数値範囲・保存済クエリ絞り込み |
| 自然言語クエリ変換 | 「ニッケル合金で硬度300以上」→ nlQueryCompile で構造化フィルタに自動変換 |
| 結晶構造 3D ビューア | Three.js + React Three Fiber で BCC/FCC/HCP 等の結晶格子を対話的に表示 |
| ワークフロー連動ナビ | Petri net の工程クリック → 対応画面に直接遷移 |
| 経験式シミュレーション | Hall-Petch / Larson-Miller / JMAK / ROM の 4 式を対話的に計算 |
| 2D ベイズ最適化 | 2D 特徴量空間でのガウス過程回帰によるグリッドスキャン探索 |
| PNML インポート | .pnml / .xml ファイルを読み込みトークン配置を復元 |
| Provenance バッジ | データ出所 (装置計測/手入力/AI 推定/シミュレーション) の記録・表示 |
| 加工タイムライン | 材料の加工履歴を時系列で可視化 |
| 予測 vs 実績オーバーレイ | シミュレーション予測と実測データの比較表示 |
| マルチスケールビューア | マクロ〜ミクロの複数スケールを統合表示 |
| ダウンロードプレビュー | 全ダウンロード箇所にプレビュー確認モーダルを適用 |
| モバイル対応 | サイドバーオーバーレイ、Topbar 設定メニュー、レスポンシブカラム |
| AI エラーガイダンス | AI 呼び出しエラー時の toast 通知とユーザーガイド |

## AI 機能

### アーキテクチャ

```
ブラウザ (エンドユーザー)
  │
  ├─ [無料枠] POST /api/ai ──→ Vercel Serverless Function
  │                                ├─ process.env.OPENAI_API_KEY
  │                                └─ process.env.GEMINI_API_KEY
  │                                      │
  │                                      ├──→ OpenAI API (GPT-5.4 nano)
  │                                      └──→ Gemini API (2.5 Flash)
  │
  └─ [自前キー] 直接 fetch ──→ OpenAI API (GPT-5.4 mini 解放)
                                  (キーは localStorage、サーバー非経由)
```

### レートリミット

| 利用形態 | モデル | 制限 |
|---------|--------|------|
| 無料枠 | GPT-5.4 nano, Gemini 2.5 Flash | IP 単位 30 回/日 (DAILY_LIMIT 環境変数で変更可) |
| 自前キー | 上記 + GPT-5.4 mini | 無制限 (ブラウザから直接 API) |

### ベクトル検索

TensorFlow.js の Universal Sentence Encoder がブラウザ内で動作。材料テキスト (名称 + 組成 + 特性) を 512 次元ベクトルに変換し、コサイン類似度でランキング。サーバー不要。

### RAG チャット

1. ユーザーの質問をベクトル検索で上位 4 件の材料データを取得
2. 取得した材料データを LLM のシステムプロンプトにコンテキストとして注入
3. LLM が材料データに基づいた根拠ある回答を生成

詳細ページの「AI チャットで詳しく」ボタンから材料コンテキスト付きで RAG チャットに遷移可能。

### 自然言語クエリ変換

「ニッケル合金で硬度300以上の承認済」のような自然言語を入力すると、`nlQueryCompile` サービスがカテゴリ・数値範囲・ステータスなどの構造化フィルタ条件に自動変換する。

## テーマシステム

CSS Variables で 4 テーマを定義。`data-theme` 属性で切替。

| テーマ | 用途 |
|--------|------|
| `light` | 標準。明るい背景 |
| `dark` | 暗色。WCAG AA コントラスト準拠 |
| `eng` | Eng。モノスペースフォント、ターミナル風 |
| `cae` | CAE。暖色アクセント、解析ツール風 |

トークン例: `--bg-base`, `--bg-surface`, `--text-hi`, `--text-md`, `--text-lo`, `--accent`, `--ai-col`, `--vec` 等。Tailwind の `theme.extend.colors` でブリッジ。

## i18n (JP/EN 言語切替)

`useLang` フックで日英切替を実現。翻訳辞書は `src/i18n/terms.ts` に集約。

- トップバーの言語トグルで即座に切替
- localStorage に永続化
- `storage` イベントによるタブ間同期
- ラベル・プレースホルダ・ヘルプテキスト・エラーメッセージを網羅

## UI 密度

トップバーの密度トグルで UI 全体のサイズを 3 段階で調整可能。CSS transform scale で実装。

| 密度 | スケール | 用途 |
|------|---------|------|
| Compact | 小 | 情報密度を高める (テーブル一覧向き) |
| Regular | 標準 | デフォルト |
| Relaxed | 大 | ゆったり表示 (プレゼン・タブレット向き) |

テーブル・カード・チャット・フォーム全てに適用される。`useDensity` フックで管理。

## デザイントークン (Figma 連携)

Matlens のデザイントークンは **TypeScript の単一ソース** (`design-tokens/src/`) で管理され、そこから 2 つの成果物が自動生成される:

- **Figma プラグイン** (`design-tokens/figma-plugin/code.js`) — Figma に Variables / Text Styles / Effect Styles を登録
- **Tokens Studio JSON** (`design-tokens/tokens.json`) — サードパーティプラグイン用

詳細は `design-tokens/README.md` 参照。

### ビルド

```bash
npm run tokens:build              # 両方の成果物を再生成
npm run tokens:build:figma-plugin # Figma プラグインのみ
npm run tokens:build:json         # Tokens Studio JSON のみ
```

ビルドスクリプト (`design-tokens/scripts/*.ts`) は Node 22+ のネイティブ TypeScript 型ストリッピングで直接実行される。追加の transpile ツール不要。Figma プラグインのバンドルは既存 devDep の esbuild で行う。

### Figma への登録

1. Figma で対象ファイルを開く
2. **Menu → Plugins → Development → マニフェストからインポート...**
3. `design-tokens/figma-plugin/manifest.json` を選択
4. プラグイン「Matlens Design Tokens」を実行

### 登録される内容

| 種類 | 数量 | 詳細 |
|------|------|------|
| Variable Collection: Color Tokens | 29 変数 x 4 モード | `accent`, `ai-col`, `vec`, `ok/warn/err`, `bg/*`, `text/*`, `border/focus`, `topbar-bg`, `sidebar-bg`, `tag-surface` |
| Variable Collection: Size Tokens | 16 変数 x 4 モード | `spacing/0.5`〜`spacing/12`, `radius/sm`〜`radius/xl` |
| Text Styles | 9 スタイル | `Matlens/Heading/H1`〜`H3/Subhead`, `Body/Base/Default`, `Label/Nav/Badge`, `Code/Mono` |
| Effect Styles | 4 スタイル | `Matlens/Shadow/XS`〜`LG` |

4 モード (light/dark/eng/cae) 対応により、Figma のモード切替でテーマが一括で変わる。CSS 側の値と完全に対応しているので、デザインとコードの乖離を防ぐ。

## ヘルプシステム

Help ページに 3 層のサポートコンテンツを集約:

| レイヤー | 内容 | 件数 |
|---------|------|------|
| 用語集 (HELP_TERMS) | 材料工学・AI・システム・操作ガイド・ページガイドの 5 カテゴリ | 48 エントリ |
| ページガイド (PAGE_GUIDES) | 各ページの目的・操作手順・Tips | 18 ページ分 |
| FAQ (FAQ_ITEMS) | よくある質問と回答 | 24 件 |

SupportPanel (右下 FAB) からも FAQ と AI チャットにアクセス可能。

## テスト

### Vitest (ユニット / 統合)

- **605 件** / 51 ファイル
- Testing Library + jest-axe (a11y スモーク)
- サービス層 (bayesianOpt, empiricalFormulas, maiml, pnml, pnmlImport, nlQueryCompile, mockApi, tfjsSemanticSearch) は個別テストファイル

### Playwright (E2E)

- **4 ファイル**: navigation, material-flow, ui-settings, faceted-search
- `playwright.config.ts` で設定

## Vercel デプロイ

### 環境変数

Vercel ダッシュボード → Settings → Environment Variables で設定:

| 変数名 | 値 | 必須 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-...` | はい (無料枠用) |
| `GEMINI_API_KEY` | `AIza...` | はい (無料枠用) |
| `DAILY_LIMIT` | `30` | いいえ (デフォルト 30) |

### ビルド設定

Vercel はリポジトリの `package.json` を検出し、自動で `npm run build` を実行。

- Framework: Vite (自動検出)
- Build Command: `vite build`
- Output Directory: `dist`
- Serverless Functions: `api/` ディレクトリから自動検出

### ローカル開発時の注意

- `/api/ai` は Vercel Serverless Function のため、`npm run dev` では利用不可
- 開発モード (`import.meta.env.DEV`) ではデモ応答を返す
- 自前の OpenAI API キーを設定パネルで入力すれば、ローカルでも実際の AI 応答が使える

## サンプルデータ

88 件の材料データを搭載 (金属合金 52、セラミクス 12、ポリマー 14、複合材料 10)。

ASM Handbook, JIS 規格, 各メーカーデータシートを参考に設定したデモ用サンプル。設計・研究に使用する場合は一次ソースで必ず検証すること。

## IME 対応

日本語入力時の Enter キー誤送信を防止。送信は `Cmd+Enter` (Mac) / `Ctrl+Enter` (Win)。`isComposing` チェックで二重防止。

## ライセンス

MIT
