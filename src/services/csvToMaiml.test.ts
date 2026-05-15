import { describe, it, expect } from 'vitest';
import {
  parseCsv,
  parseCsvWithHeader,
  inferColumnMapping,
  buildMaterialsFromCsv,
  convertCsvToMaiml,
  REQUIRED_FIELDS,
  SAMPLE_CSV,
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

  it('単位入りヘッダ (Hardness(HV) / Tensile(MPa) 等) を fallback で拾う', () => {
    const mapping = inferColumnMapping([
      'Hardness(HV)',
      'Tensile(MPa)',
      'Young(GPa)',
      'Elongation(%)',
      '0.2%Proof(MPa)',
      'Density',
    ]);
    expect(mapping.hv).toBe('Hardness(HV)');
    expect(mapping.ts).toBe('Tensile(MPa)');
    expect(mapping.el).toBe('Young(GPa)');
    expect(mapping.el2).toBe('Elongation(%)');
    expect(mapping.pf).toBe('0.2%Proof(MPa)');
    expect(mapping.dn).toBe('Density');
  });

  it('空白入りヘッダ (Sample Name / バッチ No 等) を吸収する', () => {
    const mapping = inferColumnMapping(['Sample Name', 'バッチ No', '材料ID']);
    expect(mapping.name).toBe('Sample Name');
    expect(mapping.batch).toBe('バッチ No');
    expect(mapping.id).toBe('材料ID');
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
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.cat).toBe('金属合金');
    // 英語表記は「認識済み」扱いなのでカテゴリ起因の warning は出ない
    expect(warnings.some((w) => w.includes('カテゴリ'))).toBe(false);
  });

  it('未認識カテゴリは "金属合金" にフォールバックしつつ warning を出す', () => {
    const data = parseCsvWithHeader('ID,Name,Cat\nM-001,Ti,unobtanium');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', cat: 'Cat' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.cat).toBe('金属合金');
    expect(warnings.some((w) => w.includes('カテゴリ') && w.includes('unobtanium'))).toBe(true);
  });

  it('未認識ステータスは "レビュー待" にフォールバックしつつ warning を出す', () => {
    const data = parseCsvWithHeader('ID,Name,Status\nM-001,Ti,bogus-state');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', status: 'Status' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.status).toBe('レビュー待');
    expect(warnings.some((w) => w.includes('ステータス') && w.includes('bogus-state'))).toBe(true);
  });

  it('CSV 内で重複している ID は 2 件目以降を skip して warning に落とす', () => {
    const data = parseCsvWithHeader('ID,Name\nM-001,Ti A\nM-001,Ti A 再登録\nM-002,Ti B');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials).toHaveLength(2);
    expect(materials[0]?.name).toBe('Ti A');
    expect(materials[1]?.id).toBe('M-002');
    expect(warnings.some((w) => w.includes('M-001') && w.includes('重複'))).toBe(true);
  });

  it('任意数値の不正値 (—, abc 等) は 0 + warning に落とす', () => {
    const data = parseCsvWithHeader('ID,Name,弾性率,密度\nM-001,Ti,—,3.95\nM-002,Al,abc,2.7');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', el: '弾性率', dn: '密度' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials).toHaveLength(2);
    expect(materials[0]?.el).toBe(0);
    expect(materials[0]?.dn).toBe(3.95);
    expect(materials[1]?.el).toBe(0);
    expect(warnings.some((w) => w.includes('M-001') && w.includes('el') && w.includes('—'))).toBe(true);
    expect(warnings.some((w) => w.includes('M-002') && w.includes('el') && w.includes('abc'))).toBe(true);
  });

  it('任意数値の空欄は silent に 0 で通る（warning 出さない）', () => {
    const data = parseCsvWithHeader('ID,Name,弾性率\nM-001,Ti,');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', el: '弾性率' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.el).toBe(0);
    expect(warnings).toEqual([]);
  });

  it('pf の不正値は null + warning に落とす', () => {
    const data = parseCsvWithHeader('ID,Name,耐力\nM-001,Ti,—');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', pf: '耐力' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.pf).toBe(null);
    expect(warnings.some((w) => w.includes('pf') && w.includes('—'))).toBe(true);
  });

  it('未認識 provenance は warning + undefined にフォールバック', () => {
    const data = parseCsvWithHeader('ID,Name,Provenance\nM-001,Ti,unknown-src');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', provenance: 'Provenance' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.provenance).toBeUndefined();
    expect(warnings.some((w) => w.includes('provenance') && w.includes('unknown-src'))).toBe(true);
  });

  it('provenance 空欄は silent に undefined', () => {
    const data = parseCsvWithHeader('ID,Name,Provenance\nM-001,Ti,');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', provenance: 'Provenance' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.provenance).toBeUndefined();
    expect(warnings).toEqual([]);
  });

  it('date の形式違反は warning + 今日の日付にフォールバック', () => {
    const data = parseCsvWithHeader('ID,Name,登録日\nM-001,Ti,2026/5/10\nM-002,Al,未定');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', date: '登録日' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials).toHaveLength(2);
    // フォールバック値は今日の日付 (YYYY-MM-DD)
    expect(materials[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(materials[1]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(warnings.some((w) => w.includes('M-001') && w.includes('2026/5/10'))).toBe(true);
    expect(warnings.some((w) => w.includes('M-002') && w.includes('未定'))).toBe(true);
  });

  it('date が ISO datetime / YYYY-MM-DD ならそのまま通る', () => {
    const data = parseCsvWithHeader('ID,Name,登録日\nM-001,Ti,2026-05-15\nM-002,Al,2026-05-15T10:00:00Z');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', date: '登録日' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.date).toBe('2026-05-15');
    expect(materials[1]?.date).toBe('2026-05-15T10:00:00Z');
    expect(warnings).toEqual([]);
  });

  it('date が YYYY-MM-DD で始まっても末尾にゴミがあれば warning', () => {
    const data = parseCsvWithHeader('ID,Name,登録日\nM-001,Ti,2026-05-15garbage');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', date: '登録日' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(warnings.some((w) => w.includes('2026-05-15garbage'))).toBe(true);
  });

  it('pf の不正値 warning は「未設定 (null)」と表現する', () => {
    const data = parseCsvWithHeader('ID,Name,耐力\nM-001,Ti,abc');
    const mapping: ColumnMapping = { id: 'ID', name: 'Name', pf: '耐力' };
    const { materials, warnings } = buildMaterialsFromCsv(data, mapping);
    expect(materials[0]?.pf).toBe(null);
    expect(warnings.some((w) => w.includes('未設定') && w.includes('null'))).toBe(true);
  });
});

describe('REQUIRED_FIELDS', () => {
  it('UI と service で共有する公開定数', () => {
    expect(REQUIRED_FIELDS).toEqual(['id', 'name']);
  });
});

describe('SAMPLE_CSV', () => {
  it('そのまま convert に流して preview に出せる', () => {
    const csv = parseCsvWithHeader(SAMPLE_CSV);
    const mapping = inferColumnMapping(csv.headers);
    // 必須 (id / name) と中核数値 (hv / ts) は自動推測で埋まる前提
    expect(mapping.id).toBeDefined();
    expect(mapping.name).toBeDefined();
    expect(mapping.hv).toBeDefined();
    expect(mapping.ts).toBeDefined();

    const { materials, warnings } = buildMaterialsFromCsv(csv, mapping);
    expect(materials.length).toBeGreaterThanOrEqual(5);
    expect(warnings).toEqual([]);
    expect(materials[0]?.id).toBe('M-101');
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
