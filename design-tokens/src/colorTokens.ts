import type { ColorToken } from './types.ts';

/**
 * Matlens カラートークン — 単一ソース
 *
 * Figma Variables / Tokens Studio / Storybook ドキュメントのすべてが
 * この配列を参照する。追加・変更はここを編集するだけで全環境に反映される。
 *
 * `src/index.css` の `[data-theme="*"]` セクションと常に一致させること。
 * 不一致が疑われる場合は `scripts/validate.ts` (TODO) で整合性チェックできる。
 */
export const COLOR_TOKENS: ColorToken[] = [
  // ───── Role colors ──────────────────────────────────────────
  {
    name: 'accent',
    description: 'プライマリアクセント',
    values: { light: '#004590', dark: '#5a9ae0', eng: '#00c896', cae: '#e89020' },
  },
  {
    name: 'accent-hover',
    description: 'ホバー時アクセント',
    values: { light: '#003070', dark: '#78b0ec', eng: '#00e0aa', cae: '#f0a838' },
  },
  {
    name: 'accent-dim',
    description: 'アクセント薄色背景',
    values: { light: '#dce8f7', dark: '#0e1e36', eng: '#0d2920', cae: '#201608' },
  },
  {
    name: 'accent-mid',
    description: 'アクセント中間色',
    values: { light: '#1a6bc0', dark: '#5a9ae0', eng: '#00c896', cae: '#e89020' },
  },

  // ───── AI ───────────────────────────────────────────────────
  {
    name: 'ai-col',
    description: 'AI 機能カラー',
    values: { light: '#3b35a0', dark: '#9a92f0', eng: '#60a8e8', cae: '#60c8f0' },
  },
  {
    name: 'ai-dim',
    description: 'AI 薄色背景',
    values: { light: '#ebebfa', dark: '#1a1830', eng: '#0e1a28', cae: '#0c1820' },
  },
  {
    name: 'ai-mid',
    description: 'AI 中間色',
    values: { light: '#5c56cc', dark: '#9a92f0', eng: '#60a8e8', cae: '#60c8f0' },
  },

  // ───── Vector search ────────────────────────────────────────
  {
    name: 'vec',
    description: 'ベクトル検索カラー',
    values: { light: '#0a6657', dark: '#38d0b0', eng: '#a0e060', cae: '#30d8c0' },
  },
  {
    name: 'vec-dim',
    description: 'ベクトル薄色背景',
    values: { light: '#d8f0eb', dark: '#082420', eng: '#101c08', cae: '#081c18' },
  },
  {
    name: 'vec-mid',
    description: 'ベクトル中間色',
    values: { light: '#0f8f78', dark: '#38d0b0', eng: '#a0e060', cae: '#30d8c0' },
  },

  // ───── Status ───────────────────────────────────────────────
  {
    name: 'ok',
    description: '成功・完了',
    values: { light: '#1e6b0f', dark: '#6cc850', eng: '#5cc840', cae: '#60c840' },
  },
  {
    name: 'ok-dim',
    description: '成功薄色背景',
    values: { light: '#e4f3de', dark: '#0e1f08', eng: '#0e1e08', cae: '#0e1e08' },
  },
  {
    name: 'warn',
    description: '警告',
    values: { light: '#7a4b00', dark: '#f0b040', eng: '#e8b040', cae: '#f0a030' },
  },
  {
    name: 'warn-dim',
    description: '警告薄色背景',
    values: { light: '#fdf0d8', dark: '#201600', eng: '#1a1400', cae: '#180c00' },
  },
  {
    name: 'err',
    description: 'エラー・危険',
    values: { light: '#8b1a1a', dark: '#f06060', eng: '#f05050', cae: '#f05840' },
  },
  {
    name: 'err-dim',
    description: 'エラー薄色背景',
    values: { light: '#fdeaea', dark: '#200808', eng: '#1e0808', cae: '#1c0808' },
  },

  // ───── Background ───────────────────────────────────────────
  {
    name: 'bg/base',
    description: 'ページ背景',
    values: { light: '#eef0f3', dark: '#10141c', eng: '#1a1f26', cae: '#0e1014' },
  },
  {
    name: 'bg/surface',
    description: 'カード・パネル背景',
    values: { light: '#ffffff', dark: '#181d28', eng: '#222830', cae: '#14181e' },
  },
  {
    name: 'bg/raised',
    description: '浮き上がり要素',
    values: { light: '#f5f6f8', dark: '#1f2535', eng: '#2a3040', cae: '#1c2028' },
  },
  {
    name: 'bg/sunken',
    description: '沈み込み要素',
    values: { light: '#e4e6ea', dark: '#0c1018', eng: '#141820', cae: '#0a0c10' },
  },
  {
    name: 'bg/hover',
    description: 'ホバー状態',
    values: { light: '#e8eef7', dark: '#232c3e', eng: '#2e3848', cae: '#1e2430' },
  },
  {
    name: 'bg/active',
    description: 'アクティブ状態',
    values: { light: '#d4e2f4', dark: '#1a2d4a', eng: '#1a2e48', cae: '#142030' },
  },

  // ───── Text ─────────────────────────────────────────────────
  {
    name: 'text/hi',
    description: '高コントラスト (見出し)',
    values: { light: '#0d1520', dark: '#e8f0ff', eng: '#d8eaf8', cae: '#f0ece4' },
  },
  {
    name: 'text/md',
    description: '中コントラスト (本文)',
    values: { light: '#3a4554', dark: '#a8bcd8', eng: '#92b0cc', cae: '#b8a898' },
  },
  {
    name: 'text/lo',
    description: '低コントラスト (補助)',
    values: { light: '#6b7a8d', dark: '#6e84a0', eng: '#5e7890', cae: '#6e6058' },
  },

  // ───── Border ───────────────────────────────────────────────
  {
    name: 'border/focus',
    description: 'フォーカスリング',
    values: { light: '#0050AA', dark: '#5a9eff', eng: '#00c896', cae: '#e89020' },
  },

  // ───── UI chrome ────────────────────────────────────────────
  {
    name: 'topbar-bg',
    description: 'トップバー背景',
    values: { light: '#1e3050', dark: '#0c1018', eng: '#141820', cae: '#0a0c10' },
  },
  {
    name: 'sidebar-bg',
    description: 'サイドバー背景',
    values: { light: '#ffffff', dark: '#181d28', eng: '#1a1f26', cae: '#0e1014' },
  },
  {
    name: 'tag-surface',
    description: 'タグ背景',
    values: { light: '#e8ebef', dark: '#1f2535', eng: '#1a2028', cae: '#181c20' },
  },
];
