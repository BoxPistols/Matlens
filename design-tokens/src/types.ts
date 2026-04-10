/**
 * Matlens Design Tokens — 型定義
 *
 * 単一ソースとして `src/*.ts` の各トークンファイルがこれらの型を使う。
 * Figma プラグイン (`figma-plugin/code.ts`) と Tokens Studio 用 JSON 生成
 * スクリプト (`scripts/generate-tokens-json.ts`) が同じ型をインポートする。
 */

export const THEME_IDS = ['light', 'dark', 'eng', 'cae'] as const;
export type ThemeId = typeof THEME_IDS[number];

/**
 * テーマごとに値が変わるトークンは `ThemeMap<T>` で 4 テーマ分を持つ。
 * 同じ値を複数テーマで共有する場合は `constantThemeMap(value)` を使う。
 */
export type ThemeMap<T> = Record<ThemeId, T>;

export interface ColorToken {
  /** Figma Variables 上のパス。スラッシュ区切りでグループ化される (例: `bg/base`)。 */
  name: string;
  /** Tokens Studio の description / Figma Variable の説明文 */
  description?: string;
  /** テーマごとの HEX 値または `rgba(...)` 文字列 */
  values: ThemeMap<string>;
}

export interface SpacingToken {
  /** Figma Variables 上のパス (例: `spacing/4`) */
  name: string;
  /** px 単位の数値。Tailwind スケールに準拠 */
  value: number;
  description?: string;
}

export interface RadiusToken {
  name: string;
  description?: string;
  /** テーマごとの px 値。eng/cae は小さめに設定 */
  values: ThemeMap<number>;
}

export type FontWeight = 'Regular' | 'Medium' | 'Semi Bold' | 'Bold';

export interface TextStyle {
  /** Figma Text Style 名 (例: `Matlens/Heading/H1`) */
  name: string;
  description: string;
  fontSize: number;
  fontWeight: FontWeight;
  /** line-height を倍率で指定。Figma 側では fontSize × ratio の絶対 px に変換される */
  lineHeightRatio: number;
}

export interface ShadowToken {
  name: string;
  description: string;
  offsetY: number;
  blur: number;
  alpha: number;
}

/** 単一の色をすべてのテーマに割り当てるヘルパー */
export function constantThemeMap<T>(value: T): ThemeMap<T> {
  return { light: value, dark: value, eng: value, cae: value };
}
