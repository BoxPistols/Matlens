import type { StoryGuide } from './chatSupportTypes'

export const STORY_GUIDE_MAP: Record<string, StoryGuide> = {
  'Guide/Introduction': {
    title: 'Introduction',
    tips: [
      'テーマセレクターで4テーマを切り替えて全体の雰囲気を確認しましょう',
      'DesignTokensカテゴリで個別のトークン値を確認できます',
    ],
    relatedStories: ['Guide/HowToUse', 'Design Philosophy/Overview'],
  },
  'Guide/HowToUse': {
    title: 'How To Use',
    tips: [
      'Controlsパネルで各プロパティをリアルタイムに変更できます',
      'Docsタブでコンポーネントの自動生成ドキュメントを確認できます',
    ],
    relatedStories: ['Guide/Introduction', 'Guide/ComponentDevelopment'],
  },
  'DesignTokens/Color': {
    title: 'Color Tokens',
    tips: [
      'CSS変数 var(--accent) 等を使ってカラーを参照してください',
      'テーマを切り替えると各カラーが自動で変わります',
    ],
    codeRef: 'src/index.css — [data-theme] セクション',
    relatedStories: ['DesignTokens/Typography', 'DesignTokens/Shadows'],
  },
  'DesignTokens/Typography': {
    title: 'Typography',
    tips: [
      'eng/caeテーマではUI用フォントも等幅になります',
      'ベースフォントサイズは14px (1rem)です',
    ],
    codeRef: 'src/index.css — --font-ui, --font-mono',
    relatedStories: ['DesignTokens/Color', 'DesignTokens/Spacing'],
  },
  'DesignTokens/Spacing': {
    title: 'Spacing',
    tips: [
      'Tailwind CSSのスペーシングスケールに準拠しています',
      'marginは親が制御、paddingは自身が制御する責任分離を守ってください',
    ],
    relatedStories: ['DesignTokens/Shadows', 'Design Philosophy/ComponentDesignGuide'],
  },
  'DesignTokens/Shadows': {
    title: 'Shadows',
    tips: [
      'テーマでシャドウの強度が変わります。Darkテーマでは深い黒ベースになります',
      'Lightテーマでは淡いブルーグレーのシャドウが適用されます',
    ],
    relatedStories: ['DesignTokens/Color', 'DesignTokens/Spacing'],
  },
  'Components/Atoms/Button': {
    title: 'Button',
    tips: [
      '7バリアント: default, primary, ai, vec, danger, ghost, outline',
      'アイコン付きの場合は<Icon>をchildrenに含めます',
    ],
    codeRef: 'src/components/atoms.tsx — Button',
    relatedStories: ['Components/Atoms/Icon', 'Components/Atoms/Badge'],
  },
  'Components/Atoms/Badge': {
    title: 'Badge',
    tips: [
      'ステータス文字列（承認済、レビュー待等）は自動配色されます',
      'variant propで色を明示指定することも可能です',
    ],
    codeRef: 'src/components/atoms.tsx — Badge',
    relatedStories: ['Components/Atoms/Button'],
  },
  'Components/Atoms/FormControls': {
    title: 'Form Controls',
    tips: [
      'UnitInputは単位付き入力（HV, MPa, GPa等）に使います',
      'FormGroupでラベル・ヒント・エラーを統一的に表示します',
    ],
    codeRef: 'src/components/atoms.tsx — Input, Select, Textarea, Checkbox, UnitInput, FormGroup',
    relatedStories: ['Patterns/FormLayout'],
  },
  'Components/Molecules/DataCards': {
    title: 'Data Cards',
    tips: [
      'AIInsightCardはloading propで読み込み状態を表示できます',
      'KpiCardはdelta/deltaUpでトレンド表示が可能です',
    ],
    codeRef: 'src/components/molecules.tsx',
    relatedStories: ['Patterns/Dashboard', 'Patterns/SearchResults'],
  },
  'Components/Organisms/Sidebar': {
    title: 'Sidebar',
    tips: [
      'collapsed propで折り畳み状態を制御します',
      'embStatus propでベクトル検索の状態を表示します',
    ],
    codeRef: 'src/components/Sidebar.tsx',
    relatedStories: ['Components/Organisms/Topbar'],
  },
  'Patterns/Dashboard': {
    title: 'Dashboard Pattern',
    tips: [
      'KpiCard + AIInsightCard + SectionCardの典型的な組み合わせ例です',
      '実プロダクトのダッシュボード画面を模しています',
    ],
    relatedStories: ['Components/Molecules/DataCards', 'Patterns/SearchResults'],
  },
  'Patterns/FormLayout': {
    title: 'Form Layout Pattern',
    tips: [
      'SectionCardでフォームをグルーピングする推奨パターンです',
      'UnitInputで材料特性値を入力する実用例です',
    ],
    relatedStories: ['Components/Atoms/FormControls', 'Patterns/Dashboard'],
  },
  'Patterns/SearchResults': {
    title: 'Search Results Pattern',
    tips: [
      'SearchBox + FilterChip + VecCardの組み合わせ例です',
      'コサイン類似度スコアの表示パターンを含みます',
    ],
    relatedStories: ['Components/Molecules/DataCards', 'Patterns/Dashboard'],
  },
  'Guide/ForDesigners': {
    title: 'For Designers',
    tips: [
      'Figma↔コード対応表でFigmaの要素名とReactコンポーネントの対応を確認できます',
      'デザインレビューチェックリストを使って品質を担保しましょう',
    ],
    relatedStories: ['Guide/CssReference', 'DesignTokens/Color'],
  },
  'Guide/ComponentDevelopment': {
    title: 'Component Development',
    tips: [
      '新コンポーネントは分類→実装→ストーリー→テストの4ステップで追加します',
      'Atom/Molecule/Organismの分類基準を確認してください',
    ],
    relatedStories: ['Design Philosophy/ComponentDesignGuide', 'Guide/HowToUse'],
  },
  'Guide/AIAndDesignSystem': {
    title: 'AI & Design System',
    tips: [
      'AI機能には--ai-col、ベクトル検索には--vecを一貫して使用します',
      '右下のFABボタンからChatSupportを使えます',
    ],
    relatedStories: ['Components/Molecules/DataCards', 'Guide/Introduction'],
  },
  'Guide/CssReference': {
    title: 'CSS Reference',
    tips: [
      'CSS変数の全一覧（40+トークン）を確認できます',
      'Lightテーマの値を基準に、テーマ切替で全値が変わります',
    ],
    codeRef: 'src/index.css — 全テーマ定義',
    relatedStories: ['DesignTokens/Color', 'Guide/ForDesigners'],
  },
  'Design Philosophy/Overview': {
    title: 'Design Philosophy Overview',
    tips: [
      'Matlensの3原則: 信頼感（材料データの正確性）・革新性（AI/ベクトル検索）・共創（チーム横断のデータ共有）',
      'UI設計方針のデータ密度重視・コンテキスト保持を確認してください',
    ],
    relatedStories: ['Design Philosophy/ComponentDesignGuide', 'Guide/Introduction'],
  },
  'Design Philosophy/ComponentDesignGuide': {
    title: 'Component Design Guide',
    tips: [
      '6原則（間接化・カプセル化・制約・意味の符号化・合成・慣習）をDo/Don\'tで解説しています',
      'UIステートスタック（Empty/Loading/Error/Partial/Ideal）は全データ表示コンポーネントに適用してください',
    ],
    relatedStories: ['Design Philosophy/Overview', 'Guide/ComponentDevelopment'],
  },
  'Design Philosophy/TechnicalStack': {
    title: 'Technical Stack',
    tips: [
      'CSS変数トークンシステムの仕組みを図解しています',
      '4テーマの切替はdata-theme属性で行います',
    ],
    codeRef: 'src/index.css — [data-theme] セクション',
    relatedStories: ['Design Philosophy/Overview', 'DesignTokens/Color'],
  },
  'Components/Atoms/Card': {
    title: 'Card',
    tips: [
      'Card は汎用ラッパー、SectionCardは見出し付きグルーピング用です',
      'SectionCardにはaction propでヘッダーにボタンを配置できます',
    ],
    codeRef: 'src/components/atoms.tsx — Card, SectionCard',
    relatedStories: ['Patterns/Dashboard', 'Patterns/FormLayout'],
  },
  'Components/Atoms/Icon': {
    title: 'Icon',
    tips: [
      'Lucide Reactベースの37種類のアイコンに対応しています',
      'Galleryストーリーで全アイコンを一覧確認できます',
    ],
    codeRef: 'src/components/Icon.tsx',
    relatedStories: ['Components/Atoms/Button'],
  },
  'Components/Atoms/Misc': {
    title: 'Misc Components',
    tips: [
      'ProgressBar, Typing, Kbd, Divider等のユーティリティ系コンポーネントです',
      'Typingインジケーターはcolor propでAI/Vec/Accentの色を使い分けます',
    ],
    codeRef: 'src/components/atoms.tsx — ProgressBar, Typing, Kbd, Divider',
    relatedStories: ['Components/Atoms/Button', 'Patterns/Dashboard'],
  },
  'Components/Molecules/Modal': {
    title: 'Modal',
    tips: [
      'ESCキーとオーバーレイクリックで閉じます',
      'ExportModalはデータエクスポート用の特化ダイアログです',
    ],
    codeRef: 'src/components/molecules.tsx — Modal, ExportModal',
    relatedStories: ['Components/Atoms/Button'],
  },
  'Components/Organisms/Topbar': {
    title: 'Topbar',
    tips: [
      'テーマ切替・グローバル検索・ベクトル検索ステータスを表示します',
      'embStatus propでベクトル検索の状態を制御します',
    ],
    codeRef: 'src/components/Topbar.tsx',
    relatedStories: ['Components/Organisms/Sidebar'],
  },
  'Components/Organisms/Tooltip': {
    title: 'Tooltip',
    tips: [
      'ポータルベースで画面端での自動位置補正に対応しています',
      'ホバー500ms遅延で表示。4方向（top/bottom/left/right）の配置をサポート',
    ],
    codeRef: 'src/components/Tooltip.tsx',
    relatedStories: ['Components/Atoms/Button'],
  },
  'Components/Organisms/SupportPanel': {
    title: 'SupportPanel',
    tips: [
      'ヘルプ/FAQ/AI設定の3タブ構成です',
      'AppCtx（コンテキスト）が必要 — Decoratorで提供しています',
    ],
    codeRef: 'src/components/SupportPanel.tsx',
    relatedStories: ['Guide/AIAndDesignSystem'],
  },
}

export function getStoryGuide(storyTitle: string): StoryGuide | null {
  return STORY_GUIDE_MAP[storyTitle] || null
}
