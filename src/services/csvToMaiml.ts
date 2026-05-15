// CSV (Excel エクスポートを含む) を Material[] に変換し、MaiML XML を生成する。
//
// 想定スキーム:
//   元データは現場の Excel に散在している。Excel → CSV (UTF-8) を経由して
//   Matlens に取り込み、MaiML round-trip に乗せる。これにより
//   「Excel → MaiML → ラボ計測器 / OEM」を 1 経路で扱えるようにする。
//
// MVP の責務:
//   - RFC 4180 風の CSV をパースする (双引用符 + ダブルクォートエスケープ)
//   - UTF-8 BOM を黙って捨てる
//   - 列マッピング (Material のフィールド → CSV のヘッダ名) を受け取り、
//     型変換しつつ Material[] を組み立てる
//   - 数値変換に失敗した必須フィールドは行単位の警告にする (silent failure 禁止)
//   - 仕上げに既存の serializeMaterialsToMaiml で MaiML を吐く
//
// xlsx パーサ (SheetJS) は導入しない。Excel は「名前を付けて保存 → CSV」が
// 確実なので、まず CSV 取り込みで現場痛みを解消し、xlsx は後追いとする。
// （bundle size と framework-agnostic 境界の維持のため）

import type { Material, MaterialCategory, MaterialStatus, Provenance } from '../types';
import { serializeMaterialsToMaiml } from './maiml';

// ----- CSV パース -----

/** CSV セル値を 1 行ずつ取り出す。RFC 4180 風 (双引用符 + "" エスケープ)。 */
export function parseCsv(text: string): string[][] {
  // BOM を 1 度だけ落とす
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuote = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (inQuote) {
      if (ch === '"') {
        // "" → " のエスケープ
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuote = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      // \r\n は \n だけを区切りとして扱う
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      // 完全な空行は無視 (Excel エクスポートで末尾に出やすい)
      if (!(row.length === 1 && row[0] === '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }
    cell += ch;
  }

  // 末尾セル
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    if (!(row.length === 1 && row[0] === '')) {
      rows.push(row);
    }
  }
  return rows;
}

export interface CsvParseResult {
  headers: string[];
  rows: string[][];
}

/** ヘッダ行 + データ行に分離。最初の非空行をヘッダとして扱う。 */
export function parseCsvWithHeader(text: string): CsvParseResult {
  const all = parseCsv(text);
  const first = all[0];
  if (!first) return { headers: [], rows: [] };
  const headers = first.map((h) => h.trim());
  const rows = all.slice(1);
  return { headers, rows };
}

// ----- ヘッダ自動マッピング -----

/** Material のどのフィールドに割り当てられるか。null = 割当なし */
export type MaterialField =
  | 'id'
  | 'name'
  | 'cat'
  | 'comp'
  | 'batch'
  | 'date'
  | 'author'
  | 'status'
  | 'memo'
  | 'hv'
  | 'ts'
  | 'el'
  | 'el2'
  | 'pf'
  | 'dn'
  | 'provenance'
  | 'microstructure'
  | 'testMethod';

export type ColumnMapping = Partial<Record<MaterialField, string>>;

/** ヘッダ名（日本語 / 英語表記の代表的な揺らぎ）→ MaterialField */
const HEADER_HINTS: Record<MaterialField, string[]> = {
  id: ['id', 'sampleid', 'sample id', '材料id', '試料id', '管理番号'],
  name: ['name', 'samplename', 'sample name', '材料名', '試料名', '名称'],
  cat: ['category', 'cat', '分類', 'カテゴリ', '材料分類'],
  comp: ['composition', 'comp', '組成'],
  batch: ['batch', 'lot', 'ロット', 'バッチ'],
  date: ['date', 'registeredon', '登録日', '日付'],
  author: ['author', 'operator', '担当', '担当者', '作成者'],
  status: ['status', '状態', 'ステータス'],
  memo: ['memo', 'note', 'remarks', '備考', 'メモ'],
  hv: ['hv', 'hardness', '硬度', '硬さ'],
  ts: ['ts', 'tensile', 'tensilestrength', '引張強さ', '引張強度'],
  el: ['el', 'elastic', 'elasticmodulus', 'youngs', 'ヤング率', '弾性率'],
  el2: ['elongation', 'el2', '伸び', '伸び率'],
  pf: ['pf', 'proof', 'proofstress', '耐力', '0.2%耐力'],
  dn: ['dn', 'density', '密度'],
  provenance: ['provenance', 'source', '出所', 'データ出所'],
  microstructure: ['microstructure', 'micro', '組織', '金属組織'],
  testMethod: ['testmethod', 'method', '試験方法', '規格'],
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[\s_-]+/g, '');
}

/** ヘッダ一覧から推測でマッピングを埋める。確信が無い列は触らない。 */
export function inferColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();
  for (const [field, hints] of Object.entries(HEADER_HINTS) as [MaterialField, string[]][]) {
    for (const header of headers) {
      if (used.has(header)) continue;
      const norm = normalizeHeader(header);
      if (hints.some((hint) => norm === normalizeHeader(hint))) {
        mapping[field] = header;
        used.add(header);
        break;
      }
    }
  }
  return mapping;
}

// ----- 値の変換 -----

const CATEGORY_VALUES: MaterialCategory[] = ['金属合金', 'セラミクス', 'ポリマー', '複合材料'];
const STATUS_VALUES: MaterialStatus[] = ['登録済', 'レビュー待', '承認済', '要修正'];
const PROVENANCE_VALUES: Provenance[] = ['instrument', 'manual', 'ai', 'simulation'];

// 列挙値の coerce は「空欄はサイレントに default」「非空だが未認識ならフォールバック + unknown=true」
// に分け、silent failure 禁止ポリシーに揃える。caller は unknown を見て warnings に push する。
interface CoercionResult<T> {
  value: T;
  unknown: boolean;
}

function coerceCategory(value: string): CoercionResult<MaterialCategory> {
  const trimmed = value.trim();
  if (trimmed === '') return { value: '金属合金', unknown: false };
  if ((CATEGORY_VALUES as string[]).includes(trimmed)) {
    return { value: trimmed as MaterialCategory, unknown: false };
  }
  // 英語表記の揺らぎ吸収
  const lower = trimmed.toLowerCase();
  if (lower.includes('metal') || lower.includes('alloy')) return { value: '金属合金', unknown: false };
  if (lower.includes('ceram')) return { value: 'セラミクス', unknown: false };
  if (lower.includes('polymer') || lower.includes('plastic')) return { value: 'ポリマー', unknown: false };
  if (lower.includes('composite') || lower.includes('cfrp') || lower.includes('cmc')) {
    return { value: '複合材料', unknown: false };
  }
  return { value: '金属合金', unknown: true };
}

function coerceStatus(value: string): CoercionResult<MaterialStatus> {
  const trimmed = value.trim();
  if (trimmed === '') return { value: 'レビュー待', unknown: false };
  if ((STATUS_VALUES as string[]).includes(trimmed)) {
    return { value: trimmed as MaterialStatus, unknown: false };
  }
  return { value: 'レビュー待', unknown: true };
}

// provenance も cat / status と同じく「空欄は silent / 非空だが未認識は unknown=true」に揃え、
// 4 種類 enum (instrument / manual / ai / simulation) のいずれにも当たらない値が
// 静かに undefined になる silent failure を防ぐ。
function coerceProvenance(value: string): CoercionResult<Provenance | undefined> {
  const trimmed = value.trim();
  if (trimmed === '') return { value: undefined, unknown: false };
  const lower = trimmed.toLowerCase();
  if ((PROVENANCE_VALUES as string[]).includes(lower)) {
    return { value: lower as Provenance, unknown: false };
  }
  return { value: undefined, unknown: true };
}

// date は YYYY-MM-DD もしくは ISO 8601 datetime を期待。形式違反のセルが MaiML に
// 静かに混入するのを防ぐため、末尾までを $ で固定したパターンで弾く。
// 接頭マッチだけだと "2026-05-15garbage" のような末尾ゴミ付きも Date.parse が
// 通ってしまうため必ず末尾固定する。
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const d = new Date(value);
  return Number.isFinite(d.getTime());
}

function coerceNumberOrNull(value: string): number | null {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[, ]/g, '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// ----- マッピング → Material[] -----

export interface BuildMaterialsResult {
  materials: Material[];
  warnings: string[];
}

// UI 側でも参照するため公開（旧版は MaimlConvertPage.tsx で再定義していたが
// single source of truth に集約）。
export const REQUIRED_FIELDS: MaterialField[] = ['id', 'name'];
const REQUIRED_NUMERIC_FIELDS: MaterialField[] = ['hv', 'ts'];

/**
 * カラムマッピングと CSV 行から Material[] を構築する。
 * - REQUIRED_FIELDS が欠けている行は skip + warning
 * - REQUIRED_NUMERIC_FIELDS は欠損時に 0 にフォールバックして warning
 * - 任意フィールド (memo / provenance / microstructure / testMethod) は欠損時 undefined
 */
export function buildMaterialsFromCsv(
  csv: CsvParseResult,
  mapping: ColumnMapping,
): BuildMaterialsResult {
  const warnings: string[] = [];
  const materials: Material[] = [];

  // ヘッダ → 列インデックスの逆引き
  const indexByHeader: Record<string, number> = {};
  csv.headers.forEach((h, i) => {
    indexByHeader[h] = i;
  });

  // 必須フィールドが mapping に無い場合は致命的なので空配列を返す
  for (const field of REQUIRED_FIELDS) {
    if (!mapping[field]) {
      warnings.push(`必須フィールド「${field}」のカラムが未割当です`);
    }
  }
  if (warnings.length > 0) {
    return { materials: [], warnings };
  }

  const get = (row: string[], field: MaterialField): string | undefined => {
    const header = mapping[field];
    if (!header) return undefined;
    const idx = indexByHeader[header];
    if (idx === undefined) return undefined;
    return row[idx];
  };

  // CSV 内で同一 ID が複数行に現れたら 2 行目以降は warning に落として skip
  // （IMPORT 時に上書きされて静かに 1 件消えるのを防ぐ）
  const seenIds = new Set<string>();

  csv.rows.forEach((row, rowIdx) => {
    const lineNo = rowIdx + 2; // 1: header, 2-: data

    const id = (get(row, 'id') ?? '').trim();
    const name = (get(row, 'name') ?? '').trim();
    if (!id || !name) {
      warnings.push(`行 ${lineNo}: id または name が空のためスキップしました`);
      return;
    }
    if (seenIds.has(id)) {
      warnings.push(`行 ${lineNo}: ID "${id}" が CSV 内で重複しているためスキップしました`);
      return;
    }
    seenIds.add(id);

    // 数値フィールドは空欄は silent、「非空だが Number にできない」値（"—" "N/A" 等）は
    // 必須/任意問わず warning に落として 0 フォールバックする。
    // 現場の Excel では未測定が空欄でなく "—" / "未測定" 等で入る事例が多く、
    // それを 0 と区別できないまま MaiML に混入させないようにする目的。
    const numericOrZero = (field: MaterialField): number => {
      const raw = get(row, field);
      // mapping 自体が割り当てられていない場合は silent に 0
      // （ユーザは「この列は使わない」と意図的に外した可能性）
      if (raw === undefined) return 0;
      const trimmed = raw.trim();
      if (trimmed === '') {
        // mapping あり / 値空欄: 必須なら警告、任意なら silent
        if (REQUIRED_NUMERIC_FIELDS.includes(field)) {
          warnings.push(`行 ${lineNo} (${id}): 必須数値 ${field} が空のため 0 を入れました`);
        }
        return 0;
      }
      const n = coerceNumberOrNull(trimmed);
      if (n === null) {
        warnings.push(`行 ${lineNo} (${id}): ${field} "${trimmed}" を数値として読めず 0 を入れました`);
        return 0;
      }
      return n;
    };

    // pf は number | null なので unmapped / 空欄はどちらも silent に null。
    // 「値があるが Number にできない」ケースだけ warning に落として null を入れる。
    const pfRaw = get(row, 'pf');
    let pf: number | null = null;
    if (pfRaw !== undefined) {
      const pfTrimmed = pfRaw.trim();
      if (pfTrimmed !== '') {
        const parsed = coerceNumberOrNull(pfTrimmed);
        if (parsed === null) {
          warnings.push(`行 ${lineNo} (${id}): pf "${pfTrimmed}" を数値として読めず未設定 (null) にしました`);
        }
        pf = parsed;
      }
    }

    const provenanceRaw = get(row, 'provenance') ?? '';
    const provenanceCoerced = coerceProvenance(provenanceRaw);
    if (provenanceCoerced.unknown) {
      warnings.push(`行 ${lineNo} (${id}): provenance "${provenanceRaw.trim()}" を認識できず未設定にしました（instrument / manual / ai / simulation のいずれか）`);
    }
    const provenance = provenanceCoerced.value;

    const catRaw = get(row, 'cat') ?? '';
    const catCoerced = coerceCategory(catRaw);
    if (catCoerced.unknown) {
      warnings.push(`行 ${lineNo} (${id}): カテゴリ "${catRaw.trim()}" を認識できず "金属合金" にフォールバックしました`);
    }

    const statusRaw = get(row, 'status') ?? '';
    const statusCoerced = coerceStatus(statusRaw);
    if (statusCoerced.unknown) {
      warnings.push(`行 ${lineNo} (${id}): ステータス "${statusRaw.trim()}" を認識できず "レビュー待" にフォールバックしました`);
    }

    const material: Material = {
      id,
      name,
      cat: catCoerced.value,
      hv: numericOrZero('hv'),
      ts: numericOrZero('ts'),
      el: numericOrZero('el'),
      pf,
      el2: numericOrZero('el2'),
      dn: numericOrZero('dn'),
      comp: (get(row, 'comp') ?? '').trim(),
      batch: (get(row, 'batch') ?? '').trim(),
      // date は下で改めて検証 + 警告込みで設定する。ここはプレースホルダ。
      date: '',
      author: (get(row, 'author') ?? '').trim(),
      status: statusCoerced.value,
      ai: false,
      memo: (get(row, 'memo') ?? '').trim(),
    };

    // date 検証: 空欄は silent に今日の日付、形式違反は warning に落として今日の日付。
    const dateRaw = (get(row, 'date') ?? '').trim();
    if (dateRaw === '') {
      material.date = new Date().toISOString().slice(0, 10);
    } else if (isValidDateString(dateRaw)) {
      material.date = dateRaw;
    } else {
      warnings.push(`行 ${lineNo} (${id}): 日付 "${dateRaw}" を YYYY-MM-DD 形式として読めず本日の日付にフォールバックしました`);
      material.date = new Date().toISOString().slice(0, 10);
    }

    if (provenance) material.provenance = provenance;
    const micro = get(row, 'microstructure');
    if (micro && micro.trim()) material.microstructure = micro.trim();
    const tm = get(row, 'testMethod');
    if (tm && tm.trim()) material.testMethod = tm.trim();

    materials.push(material);
  });

  return { materials, warnings };
}

// ----- ワンショット変換 -----

export interface ConvertCsvToMaimlResult {
  materials: Material[];
  warnings: string[];
  maiml: string;
}

/**
 * CSV テキスト + マッピングから Material[] と MaiML XML を一気に作る。
 * ページ側はこれを呼んで preview と download に分岐する。
 */
export function convertCsvToMaiml(
  csvText: string,
  mapping: ColumnMapping,
  options: { source?: string; generatedAt?: Date } = {},
): ConvertCsvToMaimlResult {
  const csv = parseCsvWithHeader(csvText);
  const { materials, warnings } = buildMaterialsFromCsv(csv, mapping);
  const maiml = serializeMaterialsToMaiml(materials, {
    source: options.source ?? 'matlens-csv-import',
    generatedAt: options.generatedAt,
  });
  return { materials, warnings, maiml };
}

// ----- サンプル CSV -----
//
// 実ファイルを用意せずに動作確認できるよう「サンプルで試す」ボタンから読み込む。
// 中身はアプリ初期データ (Ti-6Al-4V / SUS316L / Inconel718) と整合させ、
// 既存 ID と重複する設計にして「IMPORT 時に skip される挙動」もそのまま見せる。
// ヘッダは日英混在で揺らぎ吸収の効きも体感できるようにしてある。
export const SAMPLE_CSV_FILENAME = 'matlens-sample.csv';
export const SAMPLE_CSV = [
  'ID,材料名,Category,HV,Tensile Strength,弾性率,伸び,密度,担当者,状態,組成,備考',
  'M-101,Ti-6Al-4V (PoC),金属合金,340,950,113,14,4.43,a.ito,登録済,Ti-6Al-4V,航空機エンジン用',
  'M-102,SUS316L (PoC),金属合金,180,520,193,40,8.0,a.ito,レビュー待,Fe-Cr-Ni-Mo,耐食用途',
  'M-103,Inconel 718 (PoC),金属合金,420,1240,200,12,8.19,a.ito,承認済,Ni-Cr-Fe-Nb,高温強度',
  'M-104,Al2O3 (PoC),セラミクス,1500,400,380,0,3.95,a.ito,登録済,Al2O3,セラミクスサンプル',
  'M-105,CFRP T800 (PoC),複合材料,30,2900,165,1.8,1.6,a.ito,レビュー待,Carbon Fiber,軽量構造材',
].join('\n');

export const ALL_MATERIAL_FIELDS: { field: MaterialField; label: string; required?: boolean }[] = [
  { field: 'id', label: 'ID (材料 ID)', required: true },
  { field: 'name', label: '名前', required: true },
  { field: 'cat', label: 'カテゴリ' },
  { field: 'comp', label: '組成' },
  { field: 'batch', label: 'バッチ' },
  { field: 'date', label: '登録日' },
  { field: 'author', label: '担当者' },
  { field: 'status', label: 'ステータス' },
  { field: 'memo', label: 'メモ / 備考' },
  { field: 'hv', label: '硬度 HV' },
  { field: 'ts', label: '引張強さ MPa' },
  { field: 'el', label: '弾性率 GPa' },
  { field: 'el2', label: '伸び %' },
  { field: 'pf', label: '耐力 MPa' },
  { field: 'dn', label: '密度 g/cm3' },
  { field: 'provenance', label: 'Provenance' },
  { field: 'microstructure', label: '組織記述' },
  { field: 'testMethod', label: '試験方法 / 規格' },
];
