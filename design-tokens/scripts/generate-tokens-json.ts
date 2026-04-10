/**
 * Matlens Tokens Studio JSON 生成スクリプト
 *
 * `design-tokens/src/` のトークン定義を読み込み、Figma Tokens Studio
 * プラグインで import できる形式の JSON を `design-tokens/tokens.json`
 * に書き出す。
 *
 * 実行:
 *   node design-tokens/scripts/generate-tokens-json.ts
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  COLOR_TOKENS,
  SPACING_TOKENS,
  RADIUS_TOKENS,
  TEXT_STYLES,
  SHADOW_TOKENS,
  THEME_IDS,
  type ThemeId,
} from '../src/index.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, '..', 'tokens.json');

// Tokens Studio 形式のエントリ型
interface TokenValue {
  value: string | number | ShadowValue[];
  type: string;
  description?: string;
}

interface ShadowValue {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  type: 'dropShadow';
}

type TokenSet = Record<string, TokenValue | Record<string, TokenValue>>;

/**
 * ドット区切りのパスを Tokens Studio のネストした構造に展開する。
 * 例: `bg/base` → `{ bg: { base: {...} } }`
 */
function setNested(obj: Record<string, any>, path: string, value: TokenValue): void {
  const parts = path.split('/');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function buildThemeSet(themeId: ThemeId): TokenSet {
  const set: TokenSet = {};

  // Colors
  const colors: Record<string, any> = {};
  for (const token of COLOR_TOKENS) {
    setNested(colors, token.name, {
      value: token.values[themeId],
      type: 'color',
      description: token.description,
    });
  }
  set.color = colors;

  // Spacing (共通値なので light のみに入れるのが正確だが、全テーマで同じ値を出力)
  const spacing: Record<string, TokenValue> = {};
  for (const token of SPACING_TOKENS) {
    const key = token.name.replace('spacing/', '');
    spacing[key] = {
      value: String(token.value),
      type: 'spacing',
      description: token.description,
    };
  }
  set.spacing = spacing;

  // Border radius
  const borderRadius: Record<string, TokenValue> = {};
  for (const token of RADIUS_TOKENS) {
    const key = token.name.replace('radius/', '');
    borderRadius[key] = {
      value: String(token.values[themeId]),
      type: 'borderRadius',
      description: token.description,
    };
  }
  set.borderRadius = borderRadius;

  return set;
}

function buildGlobalSet(): TokenSet {
  const set: TokenSet = {};

  // Box Shadow (現状は light テーマ値を全テーマで使用)
  const boxShadow: Record<string, TokenValue> = {};
  for (const token of SHADOW_TOKENS) {
    const key = token.name.replace('Matlens/Shadow/', '').toLowerCase();
    boxShadow[key] = {
      value: [
        {
          x: 0,
          y: token.offsetY,
          blur: token.blur,
          spread: 0,
          color: `rgba(0,20,60,${token.alpha})`,
          type: 'dropShadow',
        },
      ],
      type: 'boxShadow',
      description: token.description,
    };
  }
  set.boxShadow = boxShadow;

  // Typography (fontSize + typography composite)
  const fontSize: Record<string, TokenValue> = {};
  const typography: Record<string, TokenValue> = {};
  for (const style of TEXT_STYLES) {
    const key = style.name.replace('Matlens/', '').replace('/', '-');
    fontSize[key] = {
      value: String(style.fontSize),
      type: 'fontSizes',
      description: style.description,
    };
    typography[key] = {
      value: {
        fontFamily: '{fontFamilies.ui}',
        fontWeight: style.fontWeight,
        fontSize: String(style.fontSize),
        lineHeight: String(style.lineHeightRatio),
      } as any,
      type: 'typography',
      description: style.description,
    };
  }
  set.fontSize = fontSize;
  set.typography = typography;

  // Font families (light 固定、eng/cae は等幅)
  set.fontFamilies = {
    ui: {
      value: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo', Arial, sans-serif",
      type: 'fontFamilies',
      description: 'UI テキスト用',
    },
    mono: {
      value: "'SFMono-Regular', Consolas, 'Courier New', monospace",
      type: 'fontFamilies',
      description: '等幅フォント',
    },
  };

  return set;
}

function buildMetadata() {
  return {
    $themes: THEME_IDS.map(id => ({
      id,
      name: id === 'eng' ? 'Engineering' : id === 'cae' ? 'CAE' : id === 'dark' ? 'Dark' : 'Light',
      selectedTokenSets: {
        [id]: 'enabled',
        global: 'source',
      },
      group: 'Theme',
    })),
    $metadata: {
      tokenSetOrder: [...THEME_IDS, 'global'],
    },
  };
}

function main(): void {
  const output = {
    global: buildGlobalSet(),
    ...Object.fromEntries(THEME_IDS.map(id => [id, buildThemeSet(id)])),
    ...buildMetadata(),
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`✅ Wrote ${outputPath}`);
  console.log(
    `   - ${COLOR_TOKENS.length} colors × ${THEME_IDS.length} modes`,
  );
  console.log(
    `   - ${SPACING_TOKENS.length + RADIUS_TOKENS.length} size tokens`,
  );
  console.log(`   - ${TEXT_STYLES.length} text styles`);
  console.log(`   - ${SHADOW_TOKENS.length} shadow effects`);
}

main();
