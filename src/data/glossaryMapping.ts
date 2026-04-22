// machining-fundamentals（金属加工学習アプリ）への用語リンクマッピング。
//
// ADR-012（親密化統合戦略）の Phase 1 実装。
//
// URL 規約は peer と合意済（2026-04-23 確定、ADR-013 Minor Revision に反映）:
//   <base>#/chapter/<id>            章 URL
//   <base>#/chapter/<id>/<term-id>  章内用語 anchor（/ 区切り）
//
// 当初提案の <base>#/chapter/<id>#<term-id> は RFC 3986 §3.5 違反のため廃案。
// hash は 1 つしか持てず parser が複雑化するため、path-style の / 区切りに変更。
//
// base URL は deploy 確定後に MACHINING_FUNDAMENTALS_BASE_URL で切替可能。

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

// peer から 2026-04-23 に anchor 24 件付与完了の通知を受領。
// 以下は全て動作確認済、即時参照可能。
// Part C1「金属加工研究の実例集」も追加されたが、term-id 単位ではなく章単位参照。
export const GLOSSARY_MAPPINGS: GlossaryMapping[] = [
  // Part A（材料科学）— peer が A1〜A6 全章 + 補強完了、全 anchor 動作確認済
  { termId: 'atom', ja: '原子', en: 'Atom', chapterRef: 'a1', anchor: 'atom', levelHint: 'beginner' },
  { termId: 'valence', ja: '価電子', en: 'Valence electron', chapterRef: 'a1', anchor: 'valence', levelHint: 'beginner' },
  { termId: 'metallic-bond', ja: '金属結合', en: 'Metallic bond', chapterRef: 'a2', anchor: 'metallic-bond', levelHint: 'beginner' },
  { termId: 'thermal-conductivity', ja: '熱伝導率', en: 'Thermal conductivity', chapterRef: 'a2', anchor: 'thermal-conductivity', levelHint: 'beginner' },
  { termId: 'fcc', ja: 'FCC 結晶', en: 'FCC crystal', chapterRef: 'a3', anchor: 'fcc', levelHint: 'intermediate' },
  { termId: 'bcc', ja: 'BCC 結晶', en: 'BCC crystal', chapterRef: 'a3', anchor: 'bcc', levelHint: 'intermediate' },
  { termId: 'hcp', ja: 'HCP 結晶', en: 'HCP crystal', chapterRef: 'a3', anchor: 'hcp', levelHint: 'intermediate' },
  { termId: 'dislocation', ja: '転位', en: 'Dislocation', chapterRef: 'a4', anchor: 'dislocation', levelHint: 'intermediate' },
  { termId: 'slip-system', ja: 'すべり系', en: 'Slip system', chapterRef: 'a4', anchor: 'slip-system', levelHint: 'intermediate' },
  { termId: 'work-hardening', ja: '加工硬化', en: 'Work hardening', chapterRef: 'a4', anchor: 'work-hardening', levelHint: 'intermediate' },
  { termId: 'phase-diagram', ja: '状態図', en: 'Phase diagram', chapterRef: 'a5', anchor: 'phase-diagram', levelHint: 'intermediate' },
  { termId: 'martensite', ja: 'マルテンサイト', en: 'Martensite', chapterRef: 'a5', anchor: 'martensite', levelHint: 'intermediate' },
  { termId: 'precipitation-hardening', ja: '析出強化', en: 'Precipitation hardening', chapterRef: 'a5', anchor: 'precipitation-hardening', levelHint: 'intermediate' },
  { termId: 'johnson-cook', ja: 'Johnson-Cook 構成式', en: 'Johnson-Cook constitutive equation', chapterRef: 'a6', anchor: 'johnson-cook', levelHint: 'advanced' },
  { termId: 'shear-band', ja: 'せん断帯', en: 'Shear band', chapterRef: 'a6', anchor: 'shear-band', levelHint: 'advanced' },

  // Part B（切削工学）— 既存 10 章に anchor 付与済
  { termId: 'Vc', ja: '切削速度', en: 'Cutting speed', symbol: 'Vc', chapterRef: '3', anchor: 'Vc', levelHint: 'beginner' },
  { termId: 'f', ja: '送り', en: 'Feed per revolution', symbol: 'f', chapterRef: '3', anchor: 'f', levelHint: 'beginner' },
  { termId: 'ap', ja: '切込み深さ', en: 'Depth of cut', symbol: 'ap', chapterRef: '3', anchor: 'ap', levelHint: 'beginner' },
  { termId: 'Kc', ja: '比切削抵抗', en: 'Specific cutting force', symbol: 'Kc', chapterRef: '6', anchor: 'Kc', levelHint: 'intermediate' },
  { termId: 'VB', ja: '逃げ面摩耗', en: 'Flank wear width', symbol: 'VB', chapterRef: '8', anchor: 'VB', levelHint: 'intermediate' },
  { termId: 'Taylor', ja: 'Taylor 工具寿命式', en: 'Taylor tool-life equation', symbol: 'V·T^n=C', chapterRef: '8', anchor: 'Taylor', levelHint: 'intermediate' },
  { termId: 'Ra', ja: '算術平均粗さ', en: 'Arithmetic mean roughness', symbol: 'Ra', chapterRef: '9', anchor: 'Ra', levelHint: 'beginner' },
  { termId: 'chatter', ja: 'びびり振動', en: 'Chatter', chapterRef: '10', anchor: 'chatter', levelHint: 'intermediate' },
  { termId: 'SLD', ja: 'Stability Lobe', en: 'Stability Lobe Diagram', symbol: 'blim(n)', chapterRef: '10', anchor: 'SLD', levelHint: 'advanced' },
];

/**
 * 用語 ID から machining-fundamentals の完全 URL を生成。
 * URL 形式は <base>#/chapter/<id>/<term>（slash 区切り）。
 * 不明 ID はホーム URL を返す（peer 側で未知 id はホームフォールバックする設計）。
 */
export function urlForTerm(termId: string, base = MACHINING_FUNDAMENTALS_BASE_URL): string {
  const mapping = GLOSSARY_MAPPINGS.find((m) => m.termId === termId);
  if (!mapping) return base;
  return `${base}#/chapter/${mapping.chapterRef}/${mapping.anchor}`;
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
