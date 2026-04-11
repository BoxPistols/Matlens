import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatSupport } from './ChatSupport'

const meta: Meta<typeof ChatSupport> = {
  title: 'Components/UI/ChatSupport',
  component: ChatSupport,
  tags: ['autodocs'],
  parameters: {
    /**
     * ChatSupport の Story を Canvas で開くとき、preview.tsx の Decorator が
     * 同じ <ChatSupport /> をもう一度レンダリングしてしまい二重表示になる。
     * このフラグを true にすると Decorator 側がスキップし、Story 自身の
     * <ChatSupport /> だけが描画される。
     *
     * 実装は .storybook/preview.tsx を参照：
     *   const disableDecoratorChat = context.parameters?.disableDecoratorChat === true
     *   {viewMode !== 'docs' && !disableDecoratorChat && <ChatSupport ... />}
     */
    disableDecoratorChat: true,
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## ChatSupport — Storybook AI チャットウィジェット

Storybook 全ページに浮かぶ AI チャットパネル。FAQヒット → storyGuideMap → AI プロキシ の 3 段階でコストを最小化する。

---

### アーキテクチャ

\`\`\`
ChatSupport/
  ChatSupport.tsx          メインコンテナ（レイアウト切り替え・状態結合）
  chatAiService.ts         AI 呼び出し・レート制限・ストリーミング
  chatSupportTypes.ts      型定義（StoryContext / Provider / ModelOption …）
  chatSupportConstants.ts  モデル設定・クイック提案テキスト
  faqDatabase.ts           FAQ データ（キーワード + 質問 + 回答）
  faqService.ts            Fuse.js ラッパー（スコアしきい値でフィルタ）
  storyGuideMap.ts         ページ別ガイド文（ストーリータイトル → tips[]）
  CodeBlock.tsx            コードブロックレンダラー（Prism.js）
  renderContent.tsx        Markdown → React 変換
  components/              UI 分割（Fab / Header / Input / Message / Panel / Settings / Sidebar）
  hooks/                   useChat / useChatConfig / useChatMessage / useResize
\`\`\`

---

### Storybook Decorator との連携

#### 1. argTypes / args の自動注入

\`.storybook/preview.tsx\` のデコレーターが \`context.argTypes\` と \`context.args\` を
\`StoryContext\` として ChatSupport に渡す。AI のシステムプロンプトにコンポーネントの
prop 仕様が自動展開されるため、storyGuideMap に prop 情報を手で書く必要がない。

#### 2. useRef パターン（args 変更時の再生成抑制）

Controls パネルで値を変えるたびに \`context.args\` が新しい参照になるため、
単純に \`useMemo\` の deps に含めると \`currentStory\` が毎回再生成される。
\`useRef\` で最新値を追跡しつつ \`useMemo\` の deps からは除外することで解決：

\`\`\`tsx
const argTypesRef = useRef(context.argTypes)
const argsRef = useRef(context.args)
argTypesRef.current = context.argTypes  // 毎 render で同期
argsRef.current = context.args

const currentStory = useMemo(() => ({
  title: context.title,
  name: context.name,
  description,
  argTypes: argTypesRef.current,  // ref の値を useMemo 内で読む
  args: argsRef.current,
}), [context.title, context.name, description]) // args/argTypes は deps に含めない
\`\`\`

#### 3. disableDecoratorChat — 二重レンダリング防止

ChatSupport 自身の Story を Canvas で開くと、Decorator が ChatSupport を
もう一度マウントして二重表示になる。Story の meta に以下を追加すると回避できる：

\`\`\`tsx
const meta: Meta<typeof ChatSupport> = {
  parameters: {
    disableDecoratorChat: true,
  },
}
\`\`\`

preview.tsx の実装：
\`\`\`tsx
const disableDecoratorChat = context.parameters?.disableDecoratorChat === true
{context.viewMode !== 'docs' && !disableDecoratorChat && (
  <ChatSupport currentStory={currentStory} />
)}
\`\`\`

---

### 検索フォールバック優先順位

1. **FAQ（Fuse.js）** — スコア 0.4 以上のヒットがあれば AI を呼ばずに返答
2. **storyGuideMap** — ページ別の手書きガイド（PageContextBanner 経由で表示）
3. **AI プロキシ（/api/ai）** — 共有プール（nano/mini/gemini）または自前キー（gpt-5.4）

---

### 関連コンポーネント

- \`PageContextBanner\` — ストーリーのガイドが storyGuideMap にある場合だけ表示
- \`QuickSuggestions\` — 会話が空のとき pill ボタンで定型クエリを提示
        `,
      },
    },
  },
  argTypes: {
    currentStory: {
      control: false,
      description: '現在の Storybook コンテキスト（title / name / description / argTypes / args）。通常は Decorator が自動注入する。',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChatSupport>

export const Default: Story = {
  args: {
    currentStory: {
      title: 'Components/UI/ChatSupport',
      name: 'Default',
      description: 'Storybook 全ページに浮かぶ AI チャットウィジェットのデモ。',
    },
  },
}

export const WithArgTypes: Story = {
  name: 'argTypes 注入あり',
  args: {
    currentStory: {
      title: 'Components/Atoms/Button',
      name: 'Primary',
      description: 'プライマリボタン',
      argTypes: {
        label: { type: { name: 'string' }, description: 'ボタンのラベル' },
        disabled: { type: { name: 'boolean' }, description: '無効状態' },
      },
      args: {
        label: 'クリック',
        disabled: false,
      },
    },
  },
}

export const NoStory: Story = {
  name: 'ストーリーなし（ウェルカム状態）',
  args: {
    currentStory: null,
  },
}
