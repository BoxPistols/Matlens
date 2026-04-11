import { describe, it, expect } from 'vitest';
import {
  serializeMaterialToMaiml,
  serializeMaterialsToMaiml,
  parseMaimlToMaterials,
  defaultMaimlFilename,
} from './maiml';
import type { Material } from '../types';

const sample: Material = {
  id: 'MAT-0001',
  name: 'SUS316L 低炭素ステンレス',
  cat: '金属合金',
  hv: 186,
  ts: 520,
  el: 193,
  pf: 205,
  el2: 55,
  dn: 7.98,
  comp: 'Fe-17Cr-12Ni-2Mo-0.03C',
  batch: 'B-001',
  date: '2026-01-15',
  author: '山田 研',
  status: '承認済',
  ai: false,
  memo: '医療機器用途で実績あり',
};

const withXmlSpecials: Material = {
  ...sample,
  id: 'MAT-0002',
  name: 'A & B "Alloy" <test>',
  comp: "C'arbon & iron",
  memo: '',
};

describe('serializeMaterialsToMaiml', () => {
  it('produces a well-formed XML document with the root <maiml> element', () => {
    const xml = serializeMaterialsToMaiml([sample], {
      generatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<maiml version="1.0">');
    expect(xml).toContain('</maiml>');
  });

  it('includes header metadata', () => {
    const xml = serializeMaterialsToMaiml([sample], {
      generatedAt: new Date('2026-04-10T00:00:00.000Z'),
      source: 'vitest',
    });
    expect(xml).toContain('<property key="generatedAt">2026-04-10T00:00:00.000Z</property>');
    expect(xml).toContain('<property key="source">vitest</property>');
    expect(xml).toContain('<property key="count">1</property>');
  });

  it('emits sample metadata as property children', () => {
    const xml = serializeMaterialsToMaiml([sample]);
    expect(xml).toContain('<material id="MAT-0001">');
    expect(xml).toContain('<property key="SampleName">SUS316L 低炭素ステンレス</property>');
    expect(xml).toContain('<property key="Category">金属合金</property>');
    expect(xml).toContain('<property key="Composition">Fe-17Cr-12Ni-2Mo-0.03C</property>');
    expect(xml).toContain('<property key="Author">山田 研</property>');
  });

  it('emits each numeric measurement as a <result> with content', () => {
    const xml = serializeMaterialsToMaiml([sample]);
    expect(xml).toContain('<result sampleRef="MAT-0001">');
    expect(xml).toContain('<property key="name">hardness</property>');
    expect(xml).toContain('<property key="unit">HV</property>');
    expect(xml).toContain('<content>186</content>');
    expect(xml).toContain('<property key="name">tensileStrength</property>');
    expect(xml).toContain('<content>520</content>');
    expect(xml).toContain('<property key="name">density</property>');
    expect(xml).toContain('<content>7.98</content>');
  });

  it('escapes XML special characters in text content', () => {
    const xml = serializeMaterialsToMaiml([withXmlSpecials]);
    expect(xml).toContain('A &amp; B &quot;Alloy&quot; &lt;test&gt;');
    expect(xml).toContain('C&apos;arbon &amp; iron');
    // Raw unescaped chars should not leak through
    expect(xml).not.toMatch(/>A & B "Alloy" <test></);
  });

  it('omits Memo when empty', () => {
    const xml = serializeMaterialsToMaiml([withXmlSpecials]);
    expect(xml).not.toContain('<property key="Memo">');
  });

  it('omits proofStress result when material.pf is null', () => {
    const xml = serializeMaterialsToMaiml([{ ...sample, pf: null }]);
    expect(xml).not.toContain('<property key="name">proofStress</property>');
  });
});

describe('parseMaimlToMaterials', () => {
  it('round-trips a single material with all fields intact', () => {
    const xml = serializeMaterialToMaiml(sample);
    const { materials, warnings } = parseMaimlToMaterials(xml);
    expect(warnings).toEqual([]);
    expect(materials).toHaveLength(1);
    expect(materials[0]).toMatchObject({
      id: sample.id,
      name: sample.name,
      cat: sample.cat,
      comp: sample.comp,
      hv: sample.hv,
      ts: sample.ts,
      el: sample.el,
      pf: sample.pf,
      el2: sample.el2,
      dn: sample.dn,
      batch: sample.batch,
      date: sample.date,
      author: sample.author,
      status: sample.status,
      ai: sample.ai,
      memo: sample.memo,
    });
  });

  it('round-trips XML-special characters', () => {
    const xml = serializeMaterialToMaiml(withXmlSpecials);
    const { materials } = parseMaimlToMaterials(xml);
    expect(materials[0]!.name).toBe('A & B "Alloy" <test>');
    expect(materials[0]!.comp).toBe("C'arbon & iron");
  });

  it('round-trips multiple materials in a single document', () => {
    const other = { ...sample, id: 'MAT-0002', name: 'Ti-6Al-4V', hv: 350 };
    const xml = serializeMaterialsToMaiml([sample, other]);
    const { materials } = parseMaimlToMaterials(xml);
    expect(materials).toHaveLength(2);
    expect(materials[0]!.id).toBe('MAT-0001');
    expect(materials[1]!.id).toBe('MAT-0002');
    expect(materials[1]!.hv).toBe(350);
  });

  it('reads header generatedAt and source', () => {
    const xml = serializeMaterialsToMaiml([sample], {
      generatedAt: new Date('2026-04-10T12:34:56.000Z'),
      source: 'vitest',
    });
    const result = parseMaimlToMaterials(xml);
    expect(result.generatedAt).toBe('2026-04-10T12:34:56.000Z');
    expect(result.source).toBe('vitest');
  });

  it('throws on malformed XML', () => {
    expect(() => parseMaimlToMaterials('<<not xml>>')).toThrow(/MaiML/);
  });

  it('throws when the root element is wrong', () => {
    expect(() =>
      parseMaimlToMaterials('<?xml version="1.0"?><other><hi/></other>')
    ).toThrow(/ルート要素/);
  });

  it('rejects DOCTYPE declarations (Billion Laughs / XXE hardening)', () => {
    const evil = `<?xml version="1.0"?>
<!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;">]>
<maiml><data><results></results></data></maiml>`;
    expect(() => parseMaimlToMaterials(evil)).toThrow(/DOCTYPE/);
  });

  it('rejects documents exceeding MAIML_MAX_BYTES', () => {
    const huge = '<?xml version="1.0"?><maiml>' + 'a'.repeat(11 * 1024 * 1024) + '</maiml>';
    expect(() => parseMaimlToMaterials(huge)).toThrow(/ファイルサイズ/);
  });

  it('restores null proofStress when the result element was omitted', () => {
    const xml = serializeMaterialToMaiml({ ...sample, pf: null });
    const { materials } = parseMaimlToMaterials(xml);
    expect(materials[0]!.pf).toBeNull();
  });
});

describe('defaultMaimlFilename', () => {
  it('produces a dated .maiml filename with the given prefix', () => {
    const name = defaultMaimlFilename('matlens');
    expect(name).toMatch(/^matlens_\d{4}-\d{2}-\d{2}\.maiml$/);
  });
});
