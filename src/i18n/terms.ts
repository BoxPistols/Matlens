/**
 * バイリンガル用語辞書 — 材料工学 + システム UI
 *
 * 金属試験ドメインでは日英両方の表記が求められる場面が多い
 * （論文引用・海外拠点との共有・JIS/ASTM 規格の二重表記）。
 *
 * 用途:
 *   - UI ラベルで「引張強さ / Tensile Strength」のように日英併記
 *   - ヘルプ / ツールチップでの補足
 *   - 将来の言語切り替え (Phase D) の下地
 *
 * 構造:
 *   key → { ja, en, unit?, abbr? }
 *   key は Material 型のフィールド名またはドメイン用語を snake_case で統一。
 */

export interface Term {
  ja: string
  en: string
  /** 物理単位 (表示用) */
  unit?: string
  /** 略称 (テーブルヘッダ等のコンパクト表示用) */
  abbr?: string
}

// ─── 材料特性 ────────────────────────────────────────────────────────────
export const MATERIAL_TERMS: Record<string, Term> = {
  hv:   { ja: '硬度',       en: 'Hardness',          unit: 'HV',     abbr: '硬度HV' },
  ts:   { ja: '引張強さ',   en: 'Tensile Strength',  unit: 'MPa',    abbr: '引張MPa' },
  el:   { ja: '弾性率',     en: "Young's Modulus",    unit: 'GPa',    abbr: '弾性GPa' },
  el2:  { ja: '伸び',       en: 'Elongation',         unit: '%',      abbr: '伸び%' },
  dn:   { ja: '密度',       en: 'Density',            unit: 'g/cm³',  abbr: '密度' },
  pf:   { ja: '疲労強度',   en: 'Fatigue Strength',   unit: 'MPa',    abbr: '疲労MPa' },
  comp: { ja: '組成',       en: 'Composition',                        abbr: '組成' },
  name: { ja: '名称',       en: 'Name',                               abbr: '名称' },
  cat:  { ja: 'カテゴリ',   en: 'Category',                           abbr: 'カテゴリ' },
  batch:{ ja: 'バッチ番号', en: 'Batch Number',                       abbr: 'バッチ' },
  date: { ja: '登録日',     en: 'Registration Date',                  abbr: '登録日' },
  author:{ ja: '登録者',    en: 'Author',                             abbr: '登録者' },
  status:{ ja: 'ステータス',en: 'Status',                             abbr: 'ステータス' },
  memo: { ja: '備考',       en: 'Memo',                               abbr: '備考' },
  id:   { ja: 'ID',         en: 'ID',                                 abbr: 'ID' },
}

// ─── 試験方法 ────────────────────────────────────────────────────────────
export const TEST_METHOD_TERMS: Record<string, Term> = {
  vickers:     { ja: 'ビッカース硬さ試験',   en: 'Vickers Hardness Test',    abbr: 'HV試験' },
  tensile:     { ja: '引張試験',             en: 'Tensile Test',             abbr: '引張' },
  charpy:      { ja: 'シャルピー衝撃試験',   en: 'Charpy Impact Test',       abbr: 'シャルピー' },
  fatigue:     { ja: '疲労試験',             en: 'Fatigue Test',             abbr: '疲労' },
  creep:       { ja: 'クリープ試験',         en: 'Creep Test',               abbr: 'クリープ' },
  corrosion:   { ja: '腐食試験',             en: 'Corrosion Test',           abbr: '腐食' },
  metallography:{ ja: '金属組織観察',        en: 'Metallographic Analysis',  abbr: '組織観察' },
  xrd:         { ja: 'X線回折',              en: 'X-ray Diffraction',        abbr: 'XRD' },
  sem:         { ja: '走査電子顕微鏡',       en: 'Scanning Electron Microscopy', abbr: 'SEM' },
  eds:         { ja: 'エネルギー分散型X線分析', en: 'Energy Dispersive X-ray Spectroscopy', abbr: 'EDS' },
}

// ─── ワークフロー (Petri net 工程) ───────────────────────────────────────
export const WORKFLOW_TERMS: Record<string, Term> = {
  planning:        { ja: '計画',       en: 'Planning' },
  material_select: { ja: '材料選定',   en: 'Material Selection' },
  raw_material:    { ja: '原料準備',   en: 'Raw Material Preparation' },
  primary_process: { ja: '一次加工',   en: 'Primary Processing' },
  post_process:    { ja: '後加工',     en: 'Post Processing' },
  specimen:        { ja: '試験片採取', en: 'Specimen Extraction' },
  evaluation:      { ja: '評価',       en: 'Evaluation' },
  mechanical_test: { ja: '機械試験',   en: 'Mechanical Testing' },
  environmental:   { ja: '環境試験',   en: 'Environmental Testing' },
  fractography:    { ja: '破面解析',   en: 'Fractographic Analysis' },
  report:          { ja: 'レポート',   en: 'Report' },
  rework:          { ja: '再加工',     en: 'Rework' },
  reject:          { ja: '廃棄',       en: 'Reject / Discard' },
}

// ─── UI ラベル ────────────────────────────────────────────────────────────
export const UI_TERMS: Record<string, Term> = {
  dashboard:      { ja: 'ダッシュボード',     en: 'Dashboard' },
  material_list:  { ja: '材料データ一覧',     en: 'Material List' },
  new_entry:      { ja: '新規登録',           en: 'New Entry' },
  vector_search:  { ja: '意味検索',           en: 'Semantic Search' },
  ai_chat:        { ja: 'AI チャット',        en: 'AI Chat' },
  similar:        { ja: '類似材料を比較',     en: 'Similar Materials' },
  petri_net:      { ja: '試験フロー可視化',   en: 'Workflow Visualization' },
  bayes_opt:      { ja: 'ベイズ最適化',       en: 'Bayesian Optimization' },
  help:           { ja: 'ヘルプ・用語集',     en: 'Help & Glossary' },
  settings:       { ja: '設定',               en: 'Settings' },
  export:         { ja: 'エクスポート',       en: 'Export' },
  import:         { ja: 'インポート',         en: 'Import' },
  download:       { ja: 'ダウンロード',       en: 'Download' },
  preview:        { ja: 'プレビュー',         en: 'Preview' },
  reset:          { ja: 'リセット',           en: 'Reset' },
  undo:           { ja: '1 手戻る',           en: 'Undo' },
  filter:         { ja: 'フィルタ',           en: 'Filter' },
  search:         { ja: '検索',               en: 'Search' },
}

// ─── ヘルパー ─────────────────────────────────────────────────────────────

/**
 * 日英併記ラベルを生成する。
 * @example bilingual(MATERIAL_TERMS.ts) → "引張強さ / Tensile Strength"
 */
export function bilingual(term: Term, separator = ' / '): string {
  return `${term.ja}${separator}${term.en}`
}

/**
 * 日英 + 単位を含むフルラベルを生成する。
 * @example fullLabel(MATERIAL_TERMS.ts) → "引張強さ / Tensile Strength (MPa)"
 */
export function fullLabel(term: Term): string {
  const base = bilingual(term)
  return term.unit ? `${base} (${term.unit})` : base
}
