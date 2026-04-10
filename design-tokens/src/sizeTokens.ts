import type { SpacingToken, RadiusToken } from './types.ts';

/**
 * スペーシングトークン — Tailwind のデフォルトスケールに準拠
 *
 * 値はすべてのテーマで共通 (テーマによって密度は変えない方針)。
 * `0.5` / `1.5` / `2.5` はコンパクトな間隔調整用。
 */
export const SPACING_TOKENS: SpacingToken[] = [
  { name: 'spacing/0.5', value: 2, description: '最小間隔 (アイコン周辺)' },
  { name: 'spacing/1', value: 4, description: '極小間隔' },
  { name: 'spacing/1.5', value: 6, description: '小間隔' },
  { name: 'spacing/2', value: 8, description: 'コンパクト' },
  { name: 'spacing/2.5', value: 10 },
  { name: 'spacing/3', value: 12 },
  { name: 'spacing/4', value: 16, description: '標準 (1rem)' },
  { name: 'spacing/5', value: 20 },
  { name: 'spacing/6', value: 24, description: 'セクション間' },
  { name: 'spacing/8', value: 32 },
  { name: 'spacing/10', value: 40 },
  { name: 'spacing/12', value: 48, description: '大セクション間' },
];

/**
 * 角丸トークン — テーマごとに微調整
 *
 * light/dark は柔らかめ、eng は少し小さく、cae はさらに小さく鋭利な印象。
 */
export const RADIUS_TOKENS: RadiusToken[] = [
  {
    name: 'radius/sm',
    description: '小要素 (ボタン等)',
    values: { light: 4, dark: 4, eng: 3, cae: 2 },
  },
  {
    name: 'radius/md',
    description: 'カード等',
    values: { light: 6, dark: 6, eng: 5, cae: 4 },
  },
  {
    name: 'radius/lg',
    description: 'モーダル等',
    values: { light: 10, dark: 10, eng: 8, cae: 6 },
  },
  {
    name: 'radius/xl',
    description: '大パネル',
    values: { light: 14, dark: 14, eng: 12, cae: 10 },
  },
];
