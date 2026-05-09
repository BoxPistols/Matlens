import { describe, it, expect } from 'vitest';
import {
  parseCsv,
  parseCsvWithHeader,
  inferColumnMapping,
  buildMaterialsFromCsv,
  convertCsvToMaiml,
  type ColumnMapping,
} from './csvToMaiml';

describe('parseCsv', () => {
  it('basic 3-column CSV を行ごとに分割する', () => {
    const out = parseCsv('a,b,c\n1,2,3\n4,5,6\n');
    expect(out).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
      ['4', '5', '6'],
    ]);
  });

  it('UTF-8 BOM を黙って捨てる', () => {
    const out = parseCsv('\uFEFFid,name\nA,B');
    expect(out[0]).toEqual(['id', 'name']);
  });

  it('ダブルクォート内のカンマと改行を保持する', () => {
    const out = parseCsv('id,memo\n1,"a, b\nc"\n');
    expect(out).toEqual([
      ['id', 'memo'],
      ['1', 'a, b\nc'],
    ]);
  });

  it('"" を " にエスケープする', () => {
    const out = parseCsv('id,memo\n1,"he said ""hi"""');
    expect(out[1]).toEqual(['1', 'he said "hi"']);
  });

  it('CRLF を区切りとして扱う', () => {
    const out = parseCsv('a,b\r\n1,2\r\n');
    expect(out).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('完全な空行は無視する', () => {
    const out = parseCsv('a,b\n\n1,2\n\n');
    expect(out).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('inferColumnMapping', () => {
  it('日本語ヘッダから推測する', () => {
    const mapping = inferColumnMapping(['材料ID', '材料名', '硬度', '引張強さ']);
    expect(mapping.id).toBe('材料ID');
    expect(mapping.name).toBe('材料名');
    expect(mapping.hv).toBe('硬度');
    expect(mapping.ts).toBe('引張強さ');
  });

  it('英語ヘッダから推測する', () => {
    const mapping = inferColumnMapping(['SampleId', 'SampleName', 'HV', 'Tensile Strength']);
    expect(mapping.id).toBe('SampleId');
    expect(mapping.name).toBe('SampleName');
    expect(mapping.hv).toBe('HV');
    expect(mapping.ts).toBe('Tensile Strength');
  });

  it('既知でないヘッダは触らない', () => {
    const mapping = inferColumnMapping(['unknown_col', 'foo']);
    expect(Object.keys(mapping)).toHaveLength(0);
  });

  it('同一フィールドへの重複割当は最初の 1 つだけ', () => {
    // hardness と HV は両方とも hv のヒント。先に来た方が勝つ。
    const mapping = inferColumnMapping(['hardness', 'HV']);
    expect(mapping.hv).toBe('hardness');
  });
});

describe('buildMaterialsFromCsv', () => {
  const csv = parseCsvWithHeader([
    'ID,Name,Category,HV,Tensile Strength',
    'M-001,Ti-6Al-4V,金属合金,340,950',
    'M-002,SUS316L,金属合金,180,520',
  ].join('\n'));

  it('必須割当があれば Material[] を返す', () => {
    const mapping: ColumnMapping = {
      id: 'ID', name: 'Name', cat: 'Category', hv: 'HV', ts: 'Tensile Strength',
    };
    const { materials, warnings } = buildMaterialsFromCsv(csv, mapping);
    expect(materials).toHaveLength(2);
    expect(materials[0]?.id).toBe('M-001');
    expect(materials[0]?.hv).toBe(340);
    expect(materials[1]?.ts).toBe(520);
    expect(warnings).toEqual([]);
  });

  it('id 未割当だと致命的で空配列 + warning', () => {
    const mapping: ColumnMapping = { name: 'Name' };
    const { materials, warnings } = buildMaterialsFromCsv(csv, mapping);
    expect(materials).toEqual([]);
    expect(warnings.some((w) => w.includes('id'))).toBe(true);
  });

  it('必須数値が読めない行は 0 + warning に落として継続する', () => {
    const broken = parseCsvWithHeader('ID,Name,HV\nM-001,Ti,abc');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', hv: 'HV' };
    const { materials, warnings } = buildMaterialsFromCsv(broken, mapping);
    expect(materials).toHaveLength(1);
    expect(materials[0]?.hv).toBe(0);
    expect(warnings.some((w) => w.includes('hv'))).toBe(true);
  });

  it('id / name が空の行は skip', () => {
    const data = parseCsvWithHeader('ID,Name\nM-001,Ti\n,Skipped');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials).toHaveLength(1);
    expect(warnings.some((w) => w.includes('スキップ'))).toBe(true);
  });

  it('カテゴリの英語表記を吸収する', () => {
    const data = parseCsvWithHeader('ID,Name,Cat\nM-001,Ti,metal alloy');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', cat: 'Cat' };
    const { materials } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.cat).toBe('金属合金');
  });
});

describe('convertCsvToMaiml', () => {
  it('CSV → MaiML XML round-trip', () => {
    const csvText = [
      'ID,Name,Category,HV,Tensile Strength',
      'M-001,Ti-6Al-4V,金属合金,340,950',
    ].join('\n');
    const mapping: ColumnMapping = {
      id: 'ID', name: 'Name', cat: 'Category', hv: 'HV', ts: 'Tensile Strength',
    };
    const { materials, maiml, warnings } = convertCsvToMaiml(csvText, mapping, {
      generatedAt: new Date('2026-05-10T00:00:00Z'),
    });
    expect(materials).toHaveLength(1);
    expect(warnings).toEqual([]);
    expect(maiml).toContain('<maiml');
    expect(maiml).toContain('M-001');
    expect(maiml).toContain('Ti-6Al-4V');
    expect(maiml).toContain('matlens-csv-import');
  });
});
