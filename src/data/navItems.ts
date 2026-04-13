import type { NavItem } from '../types';

export const STORYBOOK_URL = 'https://matlens-storybook.vercel.app';


export const NAV_ITEMS: NavItem[] = [
  { section: '概要', sectionEn: 'Overview' },
  { id:'dash',    label:'ダッシュボード',    labelEn:'Dashboard',    icon:'dashboard' },
  { id:'list',    label:'材料データ一覧',    labelEn:'Material List', icon:'list',    badge: true },
  { id:'catalog', label:'材料カタログ',      labelEn:'Catalog',      icon:'embed' },
  { section: 'データ入力', sectionEn: 'Data Entry' },
  { id:'new',     label:'新規登録',         labelEn:'New Entry',    icon:'plus' },
  { section: 'ワークフロー', sectionEn: 'Workflow' },
  { id:'petri',   label:'試験フロー可視化', labelEn:'Workflow Viz', icon:'workflow' },
  { id:'bayes',   label:'ベイズ最適化',    labelEn:'Bayesian Opt', icon:'spark',   badgeLabel:'AI', badgeVariant:'ai', cls:'ai-nav' },
  { id:'simulate',label:'経験式シミュレーション', labelEn:'Simulation', icon:'info' },
  { section: 'デジタル解析', sectionEn: 'Digital Analysis' },
  { id:'crystal',    label:'結晶構造 3D',             labelEn:'Crystal 3D',       icon:'atom', badgeLabel:'3D', badgeVariant:'vec' },
  { id:'timeline',   label:'加工タイムライン',       labelEn:'Process Timeline', icon:'report' },
  { id:'overlay',    label:'予測 vs 実績',            labelEn:'Prediction vs Actual', icon:'similar' },
  { id:'multimodal', label:'マルチスケールビューア',  labelEn:'Multiscale Viewer', icon:'embed' },
  { section: 'AI 分析・検索', sectionEn: 'AI Analysis' },
  { id:'vsearch', label:'意味検索',         labelEn:'Semantic Search', icon:'vecSearch', badgeLabel:'AI', badgeVariant:'vec', cls:'vec-nav' },
  { id:'rag',     label:'AI チャット',      labelEn:'AI Chat',     icon:'rag',     badgeLabel:'AI',  badgeVariant:'ai',  cls:'ai-nav' },
  { id:'sim',     label:'類似材料を比較',   labelEn:'Similar',     icon:'similar' },
  { section: 'ヘルプ・情報', sectionEn: 'Help & Info' },
  { id:'help',    label:'ヘルプ・用語集',   labelEn:'Help / Glossary', icon:'help' },
  { id:'about',   label:'技術スタック',     labelEn:'Tech Stack',  icon:'about' },
  { section: '開発者向け', sectionEn: 'Developer' },
  { id:'api',     label:'API テスト',       labelEn:'API Test',    icon:'scan',    badgeLabel:'Dev', badgeVariant:'vec' },
  { id:'tests',   label:'テストスイート',   labelEn:'Test Suite',  icon:'check',   badgeLabel:'Dev', badgeVariant:'green' },
  { id:'uxdesign',label:'UX設計ノート',     labelEn:'UX Notes',    icon:'info' },
  { section: '設定', sectionEn: 'Settings' },
  { id:'settings',label:'カテゴリ・バッチ管理', labelEn:'Categories & Batches', icon:'settings' },
];

export const SUPPORT_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'help', label: 'ヘルプ', icon: 'help' },
  { id: 'news', label: 'お知らせ', icon: 'spark' },
  { id: 'faq',  label: 'Q&A',   icon: 'info' },
  { id: 'ai',   label: 'AI設定', icon: 'ai' },
];
