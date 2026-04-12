import type { FaqEntry } from './chatSupportTypes'

export const FAQ_DATABASE: FaqEntry[] = [
  // カラートークン
  {
    keywords: ['カラー', '色', 'color', 'accent', 'テーマ'],
    question: 'カラートークンの一覧は？',
    answer: `Matlensのカラートークン（CSS変数）:

**ロールカラー:**
- \`--accent\` — プライマリアクセント（Light: #004590, Dark: #5a9ae0）
- \`--ai-col\` — AI機能（Light: #3b35a0, Dark: #9a92f0）
- \`--vec\` — ベクトル検索（Light: #0a6657, Dark: #38d0b0）
- \`--ok\` — 成功（Light: #1e6b0f, Dark: #6cc850）
- \`--warn\` — 警告（Light: #7a4b00, Dark: #f0b040）
- \`--err\` — エラー（Light: #8b1a1a, Dark: #f06060）

**背景:**
- \`--bg-base\` — ページ背景
- \`--bg-surface\` — カード・パネル背景
- \`--bg-raised\` — 浮き上がり要素

**テキスト:**
- \`--text-hi\` — 高コントラスト（見出し）
- \`--text-md\` — 中コントラスト（本文）
- \`--text-lo\` — 低コントラスト（補助）

テーマ切替で全て自動的に変わります。`,
  },
  // テーマ
  {
    keywords: ['テーマ', 'theme', 'ダーク', 'dark', 'light', 'eng', 'cae'],
    question: 'テーマの種類と切替方法は？',
    answer: `Matlensは4テーマに対応:

1. **Light** — 標準テーマ。明るいグレー基調
2. **Dark** — ダークモード。ネイビー基調
3. **Eng** — エンジニアリング向け。ダーク+グリーンアクセント、等幅フォント
4. **CAE** — CAE解析向け。ダーク+オレンジアクセント、等幅フォント

切替方法: \`document.documentElement.setAttribute('data-theme', 'dark')\`
Storybook上部のThemeセレクターでも切替可能です。`,
  },
  // タイポグラフィ
  {
    keywords: ['フォント', 'font', 'typography', 'タイポ', '文字'],
    question: 'フォント仕様は？',
    answer: `**フォントファミリー:**
- \`--font-ui\` — UIテキスト用: -apple-system, BlinkMacSystemFont, Hiragino Sans等
- \`--font-mono\` — 等幅: SFMono-Regular, Consolas等

**フォントサイズ（px）:**
- 10px: バッジ・補助ラベル
- 11px: ツールチップ・キーボードヒント
- 12px: ナビ・フォームラベル・タグ
- 13px: 本文・入力フィールド
- 14px: ベースフォントサイズ (1rem)
- 15px: モーダル見出し
- 16-19px: 見出し

※ eng/caeテーマでは--font-uiも等幅フォントになります。`,
  },
  // スペーシング
  {
    keywords: ['スペーシング', 'spacing', '余白', 'padding', 'margin', 'gap'],
    question: 'スペーシングの基準は？',
    answer: `Tailwind CSSのスペーシングスケールを使用:
- 2px (0.5), 4px (1), 6px (1.5), 8px (2)
- 10px (2.5), 12px (3), 16px (4), 20px (5)
- 24px (6), 32px (8), 40px (10), 48px (12)

**レイアウト責任分離:**
- margin = 親コンポーネントが制御
- padding = 自コンポーネントが制御

**ボーダー半径:**
- \`--radius-sm\`: 4px（ボタン等）
- \`--radius-md\`: 6px（カード等）
- \`--radius-lg\`: 10px（モーダル等）
- \`--radius-xl\`: 14px（大きなパネル等）`,
  },
  // Button
  {
    keywords: ['ボタン', 'button', 'btn'],
    question: 'Buttonの使い方は？',
    answer: `\`\`\`tsx
import { Button } from '../components/atoms'
import { Icon } from '../components/Icon'

<Button variant="primary" size="md" onClick={fn}>ボタン</Button>
<Button variant="ai"><Icon name="spark" size={14} />AI 分析</Button>
\`\`\`

**バリアント:** default, primary, ai, vec, danger, ghost, outline
**サイズ:** xs, sm, md, lg`,
  },
  // Badge
  {
    keywords: ['バッジ', 'badge', 'ラベル', 'ステータス'],
    question: 'Badgeの使い方は？',
    answer: `\`\`\`tsx
import { Badge } from '../components/atoms'

<Badge variant="blue">ラベル</Badge>
<Badge>承認済</Badge>  // ステータス自動配色
\`\`\`

**バリアント:** gray, blue, green, amber, red, ai, vec
ステータス文字列（承認済、レビュー待等）は自動で色が付きます。`,
  },
  // Card
  {
    keywords: ['カード', 'card', 'section'],
    question: 'Card / SectionCardの使い方は？',
    answer: `\`\`\`tsx
import { Card, SectionCard } from '../components/atoms'

<Card className="p-4">コンテンツ</Card>

<SectionCard title="セクション名" action={<Button>操作</Button>}>
  コンテンツ
</SectionCard>
\`\`\`

Cardは汎用ラッパー、SectionCardは見出し付きのグループ化に使用します。`,
  },
  // シャドウ
  {
    keywords: ['シャドウ', 'shadow', '影'],
    question: 'シャドウトークンは？',
    answer: `**シャドウトークン:**
- \`--shadow-xs\` — ボタン・バッジ等の微弱な浮き
- \`--shadow-sm\` — カード・ドロップダウン
- \`--shadow-md\` — モーダル・ポップオーバー
- \`--shadow-lg\` — フローティングパネル・ダイアログ

テーマによって強度・色味が変わります。Dark系テーマでは黒ベースの強いシャドウになります。`,
  },
  // Modal
  {
    keywords: ['モーダル', 'modal', 'ダイアログ', 'dialog'],
    question: 'Modalの使い方は？',
    answer: `\`\`\`tsx
import { Modal } from '../components/molecules'
import { Button } from '../components/atoms'

<Modal open={isOpen} onClose={() => setOpen(false)} title="確認">
  <p>本文</p>
  <footer>
    <Button variant="default">キャンセル</Button>
    <Button variant="danger">削除</Button>
  </footer>
</Modal>
\`\`\`

ESCキーとオーバーレイクリックで閉じます。`,
  },
  // Icon
  {
    keywords: ['アイコン', 'icon', 'lucide'],
    question: 'アイコンの使い方は？',
    answer: `\`\`\`tsx
import { Icon } from '../components/Icon'

<Icon name="dashboard" size={20} />
<Icon name="spark" size={14} className="text-ai-col" />
\`\`\`

Lucide Reactベース。37種類対応: dashboard, list, plus, search, vecSearch, spark, embed, trash, download, upload, copy, refresh, warning, info 等。
一覧は Components > Atoms > Icon の Gallery ストーリーで確認できます。`,
  },
  // Atomic Design
  {
    keywords: ['atomic', 'atom', 'molecule', 'organism', 'コンポーネント構成', '分類'],
    question: 'Atomic Designの使い分けは？',
    answer: `MatlensはAtomic Designの3層を採用:

**Atoms（原子）** — 単機能の最小単位
Button, Badge, Card, Input, Select, Textarea, Checkbox, UnitInput, FormGroup, Divider, ProgressBar, Typing, Kbd

**Molecules（分子）** — Atomsの組み合わせ
Modal, ExportModal, AIInsightCard, VecCard, KpiCard, SearchBox, FilterChip, MarkdownBubble

**Organisms（有機体）** — セクション単位の大きなUI
Topbar, Sidebar, Tooltip, SupportPanel

**判断基準:**
- 単一のHTML要素+スタイリング → Atom
- 2つ以上のAtomsの組み合わせ → Molecule
- ページの一区画を担う独立したUI → Organism`,
  },
  // Eng/CAE テーマ
  {
    keywords: ['eng', 'engineering', 'エンジニアリング', 'cae', '解析'],
    question: 'eng/caeテーマの特徴は？',
    answer: `**Eng テーマ (eng)**
- アクセントカラー: \`--accent: #00c896\`（グリーン）
- AI: \`--ai-col: #60a8e8\`（ブルー）
- Vec: \`--vec: #a0e060\`（ライムグリーン）
- フォント: UI/monoとも等幅（SF Mono, Consolas）
- 背景: ダーク系（#1a1f26）
- シャドウにグリーンのグロウあり

**CAE テーマ (cae)**
- アクセントカラー: \`--accent: #e89020\`（オレンジ）
- AI: \`--ai-col: #60c8f0\`（シアン）
- Vec: \`--vec: #30d8c0\`（ティール）
- フォント: UI/monoとも等幅（SF Mono, Consolas）
- 背景: 最もダーク（#0e1014）
- シャドウにオレンジのグロウあり
- 角丸が小さめ（radius-sm: 2px）

両テーマとも等幅フォントを採用し、数値データの視認性を重視しています。`,
  },
  // ペトリネット — 戻る動作 / Undo
  {
    keywords: ['ペトリネット', 'petri', 'petrinet', '戻る', '戻す', 'undo', '巻き戻し', '再加工', 'ワークフロー', 'pnml'],
    question: 'ペトリネットで工程を戻すことはできますか？',
    answer: `はい、2 通りの方法で「戻る」を表現できます。

**1. 物理的に意味のある逆方向トランジション（推奨）**
ペトリネットは理論上、順方向発火のみですが、逆向きに定義したトランジションを追加することで「戻る」をモデル化できます。

Matlens では既に \`t4\` 再加工 (\`p4 → p3\`) を定義済み:
- \`後加工済\` にあるトークンを \`一次加工済\` に戻す
- Row 1 上方の橙色の破線アーチとして視覚化
- 実務的には「後加工で不良が出たので一次加工段階からやり直す」工程を表す

**2. UI レベルの Undo（「1 手戻る」ボタン）**
ワークフローページ上部の \`1 手戻る\` ボタンで直前の操作を取り消せます:
- 最大 20 手まで履歴を保持
- \`fire\` / \`サンプル追加\` の両方に対応
- \`reset\` で履歴がクリアされる

**注意:** 破壊試験後のような物理的に不可逆な工程は、そもそも逆方向トランジションを定義していないので戻せません。これはペトリネット設計上の意図的な制約です。

**PNML 出力:**
PNML (ISO/IEC 15909-2) にエクスポートすれば PIPE・GreatSPN 等で到達可能性解析・デッドロック検出が行えます。`,
  },
]

export function searchFaq(query: string): FaqEntry | null {
  const q = query.toLowerCase()
  let bestMatch: FaqEntry | null = null
  let bestScore = 0

  for (const entry of FAQ_DATABASE) {
    let score = 0
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  return bestScore > 0 ? bestMatch : null
}
