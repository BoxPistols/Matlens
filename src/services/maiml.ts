// MaiML (Measurement Analysis Instrument Markup Language) — Matlens bridge.
//
// MaiML is an XML-based common format for measurement & analysis data,
// standardized as JIS K 0200:2024 by the Japan Analytical Instruments
// Manufacturers' Association (JAIMA). The schema is distributed as a set
// of XSD files from https://github.com/tacyas/MaiML and also used in the
// Digital Discovery 2025 reference paper.
//
// The schema models a measurement document as:
//   <maiml>
//     <data>
//       <results>
//         <material>
//           <property key="SampleName">SUS316L</property>
//           ...
//         </material>
//         <result>
//           <property key="...">...</property>
//           <content>...</content>
//         </result>
//       </results>
//     </data>
//   </maiml>
//
// Matlens' `Material` row is a flat summary of one such lifecycle, so we
// serialize each Material as a `<material>` with key/value `<property>`
// children for the sample metadata, plus a `<result>` per measurement
// (hardness, tensile strength, etc.) where the numeric value lives inside
// `<content>` and the unit/name are `<property>` children. Multiple
// materials are wrapped in a single document so bulk export and import
// share one parser path.
//
// The XSD targetNamespace is not yet vendored in this repo; once we ship
// `vendor/maiml-schema/` this module will start emitting the official
// `xmlns` attribute. Until then the document validates against the shape
// referenced in the spec paper but intentionally omits the namespace URL
// so downstream tooling doesn't lock onto a placeholder.
//
// References:
//   - https://www.maiml.org/index_en.html
//   - https://github.com/tacyas/MaiML
//   - Digital Discovery 2025: https://pubs.rsc.org/en/content/articlehtml/2025/dd/d4dd00326h

import type { Material, MaterialCategory, MaterialStatus } from '../types';

// ----- Escape helpers -----

function escapeXml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function indent(depth: number): string {
  return '  '.repeat(depth);
}

function propertyLine(depth: number, key: string, value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `${indent(depth)}<property key="${escapeXml(key)}">${escapeXml(text)}</property>`;
}

// Measurement results emitted per material. Keeping this list close to the
// serializer makes it trivial to add new metrics (e.g. surface roughness)
// without grepping the codebase.
interface MeasurementDescriptor {
  name: string;
  unit: string;
  value: number | null;
}

function measurementsFor(material: Material): MeasurementDescriptor[] {
  return [
    { name: 'hardness', unit: 'HV', value: material.hv },
    { name: 'tensileStrength', unit: 'MPa', value: material.ts },
    { name: 'elasticModulus', unit: 'GPa', value: material.el },
    { name: 'elongation', unit: '%', value: material.el2 },
    { name: 'density', unit: 'g/cm3', value: material.dn },
    { name: 'proofStress', unit: 'MPa', value: material.pf },
  ];
}

// ----- Serialization -----

interface MaimlSerializeOptions {
  /** Override the timestamp embedded in the document header (mainly for tests) */
  generatedAt?: Date;
  /** Optional free-form source tag recorded in the header */
  source?: string;
}

/**
 * Serialize one or more Material records to a MaiML-shaped XML document.
 * The output is a well-formed XML string that callers can write to a file
 * (extension `.maiml` or `.xml`) or copy to the clipboard.
 */
export function serializeMaterialsToMaiml(
  materials: Material[],
  options: MaimlSerializeOptions = {}
): string {
  const generatedAt = (options.generatedAt ?? new Date()).toISOString();
  const source = options.source ?? 'matlens';

  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<maiml version="1.0">');
  lines.push(`${indent(1)}<header>`);
  lines.push(propertyLine(2, 'generatedAt', generatedAt));
  lines.push(propertyLine(2, 'source', source));
  lines.push(propertyLine(2, 'count', materials.length));
  lines.push(`${indent(1)}</header>`);
  lines.push(`${indent(1)}<data>`);
  lines.push(`${indent(2)}<results>`);

  for (const m of materials) {
    lines.push(`${indent(3)}<material id="${escapeXml(m.id)}">`);
    lines.push(propertyLine(4, 'SampleId', m.id));
    lines.push(propertyLine(4, 'SampleName', m.name));
    lines.push(propertyLine(4, 'Category', m.cat));
    lines.push(propertyLine(4, 'Composition', m.comp));
    lines.push(propertyLine(4, 'Batch', m.batch));
    lines.push(propertyLine(4, 'RegisteredOn', m.date));
    lines.push(propertyLine(4, 'Author', m.author));
    lines.push(propertyLine(4, 'Status', m.status));
    lines.push(propertyLine(4, 'AiDetected', m.ai ? 'true' : 'false'));
    if (m.memo) {
      lines.push(propertyLine(4, 'Memo', m.memo));
    }
    lines.push(`${indent(3)}</material>`);

    for (const measurement of measurementsFor(m)) {
      if (measurement.value === null) continue;
      lines.push(`${indent(3)}<result sampleRef="${escapeXml(m.id)}">`);
      lines.push(propertyLine(4, 'name', measurement.name));
      lines.push(propertyLine(4, 'unit', measurement.unit));
      lines.push(`${indent(4)}<content>${escapeXml(measurement.value)}</content>`);
      lines.push(`${indent(3)}</result>`);
    }
  }

  lines.push(`${indent(2)}</results>`);
  lines.push(`${indent(1)}</data>`);
  lines.push('</maiml>');
  return lines.join('\n') + '\n';
}

/**
 * Convenience for serializing a single material. Returns the same XML shape
 * as the bulk serializer so downstream tooling can treat a single-sample
 * document identically.
 */
export function serializeMaterialToMaiml(
  material: Material,
  options: MaimlSerializeOptions = {}
): string {
  return serializeMaterialsToMaiml([material], options);
}

// ----- Parsing -----

// Hard ceiling on imported document size. Prevents a Billion-Laughs-style
// entity expansion DoS from exhausting memory even though modern browser
// DOMParsers already refuse external entities by default.
export const MAIML_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export interface MaimlParseResult {
  materials: Material[];
  generatedAt: string | null;
  source: string | null;
  warnings: string[];
}

function collectProperties(parent: Element | null): Record<string, string> {
  const map: Record<string, string> = {};
  if (!parent) return map;
  // Only direct <property> children belong to this element's property bag.
  for (const child of Array.from(parent.children)) {
    if (child.localName !== 'property') continue;
    const key = child.getAttribute('key');
    if (!key) continue;
    map[key] = child.textContent?.trim() ?? '';
  }
  return map;
}

function numberFrom(value: string | undefined, fallback: number | null = 0): number | null {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Parse a MaiML XML string back into Matlens Material records. Unknown
 * elements are ignored; missing numeric measurements fall back to 0 with a
 * warning so the caller can surface import issues to the user instead of
 * failing the whole file.
 */
export function parseMaimlToMaterials(xml: string): MaimlParseResult {
  const warnings: string[] = [];

  // Hard size limit. Oversized files are almost always a bug or an attack
  // (Billion Laughs entity expansion), so we refuse before even touching the
  // XML parser.
  if (xml.length > MAIML_MAX_BYTES) {
    throw new Error(`MaiML: ファイルサイズが上限 (${MAIML_MAX_BYTES} bytes) を超えています`);
  }

  // Reject DOCTYPE declarations up-front. Modern browser DOMParsers already
  // refuse to resolve external entities, but declining the entire DOCTYPE
  // means we also sidestep the Billion-Laughs internal-entity attack and
  // any parser that might accidentally honour them (e.g. a Node.js xmldom
  // fallback in future tests). A well-formed MaiML file never needs one.
  if (/<!DOCTYPE/i.test(xml)) {
    throw new Error('MaiML: DOCTYPE 宣言を含むファイルは受け付けません');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('MaiML: XML のパースに失敗しました');
  }

  const root = doc.documentElement;
  if (!root || root.localName !== 'maiml') {
    throw new Error('MaiML: ルート要素が <maiml> ではありません');
  }

  const header = root.getElementsByTagName('header')[0] ?? null;
  const headerProps = collectProperties(header);
  const generatedAt = headerProps.generatedAt || null;
  const source = headerProps.source || null;

  // Walk to <results> and collect materials. We look up nested results (the
  // measurement values) by sampleRef so bulk documents round-trip cleanly.
  const resultsEls = root.getElementsByTagName('results');
  if (resultsEls.length === 0) {
    return { materials: [], generatedAt, source, warnings };
  }
  const resultsRoot = resultsEls[0];

  const materialEls = resultsRoot.getElementsByTagName('material');
  const measurementByRef: Record<string, Record<string, number>> = {};

  for (const resultEl of Array.from(resultsRoot.getElementsByTagName('result'))) {
    const sampleRef = resultEl.getAttribute('sampleRef') || '';
    if (!sampleRef) continue;
    const props = collectProperties(resultEl);
    const name = props.name;
    if (!name) continue;
    const contentEl = resultEl.getElementsByTagName('content')[0] ?? null;
    const text = contentEl?.textContent?.trim() ?? '';
    const num = numberFrom(text, null);
    if (num === null) continue;
    if (!measurementByRef[sampleRef]) measurementByRef[sampleRef] = {};
    measurementByRef[sampleRef][name] = num;
  }

  const materials: Material[] = [];

  for (const el of Array.from(materialEls)) {
    const idAttr = el.getAttribute('id') || '';
    const props = collectProperties(el);
    const id = idAttr || props.SampleId || '';
    if (!id) {
      warnings.push('id 属性も SampleId property も無い <material> をスキップしました');
      continue;
    }

    const measurements = measurementByRef[id] || {};
    if (measurements.hardness === undefined || measurements.tensileStrength === undefined) {
      warnings.push(`${id}: 必須の測定値 (hardness / tensileStrength) が不足しています`);
    }

    const material: Material = {
      id,
      name: props.SampleName ?? '',
      cat: (props.Category as MaterialCategory) || '金属合金',
      hv: measurements.hardness ?? 0,
      ts: measurements.tensileStrength ?? 0,
      el: measurements.elasticModulus ?? 0,
      pf: measurements.proofStress ?? null,
      el2: measurements.elongation ?? 0,
      dn: measurements.density ?? 0,
      comp: props.Composition ?? '',
      batch: props.Batch ?? '',
      date: props.RegisteredOn ?? '',
      author: props.Author ?? '',
      status: (props.Status as MaterialStatus) || '登録済',
      ai: props.AiDetected === 'true',
      memo: props.Memo ?? '',
    };

    materials.push(material);
  }

  return { materials, generatedAt, source, warnings };
}

// ----- File helpers -----

export function downloadMaimlFile(xml: string, filename: string): void {
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.maiml') || filename.endsWith('.xml')
    ? filename
    : `${filename}.maiml`;
  a.click();
  // Give the browser a moment to start the download before revoking the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function defaultMaimlFilename(prefix = 'matlens'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.maiml`;
}
