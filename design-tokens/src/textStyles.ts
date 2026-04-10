import type { TextStyle } from './types.ts';

/**
 * Matlens テキストスタイル — Figma Text Style として登録される
 *
 * 最小フォントサイズは 12px。これ以下のサイズは使わない (アクセシビリティ方針)。
 * 14px をベース (1rem) として、16/17/19px で見出し、12/13px で補助的な情報。
 */
export const TEXT_STYLES: TextStyle[] = [
  {
    name: 'Matlens/Heading/H1',
    description: 'ダッシュボード大見出し',
    fontSize: 19,
    fontWeight: 'Bold',
    lineHeightRatio: 1.4,
  },
  {
    name: 'Matlens/Heading/H2',
    description: 'ページ見出し',
    fontSize: 17,
    fontWeight: 'Bold',
    lineHeightRatio: 1.4,
  },
  {
    name: 'Matlens/Heading/H3',
    description: 'セクション見出し',
    fontSize: 16,
    fontWeight: 'Bold',
    lineHeightRatio: 1.4,
  },
  {
    name: 'Matlens/Heading/Subhead',
    description: 'モーダル見出し',
    fontSize: 15,
    fontWeight: 'Semi Bold',
    lineHeightRatio: 1.4,
  },
  {
    name: 'Matlens/Body/Base',
    description: 'ベースフォント (1rem)',
    fontSize: 14,
    fontWeight: 'Regular',
    lineHeightRatio: 1.6,
  },
  {
    name: 'Matlens/Body/Default',
    description: '本文・入力フィールド',
    fontSize: 13,
    fontWeight: 'Regular',
    lineHeightRatio: 1.6,
  },
  {
    name: 'Matlens/Label/Nav',
    description: 'ナビ・フォームラベル',
    fontSize: 12,
    fontWeight: 'Medium',
    lineHeightRatio: 1.4,
  },
  {
    name: 'Matlens/Label/Badge',
    description: 'バッジ・補助ラベル',
    fontSize: 12,
    fontWeight: 'Semi Bold',
    lineHeightRatio: 1.2,
  },
  {
    name: 'Matlens/Code/Mono',
    description: 'コード・数値 (等幅想定)',
    fontSize: 13,
    fontWeight: 'Regular',
    lineHeightRatio: 1.5,
  },
];
