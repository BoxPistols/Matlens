import { describe, expect, it } from 'vitest';
import { ORG_ACCENT } from './StandardsListPage';

describe('ORG_ACCENT', () => {
  it('StandardOrg 全値に色が定義されている', () => {
    const orgs = ['JIS', 'ASTM', 'ASME', 'ISO', 'EN', 'other'] as const;
    for (const o of orgs) {
      expect(ORG_ACCENT[o]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('JIS は赤系、ASTM は青系', () => {
    expect(ORG_ACCENT.JIS).toBe('#ef4444');
    expect(ORG_ACCENT.ASTM).toBe('#3b82f6');
  });
});
