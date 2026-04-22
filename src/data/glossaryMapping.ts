// machining-fundamentals（金属加工学習アプリ）への用語リンクマッピング。
//
// ADR-012（親密化統合戦略）の Phase 1 実装。URL 規約は peer と合意済:
//   <base>#/chapter/<id>[#<term-id>]
//
// peer (yilmogxd) から提供された初期 20 件 + Matlens 側で追加登録したい候補。
// base URL は deploy 確定後に MACHINING_FUNDAMENTALS_BASE_URL で切替可能に。

export const MACHINING_FUNDAMENTALS_BASE_URL =
  'https://machining-fundamentals.vercel.app/';

export interface GlossaryMapping {
  termId: string;
  ja: string;
  en: string;
  symbol?: string;
  chapterRef: string;
  anchor: string;
  levelHint: 'beginner' | 'intermediate' | 'advanced';
  /** Part A 執筆完了前の未実装 anchor は pending: true を立てる。dead-link チェックで skip */
  pending?: boolean;
}

// 初期 20 件（peer 提供）+ Matlens 側で追加登録したい候補（pending:true）
export const GLOSSARY_MAPPINGS: GlossaryMapping[] = [
  // Part A（材料科学）— peer 執筆中。pending:true のものは anchor 確定後に false に戻す
  { termId: 'atom', ja: '原子', en: 'Atom', chapterRef: 'a1', anchor: 'atom', levelHint: 'beginner' },
  { termId: 'valence', ja: '価電子', en: 'Valence electron', chapterRef: 'a1', anchor: 'valence', levelHint: 'beginner' },
  { termId: 'metallic-bond', ja: '金属結合', en: 'Metallic bond', chapterRef: 'a2', anchor: 'metallic-bond', levelHint: 'beginner', pending: true },
  { termId: 'fcc', ja: 'FCC 結晶', en: 'FCC crystal', chapterRef: 'a3', anchor: 'fcc', levelHint: 'intermediate', pending: true },
  { termId: 'bcc', ja: 'BCC 結晶', en: 'BCC crystal', chapterRef: 'a3', anchor: 'bcc', levelHint: 'intermediate', pending: true },
  { termId: 'hcp', ja: 'HCP 結晶', en: 'HCP crystal', chapterRef: 'a3', anchor: 'hcp', levelHint: 'intermediate', pending: true },
  { termId: 'dislocation', ja: '転位', en: 'Dislocation', chapterRef: 'a4', anchor: 'dislocation', levelHint: 'intermediate', pending: true },
  { termId: 'slip-system', ja: 'すべり系', en: 'Slip system', chapterRef: 'a4', anchor: 'slip-system', levelHint: 'intermediate', pending: true },
  { termId: 'work-hardening', ja: '加工硬化', en: 'Work hardening', chapterRef: 'a4', anchor: 'work-hardening', levelHint: 'intermediate', pending: true },
  { termId: 'phase-diagram', ja: '状態図', en: 'Phase diagram', chapterRef: 'a5', anchor: 'phase-diagram', levelHint: 'intermediate', pending: true },
  { termId: 'johnson-cook', ja: 'Johnson-Cook 構成式', en: 'Johnson-Cook constitutive equation', chapterRef: 'a6', anchor: 'johnson-cook', levelHint: 'advanced', pending: true },
  { termId: 'shear-band', ja: 'せん断帯', en: 'Shear band', chapterRef: 'a6', anchor: 'shear-band', levelHint: 'advanced', pending: true },

  // Part B（切削工学）— 既存章
  { termId: 'Vc', ja: '切削速度', en: 'Cutting speed', symbol: 'Vc', chapterRef: '3', anchor: 'Vc', levelHint: 'beginner' },
  { termId: 'f', ja: '送り', en: 'Feed per revolution', symbol: 'f', chapterRef: '3', anchor: 'f', levelHint: 'beginner' },
  { termId: 'ap', ja: '切込み深さ', en: 'Depth of cut', symbol: 'ap', chapterRef: '3', anchor: 'ap', levelHint: 'beginner' },
  { termId: 'Kc', ja: '比切削抵抗', en: 'Specific cutting force', symbol: 'Kc', chapterRef: '6', anchor: 'Kc', levelHint: 'intermediate' },
  { termId: 'VB', ja: '逃げ面摩耗', en: 'Flank wear width', symbol: 'VB', chapterRef: '8', anchor: 'VB', levelHint: 'intermediate' },
  { termId: 'Taylor', ja: 'Taylor 工具寿命式', en: 'Taylor tool-life equation', symbol: 'V·T^n=C', chapterRef: '8', anchor: 'Taylor', levelHint: 'intermediate' },
  { termId: 'Ra', ja: '算術平均粗さ', en: 'Arithmetic mean roughness', symbol: 'Ra', chapterRef: '9', anchor: 'Ra', levelHint: 'beginner' },
  { termId: 'SLD', ja: 'Stability Lobe', en: 'Stability Lobe Diagram', symbol: 'blim(n)', chapterRef: '10', anchor: 'SLD', levelHint: 'advanced' },
];

/**
 * 用語 ID から machining-fundamentals の完全 URL を生成。
 * 不明 ID はホーム URL を返す（peer 側で未知 id はホームフォールバックする設計）。
 */
export function urlForTerm(termId: string, base = MACHINING_FUNDAMENTALS_BASE_URL): string {
  const mapping = GLOSSARY_MAPPINGS.find((m) => m.termId === termId);
  if (!mapping) return base;
  return `${base}#/chapter/${mapping.chapterRef}#${mapping.anchor}`;
}

/**
 * 章 ID から machining-fundamentals の章 URL を生成（anchor なし）。
 */
export function urlForChapter(chapterRef: string, base = MACHINING_FUNDAMENTALS_BASE_URL): string {
  return `${base}#/chapter/${chapterRef}`;
}

/**
 * 未実装 anchor かどうか（CI の dead-link チェックで skip 判定に使う）。
 */
export function isPendingTerm(termId: string): boolean {
  const mapping = GLOSSARY_MAPPINGS.find((m) => m.termId === termId);
  return mapping?.pending === true;
}
