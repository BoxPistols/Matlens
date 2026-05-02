import { describe, it, expect } from 'vitest';
import { validateMaiml } from './maimlValidate';

const VALID_MIN = `<?xml version="1.0" encoding="UTF-8"?>
<maiml version="1.0">
  <header>
    <property key="generatedAt">2026-05-03T10:00:00.000Z</property>
    <property key="source">matlens</property>
    <property key="documentKind">material</property>
  </header>
  <data>
    <results>
      <material id="MAT-1">
        <property key="SampleId">MAT-1</property>
        <property key="SampleName">SUS304</property>
        <property key="Author">研究員</property>
        <property key="RegisteredOn">2026-04-01</property>
        <property key="AiDetected">false</property>
      </material>
      <result sampleRef="MAT-1">
        <property key="name">hardness</property>
        <property key="unit">HV</property>
        <property key="uncertainty">3.0</property>
        <content>186</content>
      </result>
    </results>
  </data>
</maiml>`;

describe('validateMaiml', () => {
  it('returns no errors for a valid minimal MaiML', () => {
    const r = validateMaiml(VALID_MIN);
    expect(r.errorCount).toBe(0);
  });

  it('returns header metadata', () => {
    const r = validateMaiml(VALID_MIN);
    expect(r.documentKind).toBe('material');
    expect(r.source).toBe('matlens');
    expect(r.generatedAt).toContain('2026-05-03T');
  });

  it('flags empty input as error', () => {
    const r = validateMaiml('');
    expect(r.errorCount).toBe(1);
    expect(r.issues[0]?.code).toBe('empty');
  });

  it('refuses DOCTYPE for security', () => {
    const r = validateMaiml('<!DOCTYPE foo><maiml/>');
    expect(r.errorCount).toBeGreaterThan(0);
    expect(r.issues.some((i) => i.code === 'doctype-forbidden')).toBe(true);
  });

  it('flags wrong root element', () => {
    const r = validateMaiml('<not-maiml/>');
    expect(r.issues.some((i) => i.code === 'root-not-maiml')).toBe(true);
  });

  it('warns when generatedAt is missing', () => {
    const xml = VALID_MIN.replace('<property key="generatedAt">2026-05-03T10:00:00.000Z</property>', '');
    const r = validateMaiml(xml);
    expect(r.issues.some((i) => i.code === 'header-generatedAt-missing')).toBe(true);
    expect(r.warnCount).toBeGreaterThan(0);
  });

  it('warns when uncertainty is missing on result', () => {
    const xml = VALID_MIN.replace('<property key="uncertainty">3.0</property>', '');
    const r = validateMaiml(xml);
    expect(r.issues.some((i) => i.code === 'result-uncertainty-missing')).toBe(true);
  });

  it('returns info when material provenance is thin', () => {
    const xml = VALID_MIN
      .replace('<property key="Author">研究員</property>', '')
      .replace('<property key="RegisteredOn">2026-04-01</property>', '')
      .replace('<property key="AiDetected">false</property>', '');
    const r = validateMaiml(xml);
    expect(r.issues.some((i) => i.code === 'material-provenance-thin')).toBe(true);
    expect(r.infoCount).toBeGreaterThan(0);
  });

  it('warns on missing data block', () => {
    const xml = `<?xml version="1.0"?>
<maiml version="1.0">
  <header><property key="generatedAt">2026-05-03T10:00:00.000Z</property><property key="source">x</property><property key="documentKind">material</property></header>
  <data><results /></data>
</maiml>`;
    const r = validateMaiml(xml);
    expect(r.issues.some((i) => i.code === 'no-data-block')).toBe(true);
  });
});
