import type { ShadowToken } from './types.ts';

/**
 * シャドウトークン — Figma Effect Style として登録される
 *
 * 現在は light テーマベースの単一セットのみ。
 * dark/eng/cae の強めのシャドウは今後 Figma 側で追加する (TODO)。
 */
export const SHADOW_TOKENS: ShadowToken[] = [
  {
    name: 'Matlens/Shadow/XS',
    description: 'ボタン・バッジ (微弱な浮き)',
    offsetY: 1,
    blur: 2,
    alpha: 0.06,
  },
  {
    name: 'Matlens/Shadow/SM',
    description: 'カード・ドロップダウン',
    offsetY: 2,
    blur: 6,
    alpha: 0.08,
  },
  {
    name: 'Matlens/Shadow/MD',
    description: 'モーダル・ポップオーバー',
    offsetY: 4,
    blur: 16,
    alpha: 0.10,
  },
  {
    name: 'Matlens/Shadow/LG',
    description: 'フローティングパネル',
    offsetY: 8,
    blur: 36,
    alpha: 0.13,
  },
];
