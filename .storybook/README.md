# Storybook 設定 — Matlens

## preview.tsx デコレーターアーキテクチャ

### ChatSupport の自動注入

グローバルデコレーターが全 Story に `<ChatSupport currentStory={...} />` を
浮かべる。AI がコンポーネントの prop 仕様を答えられるよう、Storybook の
`context.argTypes` / `context.args` を `StoryContext` として渡す。

### useRef パターン — args 変更時の currentStory 再生成を抑制

Controls パネルで値を変えるたびに `context.args` が新しい参照になる。
単純に `useMemo` の deps に含めると currentStory が毎回作り直され、
チャット履歴が消えたりストリーミングが途切れたりする。

```tsx
// .storybook/preview.tsx
const argTypesRef = useRef(context.argTypes)
const argsRef    = useRef(context.args)
argTypesRef.current = context.argTypes  // 毎 render で ref を同期
argsRef.current    = context.args

const currentStory = useMemo(() => ({
  title:       context.title,
  name:        context.name,
  description: context.parameters?.docs?.description?.component,
  argTypes:    argTypesRef.current,  // ref の値を読む（deps には含めない）
  args:        argsRef.current,
}), [context.title, context.name, description])
```

**ルール**: `argTypes` / `args` は `useMemo` の deps に含めない。
ref 経由で常に最新値を参照するため問題ない。

---

### disableDecoratorChat — 二重レンダリング防止

ChatSupport 自身の Story を Canvas で開くと、Decorator が ChatSupport を
もう一度マウントして二重表示になる。該当する Story の `meta.parameters` に
`disableDecoratorChat: true` を設定すると Decorator 側がスキップする。

```tsx
// 例: ChatSupport.stories.tsx
const meta: Meta<typeof ChatSupport> = {
  parameters: {
    disableDecoratorChat: true,
  },
}
```

Decorator 側の実装（`preview.tsx`）:

```tsx
const disableDecoratorChat = context.parameters?.disableDecoratorChat === true
{context.viewMode !== 'docs' && !disableDecoratorChat && (
  <ChatSupport currentStory={currentStory} />
)}
```

適用すべき Story: `ChatSupport` 本体の Story など、`<ChatSupport />` を
自分でレンダリングする Story すべて。

---

## テーマ切り替え

`globals.theme` で `light` / `dark` / `eng` / `cae` の 4 テーマを切り替える。
`ThemeWrapper` が `document.documentElement` の `data-theme` 属性を更新し、
CSS カスタムプロパティ経由で全コンポーネントに反映される。

## Vite preload エラー自動リカバリー

`vite:preloadError` イベントを捕捉してページを一度だけ自動リロードする。
Vercel デプロイ後にコンテンツハッシュが変わった古いチャンクが
キャッシュに残っている場合の 404 を回避するため。
`sessionStorage` でリロードループを防止している。
