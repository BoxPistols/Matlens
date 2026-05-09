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

function coerceCategory(value: string): MaterialCategory {
  const trimmed = value.trim();
  if ((CATEGORY_VALUES as string[]).includes(trimmed)) return trimmed as MaterialCategory;
  // 英語表記の揺らぎ吸収
  const lower = trimmed.toLowerCase();
  if (lower.includes('metal') || lower.includes('alloy')) return '金属合金';
  if (lower.includes('ceram')) return 'セラミクス';
  if (lower.includes('polymer') || lower.includes('plastic')) return 'ポリマー';
  if (lower.includes('composite') || lower.includes('cfrp') || lower.includes('cmc')) return '複合材料';
  return '金属合金';
}

function coerceStatus(value: string): MaterialStatus {
  const trimmed = value.trim();
  if ((STATUS_VALUES as string[]).includes(trimmed)) return trimmed as MaterialStatus;
  return 'レビュー待';
}

function coerceProvenance(value: string): Provenance | undefined {
  const trimmed = value.trim().toLowerCase();
  if ((PROVENANCE_VALUES as string[]).includes(trimmed)) return trimmed as Provenance;
  return undefined;
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

const REQUIRED_FIELDS: MaterialField[] = ['id', 'name'];
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

  csv.rows.forEach((row, rowIdx) => {
    const lineNo = rowIdx + 2; // 1: header, 2-: data

    const id = (get(row, 'id') ?? '').trim();
    const name = (get(row, 'name') ?? '').trim();
    if (!id || !name) {
      warnings.push(`行 ${lineNo}: id または name が空のためスキップしました`);
      return;
    }

    const numericOrZero = (field: MaterialField): number => {
      const raw = get(row, field);
      const n = coerceNumberOrNull(raw ?? '');
      if (n === null) {
        if (REQUIRED_NUMERIC_FIELDS.includes(field)) {
          warnings.push(`行 ${lineNo} (${id}): ${field} が数値として読めず 0 を入れました`);
        }
        return 0;
      }
      return n;
    };

    const pfRaw = get(row, 'pf');
    const pf = pfRaw === undefined || pfRaw.trim() === '' ? null : coerceNumberOrNull(pfRaw);

    const provenanceRaw = get(row, 'provenance');
    const provenance = provenanceRaw ? coerceProvenance(provenanceRaw) : undefined;

    const material: Material = {
      id,
      name,
      cat: coerceCategory(get(row, 'cat') ?? ''),
      hv: numericOrZero('hv'),
      ts: numericOrZero('ts'),
      el: numericOrZero('el'),
      pf,
      el2: numericOrZero('el2'),
      dn: numericOrZero('dn'),
      comp: (get(row, 'comp') ?? '').trim(),
      batch: (get(row, 'batch') ?? '').trim(),
      date: (get(row, 'date') ?? new Date().toISOString().slice(0, 10)).trim(),
      author: (get(row, 'author') ?? '').trim(),
      status: coerceStatus(get(row, 'status') ?? ''),
      ai: false,
      memo: (get(row, 'memo') ?? '').trim(),
    };

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
