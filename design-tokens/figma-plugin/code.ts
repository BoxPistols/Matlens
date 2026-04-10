/**
 * Matlens Design Tokens — Figma Plugin entry
 *
 * `design-tokens/src/` のトークン定義をインポートし、Figma の
 * Variable Collection / Text Style / Effect Style として登録する。
 *
 * このファイルは `scripts/build-plugin.ts` で esbuild により `code.js` に
 * バンドルされる。Figma はバンドル済み JS を実行するので、importは
 * 解決済みの状態で Figma プラグインランタイムに渡される。
 */

import {
  COLOR_TOKENS,
  SPACING_TOKENS,
  RADIUS_TOKENS,
  TEXT_STYLES,
  SHADOW_TOKENS,
  THEME_IDS,
  type ThemeId,
  type ColorToken,
  type FontWeight,
} from '../src/index.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Figma プラグイン API は `figma` というグローバルを介して提供される。
// 型定義は `@figma/plugin-typings` を入れれば精緻化できるが、
// ここでは最小限の any で済ませて依存を減らす。
declare const figma: any;

// ────────────────────────────────────────────────────────────
// Color utilities
// ────────────────────────────────────────────────────────────
interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * HEX 文字列 (`#RRGGBB`) または `rgba(...)` 文字列を Figma API 用の RGBA に変換する。
 */
function parseColor(input: string): RGBA {
  const trimmed = input.trim();

  if (trimmed.startsWith('rgba')) {
    const match = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (!match) throw new Error(`Invalid rgba color: ${input}`);
    const parts = match[1].split(',').map(s => parseFloat(s.trim()));
    const [r, g, b, a = 1] = parts;
    return { r: r / 255, g: g / 255, b: b / 255, a };
  }

  const hex = trimmed.replace('#', '');
  if (hex.length !== 6) throw new Error(`Invalid hex color: ${input}`);
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255,
    a: 1,
  };
}

// ────────────────────────────────────────────────────────────
// Variable collections
// ────────────────────────────────────────────────────────────

/**
 * 4 テーマモードを持つ Variable Collection を作成する。
 * 返り値には各モードの ID が含まれるので、Variable 作成時に利用する。
 */
function createThemedCollection(name: string): {
  collection: any;
  modeIds: Record<ThemeId, string>;
} {
  const collection = figma.variables.createVariableCollection(name);

  // デフォルトモードを 'light' にリネーム
  collection.renameMode(collection.modes[0].modeId, 'light' satisfies ThemeId);

  const modeIds: Record<ThemeId, string> = {
    light: collection.modes[0].modeId,
    dark: collection.addMode('dark' satisfies ThemeId),
    eng: collection.addMode('eng' satisfies ThemeId),
    cae: collection.addMode('cae' satisfies ThemeId),
  };

  return { collection, modeIds };
}

function registerColorTokens(): void {
  const { collection, modeIds } = createThemedCollection('Color Tokens');

  for (const token of COLOR_TOKENS) {
    const variable = figma.variables.createVariable(token.name, collection.id, 'COLOR');
    if (token.description) variable.description = token.description;

    for (const themeId of THEME_IDS) {
      variable.setValueForMode(modeIds[themeId], parseColor(token.values[themeId]));
    }
  }
}

function registerSizeTokens(): void {
  const { collection, modeIds } = createThemedCollection('Size Tokens');

  // Spacing はテーマ間で共通値
  for (const token of SPACING_TOKENS) {
    const variable = figma.variables.createVariable(token.name, collection.id, 'FLOAT');
    if (token.description) variable.description = token.description;

    for (const themeId of THEME_IDS) {
      variable.setValueForMode(modeIds[themeId], token.value);
    }
  }

  // Radius はテーマごとに値が異なる
  for (const token of RADIUS_TOKENS) {
    const variable = figma.variables.createVariable(token.name, collection.id, 'FLOAT');
    if (token.description) variable.description = token.description;

    for (const themeId of THEME_IDS) {
      variable.setValueForMode(modeIds[themeId], token.values[themeId]);
    }
  }
}

// ────────────────────────────────────────────────────────────
// Text / Effect styles
// ────────────────────────────────────────────────────────────

const REQUIRED_FONT_WEIGHTS: readonly FontWeight[] = [
  'Regular',
  'Medium',
  'Semi Bold',
  'Bold',
];

async function registerTextStyles(): Promise<void> {
  // Figma は使用するフォントを事前に非同期で読み込む必要がある
  await Promise.all(
    REQUIRED_FONT_WEIGHTS.map(style =>
      figma.loadFontAsync({ family: 'Inter', style }),
    ),
  );

  for (const style of TEXT_STYLES) {
    const textStyle = figma.createTextStyle();
    textStyle.name = style.name;
    textStyle.description = style.description;
    textStyle.fontSize = style.fontSize;
    textStyle.fontName = { family: 'Inter', style: style.fontWeight };
    textStyle.lineHeight = {
      value: style.fontSize * style.lineHeightRatio,
      unit: 'PIXELS',
    };
  }
}

function registerShadowStyles(): void {
  for (const shadow of SHADOW_TOKENS) {
    const effectStyle = figma.createEffectStyle();
    effectStyle.name = shadow.name;
    effectStyle.description = shadow.description;
    effectStyle.effects = [
      {
        type: 'DROP_SHADOW',
        // light テーマのシャドウ色 (rgb(0, 20, 60) 系) をベースに、
        // alpha だけをトークンから取る
        color: { r: 0, g: 0.08, b: 0.24, a: shadow.alpha },
        offset: { x: 0, y: shadow.offsetY },
        radius: shadow.blur,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];
  }
}

// ────────────────────────────────────────────────────────────
// Entry point
// ────────────────────────────────────────────────────────────

function countByCategory(tokens: ColorToken[]): number {
  return tokens.length;
}

async function main(): Promise<void> {
  try {
    registerColorTokens();
    registerSizeTokens();
    registerShadowStyles();
    await registerTextStyles();

    const summary = [
      `カラー ${countByCategory(COLOR_TOKENS)}変数 × 4モード`,
      `サイズ ${SPACING_TOKENS.length + RADIUS_TOKENS.length}変数`,
      `テキスト ${TEXT_STYLES.length}スタイル`,
      `シャドウ ${SHADOW_TOKENS.length}スタイル`,
    ].join(', ');

    figma.notify(`✅ Matlens Design Tokens 登録完了: ${summary}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.notify(`❌ 登録失敗: ${message}`, { error: true, timeout: 8000 });
    console.error(error);
  } finally {
    figma.closePlugin();
  }
}

void main();
