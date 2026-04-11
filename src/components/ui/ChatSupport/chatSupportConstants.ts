export const SYSTEM_PROMPT = `あなたはMatlensデザインシステムのコンシェルジュです。
Storybookを閲覧しているユーザー（エンジニア・デザイナー）の質問に、簡潔かつ正確に回答してください。

## Matlensについて
材料データベースの登録・検索・AI分析を行うエンジニアリングツールです。

## 技術スタック
- React 19 + TypeScript + Vite
- Tailwind CSS + CSS変数ベースのデザイントークン
- 4テーマ対応: light / dark / eng (Eng) / cae (CAE解析)

## コンポーネント設計6原則
1. **間接化** — UIを直接ハードコードせずトークン・変数経由で制御
2. **カプセル化** — 内部実装を隠し公開APIだけで操作
3. **制約** — 選択肢を意図的に狭めてミスを防ぐ
4. **意味の符号化** — 見た目ではなく意味で命名（例: --accent, --err, --ai-col）
5. **合成** — 小さなコンポーネントを組み合わせて大きなUIを作る
6. **慣習** — チーム内の共通ルールを遵守する

## トークン命名規則
- カラー: --accent, --ai-col, --vec, --ok, --warn, --err
- 背景: --bg-base, --bg-surface, --bg-raised
- テキスト: --text-hi (高コントラスト), --text-md (中), --text-lo (低)
- ボーダー: --border-faint, --border-default, --border-strong
- シャドウ: --shadow-xs, --shadow-sm, --shadow-md, --shadow-lg
- 半径: --radius-sm (4px), --radius-md (6px), --radius-lg (10px), --radius-xl (14px)
- フォント: --font-ui (UI用), --font-mono (等幅)

## コンポーネント構成
- Atoms: Button, Badge, Card, SectionCard, Input, Select, Textarea, Checkbox, UnitInput, FormGroup, Divider, ProgressBar, Typing, Kbd
- Molecules: Modal, ExportModal, AIInsightCard, VecCard, KpiCard, SearchBox, FilterChip, MarkdownBubble
- Organisms: Topbar, Sidebar, Tooltip, SupportPanel

回答は日本語で、コード例を含む場合はバッククォートで囲んでください。`

export const WELCOME_MESSAGE =
  'Matlens デザインシステムについて質問してください。コンポーネントの使い方、デザイントークン、設計原則など何でもお答えします。\n' +
  'AI 応答は 1 日 30 回まで無料で使えます（IP ベース、自前 API キー不要）。超過後は設定 ⚙️ から自前キーで無制限利用に切り替えられます。'

export const MAX_MESSAGES = 50

export const CHAT_STORAGE_KEY = 'matlens-ds-chat'

// Quick-suggestion buttons shown under the welcome message and again
// when the conversation is otherwise empty. Each one pre-fills the
// input with a canonical query so users don't have to phrase it
// themselves — which is both more discoverable and more likely to hit
// the FAQ / Story Guide layer without spending AI quota.
//
// Ordered by expected usage frequency: the first two land on design
// tokens (the question we get most), then Atomic Design structure,
// then a contextual "this page" helper that pulls from storyGuideMap.
export const QUICK_SUGGESTIONS = [
  { label: '現在のページの解説', query: 'このページの解説を教えて' },
  { label: 'カラートークン', query: 'カラートークンの一覧を教えて' },
  { label: 'テーマの違い', query: '4 テーマの違いと使い分けは？' },
  { label: 'Atomic Design', query: 'Atoms / Molecules / Organisms の使い分け基準は？' },
  { label: '設計 6 原則', query: 'コンポーネント設計 6 原則を教えて' },
  { label: 'コンポーネント一覧', query: 'Atoms / Molecules / Organisms のコンポーネント一覧は？' },
  { label: 'トークン命名規則', query: 'CSS 変数トークンの命名規則を教えて' },
  { label: 'スペーシング', query: 'スペーシングのルールと推奨値は？' },
  { label: 'シャドウ / 半径', query: 'shadow と radius のトークンを教えて' },
  { label: 'フォント仕様', query: 'フォントファミリーとサイズ階層を教えて' },
  { label: 'AI / Vec カラー規約', query: 'AI 機能とベクトル検索のカラー規約を教えて' },
  { label: '実装の注意点', query: 'コンポーネントを追加する手順と注意点を教えて' },
] as const

// ──────────────────────────────────────────────────────────────────────
// Model catalogue
//
// `projectKeyEnabled` models can run on the shared pool (backend proxy
// with IP-based rate limit — see `lib/ratelimit.js`). `requiresUserKey`
// models are too expensive to subsidise, so the UI disables them until
// the user supplies their own API key and they get routed via the
// browser-direct path instead.
//
// The wire `value` matches the `provider` allowlist in
// `lib/validation.js` — if you add a new entry, add it there too or the
// shared-pool call will fail validation.

import type { ModelOption } from './chatSupportTypes'

export const MODELS: ModelOption[] = [
  {
    value: 'openai-nano',
    label: 'gpt-5.4 nano',
    description: '共有プール対応・最速・最安（推奨）',
    projectKeyEnabled: true,
  },
  {
    value: 'openai-mini',
    label: 'gpt-5.4 mini',
    description: '共有プール対応・バランス型',
    projectKeyEnabled: true,
  },
  {
    value: 'openai',
    label: 'gpt-5.4 (フル)',
    description: '自前 APIキー必須・最高性能',
    requiresUserKey: true,
  },
  {
    value: 'gemini',
    label: 'Gemini 2.5 Flash',
    description: '共有プール対応・マルチモーダル',
    projectKeyEnabled: true,
  },
]

// Default daily quota — mirrored from `lib/ratelimit.js`'s DAILY_LIMIT
// env default. Used as a fallback when the backend hasn't yet reported
// a real value (first load, before any request has completed).
export const DEFAULT_DAILY_LIMIT = 30

// Storage keys scoped so ChatSupport never collides with the main app.
export const CHAT_MODEL_STORAGE_KEY = `${CHAT_STORAGE_KEY}-model`
