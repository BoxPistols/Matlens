// Matlens Design Tokens — Figma Variables / Styles 登録

function hex(h) {
  h = h.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    a: 1
  };
}

// ============================================================
// 1. Variable Collection: Color Tokens (4 modes)
// ============================================================
var cc = figma.variables.createVariableCollection('Color Tokens');
cc.renameMode(cc.modes[0].modeId, 'light');
var dkId = cc.addMode('dark');
var enId = cc.addMode('eng');
var caId = cc.addMode('cae');
var ltId = cc.modes[0].modeId;

var colors = [
  ['accent','#004590','#5a9ae0','#00c896','#e89020'],
  ['accent-hover','#003070','#78b0ec','#00e0aa','#f0a838'],
  ['accent-dim','#dce8f7','#0e1e36','#0d2920','#201608'],
  ['accent-mid','#1a6bc0','#5a9ae0','#00c896','#e89020'],
  ['ai-col','#3b35a0','#9a92f0','#60a8e8','#60c8f0'],
  ['ai-dim','#ebebfa','#1a1830','#0e1a28','#0c1820'],
  ['ai-mid','#5c56cc','#9a92f0','#60a8e8','#60c8f0'],
  ['vec','#0a6657','#38d0b0','#a0e060','#30d8c0'],
  ['vec-dim','#d8f0eb','#082420','#101c08','#081c18'],
  ['vec-mid','#0f8f78','#38d0b0','#a0e060','#30d8c0'],
  ['ok','#1e6b0f','#6cc850','#5cc840','#60c840'],
  ['ok-dim','#e4f3de','#0e1f08','#0e1e08','#0e1e08'],
  ['warn','#7a4b00','#f0b040','#e8b040','#f0a030'],
  ['warn-dim','#fdf0d8','#201600','#1a1400','#180c00'],
  ['err','#8b1a1a','#f06060','#f05050','#f05840'],
  ['err-dim','#fdeaea','#200808','#1e0808','#1c0808'],
  ['bg/base','#eef0f3','#10141c','#1a1f26','#0e1014'],
  ['bg/surface','#ffffff','#181d28','#222830','#14181e'],
  ['bg/raised','#f5f6f8','#1f2535','#2a3040','#1c2028'],
  ['bg/sunken','#e4e6ea','#0c1018','#141820','#0a0c10'],
  ['bg/hover','#e8eef7','#232c3e','#2e3848','#1e2430'],
  ['bg/active','#d4e2f4','#1a2d4a','#1a2e48','#142030'],
  ['text/hi','#0d1520','#e8f0ff','#d8eaf8','#f0ece4'],
  ['text/md','#3a4554','#a8bcd8','#92b0cc','#b8a898'],
  ['text/lo','#6b7a8d','#6e84a0','#5e7890','#6e6058'],
  ['border/focus','#0050AA','#5a9eff','#00c896','#e89020'],
  ['topbar-bg','#1e3050','#0c1018','#141820','#0a0c10'],
  ['sidebar-bg','#ffffff','#181d28','#1a1f26','#0e1014'],
  ['tag-surface','#e8ebef','#1f2535','#1a2028','#181c20'],
];

for (var i = 0; i < colors.length; i++) {
  var c = colors[i];
  var v = figma.variables.createVariable(c[0], cc.id, 'COLOR');
  v.setValueForMode(ltId, hex(c[1]));
  v.setValueForMode(dkId, hex(c[2]));
  v.setValueForMode(enId, hex(c[3]));
  v.setValueForMode(caId, hex(c[4]));
}

// ============================================================
// 2. Variable Collection: Size Tokens (4 modes)
// ============================================================
var sc = figma.variables.createVariableCollection('Size Tokens');
sc.renameMode(sc.modes[0].modeId, 'light');
var sdkId = sc.addMode('dark');
var senId = sc.addMode('eng');
var scaId = sc.addMode('cae');
var sltId = sc.modes[0].modeId;

var spacings = [
  ['spacing/0.5',2],['spacing/1',4],['spacing/1.5',6],['spacing/2',8],
  ['spacing/2.5',10],['spacing/3',12],['spacing/4',16],['spacing/5',20],
  ['spacing/6',24],['spacing/8',32],['spacing/10',40],['spacing/12',48],
];

for (var i = 0; i < spacings.length; i++) {
  var s = spacings[i];
  var v = figma.variables.createVariable(s[0], sc.id, 'FLOAT');
  v.setValueForMode(sltId, s[1]);
  v.setValueForMode(sdkId, s[1]);
  v.setValueForMode(senId, s[1]);
  v.setValueForMode(scaId, s[1]);
}

var radii = [
  ['radius/sm',4,4,3,2],
  ['radius/md',6,6,5,4],
  ['radius/lg',10,10,8,6],
  ['radius/xl',14,14,12,10],
];

for (var i = 0; i < radii.length; i++) {
  var r = radii[i];
  var v = figma.variables.createVariable(r[0], sc.id, 'FLOAT');
  v.setValueForMode(sltId, r[1]);
  v.setValueForMode(sdkId, r[2]);
  v.setValueForMode(senId, r[3]);
  v.setValueForMode(scaId, r[4]);
}

// ============================================================
// 3. Effect Styles (Shadows)
// ============================================================
var shadows = [
  ['Matlens/Shadow/XS', 'ボタン・バッジ', 1, 2, 0.06],
  ['Matlens/Shadow/SM', 'カード', 2, 6, 0.08],
  ['Matlens/Shadow/MD', 'モーダル', 4, 16, 0.10],
  ['Matlens/Shadow/LG', 'パネル', 8, 36, 0.13],
];

for (var i = 0; i < shadows.length; i++) {
  var sh = shadows[i];
  var style = figma.createEffectStyle();
  style.name = sh[0];
  style.description = sh[1];
  style.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0.08, b: 0.24, a: sh[4] },
    offset: { x: 0, y: sh[2] },
    radius: sh[3],
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  }];
}

// ============================================================
// 4. Text Styles
// ============================================================
async function createTextStyles() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  var styles = [
    ['Matlens/Heading/H1', 19, 'Bold', 1.4, 'ダッシュボード大見出し'],
    ['Matlens/Heading/H2', 17, 'Bold', 1.4, 'ページ見出し'],
    ['Matlens/Heading/H3', 16, 'Bold', 1.4, 'セクション見出し'],
    ['Matlens/Heading/Subhead', 15, 'Semi Bold', 1.4, 'モーダル見出し'],
    ['Matlens/Body/Base', 14, 'Regular', 1.6, 'ベースフォント (1rem)'],
    ['Matlens/Body/Default', 13, 'Regular', 1.6, '本文・入力フィールド'],
    ['Matlens/Label/Nav', 12, 'Medium', 1.4, 'ナビ・フォームラベル'],
    ['Matlens/Label/Badge', 12, 'Semi Bold', 1.2, 'バッジ・補助ラベル'],
    ['Matlens/Code/Mono', 13, 'Regular', 1.5, 'コード・数値 等幅'],
  ];

  for (var i = 0; i < styles.length; i++) {
    var t = styles[i];
    var s = figma.createTextStyle();
    s.name = t[0];
    s.description = t[4];
    s.fontSize = t[1];
    s.fontName = { family: 'Inter', style: t[2] };
    s.lineHeight = { value: t[1] * t[3], unit: 'PIXELS' };
  }
}

createTextStyles().then(function() {
  figma.notify('✅ Matlens Design System 登録完了: カラー29変数×4モード, サイズ16変数, テキスト9スタイル, シャドウ4スタイル');
  figma.closePlugin();
});
