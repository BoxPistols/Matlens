# Matlens

材料研究者・実験担当者向けのデータ管理システム。材料特性値の登録・検索・比較に加え、AIベクトル検索とRAGチャットで意思決定を支援する。

## Tech Stack

| カテゴリ | 技術 |
|---------|------|
| ランタイム | React 18 + TypeScript |
| ビルド | Vite 5 |
| スタイリング | Tailwind CSS 3 + CSS Variables (4テーマ) |
| AI (LLM) | OpenAI GPT-5.4 nano/mini, Google Gemini 2.5 Flash |
| ベクトル検索 | TensorFlow.js + Universal Sentence Encoder (ブラウザ内) |
| グラフ | Chart.js 4 |
| アイコン | Lucide React |
| Markdown | marked.js |
| テスト | Vitest + Testing Library |
| コンポーネントカタログ | Storybook 10 |
| デプロイ | Vercel (静的 + Serverless Functions) |

## Getting Started

```bash
# 依存関係のインストール
npm install --legacy-peer-deps

# 開発サーバー起動 (http://localhost:5173)
npm run dev

# ビルド
npm run build

# ビルドプレビュー
npm run preview
```

### Storybook

```bash
npm run storybook    # http://localhost:6006
```

### テスト

```bash
npm run test              # 単発実行
npm run test:watch        # ウォッチモード
npm run test:coverage     # カバレッジ付き
```

## プロジェクト構成

```
Matlens/
├── api/
│   └── ai.js                    Vercel Serverless Function (AIプロキシ)
├── public/                       静的アセット (favicon, manifest)
├── src/
│   ├── App.tsx                   ルートコンポーネント + ルーティング
│   ├── main.tsx                  エントリポイント
│   ├── index.css                 テーマCSS変数 (4テーマ)
│   ├── types.ts                  共通型定義
│   │
│   ├── components/               UIコンポーネント (コロケーション)
│   │   ├── atoms/                Button, Badge, Card, Input, Select...
│   │   ├── molecules/            Modal, SearchBox, Toast, KpiCard...
│   │   ├── Icon/                 Lucide React ラッパー (34種)
│   │   ├── Tooltip/              Portal方式ツールチップ
│   │   ├── Topbar/               ヘッダー + グローバル検索
│   │   ├── Sidebar/              サイドナビゲーション
│   │   ├── SupportPanel/         サポートパネル (ヘルプ/FAQ/AI設定)
│   │   ├── MaterialVisual/       材料ビジュアル (CSS/SVG)
│   │   └── DataDisclaimer/       データ免責バナー
│   │
│   ├── pages/                    15ページ (各フォルダにコロケーション)
│   │   ├── Dashboard/            ダッシュボード (KPI + Chart.js)
│   │   ├── MaterialList/         材料一覧 (テーブル/カード/コンパクト)
│   │   ├── MaterialForm/         新規登録 / 編集フォーム
│   │   ├── Detail/               材料詳細 (prev/next ナビ付き)
│   │   ├── Catalog/              材料カタログ (CSSビジュアル)
│   │   ├── VectorSearch/         意味検索 (TF.js Embedding)
│   │   ├── RAGChat/              AIチャット (RAG)
│   │   ├── Similar/              類似材料比較
│   │   ├── ApiDebug/             API テスト (Mock REST)
│   │   ├── TestSuite/            テストスイート
│   │   ├── Help/                 ヘルプ・用語集
│   │   ├── About/                技術スタック
│   │   ├── MasterSettings/       カテゴリ・バッチ管理
│   │   ├── UxDesign/             UX設計ノート
│   │   └── Voice/                音声 (無効化中)
│   │
│   ├── hooks/
│   │   ├── useAI/                AI API呼び出し + キー管理 + レートリミット
│   │   ├── useEmbedding/         TF.js ベクトル検索エンジン
│   │   ├── useTheme/             テーマ切替 (light/dark/eng/cae)
│   │   └── useVoice/             Web Speech API
│   │
│   ├── context/
│   │   └── AppContext.ts         React Context + useReducer (CRUD)
│   │
│   ├── data/
│   │   ├── constants.ts          NAV_ITEMS, PROVIDERS, FAQ, 用語集
│   │   └── initialDb.ts          サンプル材料データ (68件)
│   │
│   ├── services/
│   │   └── mockApi.ts            fetch インターセプター (Mock REST API)
│   │
│   └── stories/                  Storybook ガイド・パターン
│
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
                                  (キーはlocalStorage、サーバー非経由)
```

### レートリミット

| 利用形態 | モデル | 制限 |
|---------|--------|------|
| 無料枠 | GPT-5.4 nano, Gemini 2.5 Flash | IP単位 30回/日 (DAILY_LIMIT 環境変数で変更可) |
| 自前キー | 上記 + GPT-5.4 mini | 無制限 (ブラウザから直接API) |

### ベクトル検索

TensorFlow.js の Universal Sentence Encoder がブラウザ内で動作。材料テキスト (名称 + 組成 + 特性) を 512次元ベクトルに変換し、コサイン類似度でランキング。サーバー不要。

### RAG チャット

1. ユーザーの質問をベクトル検索で上位4件の材料データを取得
2. 取得した材料データをLLMのシステムプロンプトにコンテキストとして注入
3. LLMが材料データに基づいた根拠ある回答を生成

詳細ページの「AIチャットで詳しく」ボタンから材料コンテキスト付きでRAGチャットに遷移可能。

## テーマシステム

CSS Variables で4テーマを定義。`data-theme` 属性で切替。

| テーマ | 用途 |
|--------|------|
| `light` | 標準。明るい背景 |
| `dark` | 暗色。WCAG AA コントラスト準拠 |
| `eng` | Engineering。モノスペースフォント、ターミナル風 |
| `cae` | CAE。暖色アクセント、解析ツール風 |

トークン例: `--bg-base`, `--bg-surface`, `--text-hi`, `--text-md`, `--text-lo`, `--accent`, `--ai-col`, `--vec` 等。Tailwind の `theme.extend.colors` でブリッジ。

## Vercel デプロイ

### 環境変数

Vercel ダッシュボード → Settings → Environment Variables で設定:

| 変数名 | 値 | 必須 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-...` | はい (無料枠用) |
| `GEMINI_API_KEY` | `AIza...` | はい (無料枠用) |
| `DAILY_LIMIT` | `30` | いいえ (デフォルト30) |

### ビルド設定

Vercel はリポジトリの `package.json` を検出し、自動で `npm run build` を実行。

- Framework: Vite (自動検出)
- Build Command: `vite build`
- Output Directory: `dist`
- Serverless Functions: `api/` ディレクトリから自動検出

### ローカル開発時の注意

- `/api/ai` は Vercel Serverless Function のため、`npm run dev` では利用不可
- 開発モード (`import.meta.env.DEV`) ではデモ応答を返す
- 自前のOpenAI APIキーを設定パネルで入力すれば、ローカルでも実際のAI応答が使える

## サンプルデータ

68件の材料データを搭載 (金属合金32、セラミクス12、ポリマー14、複合材料10)。

ASM Handbook, JIS規格, 各メーカーデータシートを参考に設定したデモ用サンプル。設計・研究に使用する場合は一次ソースで必ず検証すること。

## IME 対応

日本語入力時の Enter キー誤送信を防止。送信は `Cmd+Enter` (Mac) / `Ctrl+Enter` (Win)。`isComposing` チェックで二重防止。

## ライセンス

MIT
