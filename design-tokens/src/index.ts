/**
 * Matlens Design Tokens — バレルエクスポート
 *
 * このモジュールが単一のソースオブトゥルース。
 * Figma プラグイン (`figma-plugin/code.ts`) と JSON 生成スクリプト
 * (`scripts/generate-tokens-json.ts`) はここからインポートする。
 */

export * from './types.ts';
export { COLOR_TOKENS } from './colorTokens.ts';
export { SPACING_TOKENS, RADIUS_TOKENS } from './sizeTokens.ts';
export { TEXT_STYLES } from './textStyles.ts';
export { SHADOW_TOKENS } from './shadowStyles.ts';
