// ============================================================
// Matlens Design Tokens — Figma Variables 登録スクリプト
// ============================================================
// 使い方:
//   1. Figmaで対象ファイルを開く
//   2. Menu → Plugins → Development → New Plugin...
//   3. 「Figma design」を選択 → 名前を入力 → Save
//   4. code.ts の中身をこのスクリプトの内容に置き換え
//   5. Run（▶）をクリック
//
//   または Plugins → Development → Open console でコンソールに貼り付け
// ============================================================

// --- Helper ---
function hex(h) {
  h = h.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    a: 1
  };
}

function rgba(r, g, b, a) {
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

// ============================================================
// 1. Variable Collection: Matlens Color Tokens (4 modes)
// ============================================================
const colorCollection = figma.variables.createVariableCollection('Color Tokens');
colorCollection.renameMode(colorCollection.modes[0].modeId, 'light');
const darkModeId = colorCollection.addMode('dark');
const engModeId = colorCollection.addMode('eng');
const caeModeId = colorCollection.addMode('cae');
const lightModeId = colorCollection.modes[0].modeId;

const colorTokens = [
  // Role Colors
  { name: 'accent',       light: '#004590', dark: '#5a9ae0', eng: '#00c896', cae: '#e89020' },
  { name: 'accent-hover', light: '#003070', dark: '#78b0ec', eng: '#00e0aa', cae: '#f0a838' },
  { name: 'accent-dim',   light: '#dce8f7', dark: '#0e1e36', eng: '#0d2920', cae: '#201608' },
  { name: 'accent-mid',   light: '#1a6bc0', dark: '#5a9ae0', eng: '#00c896', cae: '#e89020' },
  // AI
  { name: 'ai-col',  light: '#3b35a0', dark: '#9a92f0', eng: '#60a8e8', cae: '#60c8f0' },
  { name: 'ai-dim',  light: '#ebebfa', dark: '#1a1830', eng: '#0e1a28', cae: '#0c1820' },
  { name: 'ai-mid',  light: '#5c56cc', dark: '#9a92f0', eng: '#60a8e8', cae: '#60c8f0' },
  // Vector
  { name: 'vec',     light: '#0a6657', dark: '#38d0b0', eng: '#a0e060', cae: '#30d8c0' },
  { name: 'vec-dim', light: '#d8f0eb', dark: '#082420', eng: '#101c08', cae: '#081c18' },
  { name: 'vec-mid', light: '#0f8f78', dark: '#38d0b0', eng: '#a0e060', cae: '#30d8c0' },
  // Status
  { name: 'ok',       light: '#1e6b0f', dark: '#6cc850', eng: '#5cc840', cae: '#60c840' },
  { name: 'ok-dim',   light: '#e4f3de', dark: '#0e1f08', eng: '#0e1e08', cae: '#0e1e08' },
  { name: 'warn',     light: '#7a4b00', dark: '#f0b040', eng: '#e8b040', cae: '#f0a030' },
  { name: 'warn-dim', light: '#fdf0d8', dark: '#201600', eng: '#1a1400', cae: '#180c00' },
  { name: 'err',      light: '#8b1a1a', dark: '#f06060', eng: '#f05050', cae: '#f05840' },
  { name: 'err-dim',  light: '#fdeaea', dark: '#200808', eng: '#1e0808', cae: '#1c0808' },
  // Background
  { name: 'bg/base',    light: '#eef0f3', dark: '#10141c', eng: '#1a1f26', cae: '#0e1014' },
  { name: 'bg/surface', light: '#ffffff', dark: '#181d28', eng: '#222830', cae: '#14181e' },
  { name: 'bg/raised',  light: '#f5f6f8', dark: '#1f2535', eng: '#2a3040', cae: '#1c2028' },
  { name: 'bg/sunken',  light: '#e4e6ea', dark: '#0c1018', eng: '#141820', cae: '#0a0c10' },
  { name: 'bg/hover',   light: '#e8eef7', dark: '#232c3e', eng: '#2e3848', cae: '#1e2430' },
  { name: 'bg/active',  light: '#d4e2f4', dark: '#1a2d4a', eng: '#1a2e48', cae: '#142030' },
  // Text
  { name: 'text/hi', light: '#0d1520', dark: '#e8f0ff', eng: '#d8eaf8', cae: '#f0ece4' },
  { name: 'text/md', light: '#3a4554', dark: '#a8bcd8', eng: '#92b0cc', cae: '#b8a898' },
  { name: 'text/lo', light: '#6b7a8d', dark: '#6e84a0', eng: '#5e7890', cae: '#6e6058' },
  // Border
  { name: 'border/focus', light: '#0050AA', dark: '#5a9eff', eng: '#00c896', cae: '#e89020' },
  // UI
  { name: 'topbar-bg',  light: '#1e3050', dark: '#0c1018', eng: '#141820', cae: '#0a0c10' },
  { name: 'sidebar-bg', light: '#ffffff', dark: '#181d28', eng: '#1a1f26', cae: '#0e1014' },
  { name: 'tag-surface', light: '#e8ebef', dark: '#1f2535', eng: '#1a2028', cae: '#181c20' },
];

for (const t of colorTokens) {
  const v = figma.variables.createVariable(t.name, colorCollection.id, 'COLOR');
  v.setValueForMode(lightModeId, hex(t.light));
  v.setValueForMode(darkModeId, hex(t.dark));
  v.setValueForMode(engModeId, hex(t.eng));
  v.setValueForMode(caeModeId, hex(t.cae));
}

// ============================================================
// 2. Variable Collection: Spacing & Radius (4 modes)
// ============================================================
const sizeCollection = figma.variables.createVariableCollection('Size Tokens');
sizeCollection.renameMode(sizeCollection.modes[0].modeId, 'light');
const sizeDarkId = sizeCollection.addMode('dark');
const sizeEngId = sizeCollection.addMode('eng');
const sizeCaeId = sizeCollection.addMode('cae');
const sizeLightId = sizeCollection.modes[0].modeId;

// Spacing (same across all themes)
const spacingValues = [
  { name: 'spacing/0.5', value: 2 },
  { name: 'spacing/1',   value: 4 },
  { name: 'spacing/1.5', value: 6 },
  { name: 'spacing/2',   value: 8 },
  { name: 'spacing/2.5', value: 10 },
  { name: 'spacing/3',   value: 12 },
  { name: 'spacing/4',   value: 16 },
  { name: 'spacing/5',   value: 20 },
  { name: 'spacing/6',   value: 24 },
  { name: 'spacing/8',   value: 32 },
  { name: 'spacing/10',  value: 40 },
  { name: 'spacing/12',  value: 48 },
];

for (const s of spacingValues) {
  const v = figma.variables.createVariable(s.name, sizeCollection.id, 'FLOAT');
  v.setValueForMode(sizeLightId, s.value);
  v.setValueForMode(sizeDarkId, s.value);
  v.setValueForMode(sizeEngId, s.value);
  v.setValueForMode(sizeCaeId, s.value);
}

// Border Radius (varies by theme)
const radiusTokens = [
  { name: 'radius/sm', light: 4, dark: 4, eng: 3, cae: 2 },
  { name: 'radius/md', light: 6, dark: 6, eng: 5, cae: 4 },
  { name: 'radius/lg', light: 10, dark: 10, eng: 8, cae: 6 },
  { name: 'radius/xl', light: 14, dark: 14, eng: 12, cae: 10 },
];

for (const r of radiusTokens) {
  const v = figma.variables.createVariable(r.name, sizeCollection.id, 'FLOAT');
  v.setValueForMode(sizeLightId, r.light);
  v.setValueForMode(sizeDarkId, r.dark);
  v.setValueForMode(sizeEngId, r.eng);
  v.setValueForMode(sizeCaeId, r.cae);
}

// ============================================================
// 3. Text Styles
// ============================================================
const textStyles = [
  { name: 'Matlens/Heading/H1',     size: 19, weight: 700, lineHeight: 1.4, desc: 'ダッシュボード大見出し' },
  { name: 'Matlens/Heading/H2',     size: 17, weight: 700, lineHeight: 1.4, desc: 'ページ見出し' },
  { name: 'Matlens/Heading/H3',     size: 16, weight: 700, lineHeight: 1.4, desc: 'セクション見出し' },
  { name: 'Matlens/Heading/Subhead', size: 15, weight: 600, lineHeight: 1.4, desc: 'モーダル見出し' },
  { name: 'Matlens/Body/Base',      size: 14, weight: 400, lineHeight: 1.6, desc: 'ベースフォント (1rem)' },
  { name: 'Matlens/Body/Default',   size: 13, weight: 400, lineHeight: 1.6, desc: '本文・入力フィールド' },
  { name: 'Matlens/Label/Nav',      size: 12, weight: 500, lineHeight: 1.4, desc: 'ナビ・フォームラベル' },
  { name: 'Matlens/Label/Badge',    size: 12, weight: 600, lineHeight: 1.2, desc: 'バッジ・補助ラベル' },
  { name: 'Matlens/Code/Mono',      size: 13, weight: 400, lineHeight: 1.5, desc: 'コード・数値' },
];

async function createTextStyles() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  for (const t of textStyles) {
    const style = figma.createTextStyle();
    style.name = t.name;
    style.description = t.desc;
    style.fontSize = t.size;
    style.lineHeight = { value: t.size * t.lineHeight, unit: 'PIXELS' };

    const fontStyle =
      t.weight >= 700 ? 'Bold' :
      t.weight >= 600 ? 'Semi Bold' :
      t.weight >= 500 ? 'Medium' : 'Regular';

    if (t.name.includes('Code')) {
      // Mono style uses Inter for Figma compatibility
      style.fontName = { family: 'Inter', style: fontStyle };
    } else {
      style.fontName = { family: 'Inter', style: fontStyle };
    }
  }
}

// ============================================================
// 4. Effect Styles (Shadows)
// ============================================================
function createEffectStyles() {
  const shadows = [
    { name: 'Matlens/Shadow/XS', desc: 'ボタン・バッジ', effects: [{ type: 'DROP_SHADOW', color: { r: 0, g: 0.08, b: 0.24, a: 0.06 }, offset: { x: 0, y: 1 }, radius: 2, spread: 0, visible: true, blendMode: 'NORMAL' }] },
    { name: 'Matlens/Shadow/SM', desc: 'カード・ドロップダウン', effects: [{ type: 'DROP_SHADOW', color: { r: 0, g: 0.08, b: 0.24, a: 0.08 }, offset: { x: 0, y: 2 }, radius: 6, spread: 0, visible: true, blendMode: 'NORMAL' }] },
    { name: 'Matlens/Shadow/MD', desc: 'モーダル・ポップオーバー', effects: [{ type: 'DROP_SHADOW', color: { r: 0, g: 0.08, b: 0.24, a: 0.10 }, offset: { x: 0, y: 4 }, radius: 16, spread: 0, visible: true, blendMode: 'NORMAL' }] },
    { name: 'Matlens/Shadow/LG', desc: 'フローティングパネル', effects: [{ type: 'DROP_SHADOW', color: { r: 0, g: 0.08, b: 0.24, a: 0.13 }, offset: { x: 0, y: 8 }, radius: 36, spread: 0, visible: true, blendMode: 'NORMAL' }] },
  ];

  for (const s of shadows) {
    const style = figma.createEffectStyle();
    style.name = s.name;
    style.description = s.desc;
    style.effects = s.effects;
  }
}

// ============================================================
// Run
// ============================================================
async function main() {
  // Variables
  console.log('Creating color variables (30 tokens × 4 modes)...');
  // Already created above synchronously

  console.log('Creating size variables (spacing + radius)...');
  // Already created above synchronously

  console.log('Creating text styles (9 styles)...');
  await createTextStyles();

  console.log('Creating effect styles (4 shadows)...');
  createEffectStyles();

  figma.notify('✅ Matlens Design System registered: 30 color vars, 16 size vars, 9 text styles, 4 effect styles');
}

main();
