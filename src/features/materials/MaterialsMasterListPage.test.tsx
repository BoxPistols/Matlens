import { describe, expect, it } from 'vitest';
import { MATERIAL_CATEGORY_LABEL } from './MaterialsMasterListPage';

describe('MATERIAL_CATEGORY_LABEL', () => {
  it('全カテゴリに日本語ラベルが定義されている', () => {
    const categories = [
      'steel',
      'stainless',
      'aluminum',
      'titanium',
      'nickel_alloy',
      'copper',
      'polymer',
      'composite',
      'ceramic',
      'other',
    ] as const;
    for (const c of categories) {
      expect(MATERIAL_CATEGORY_LABEL[c]).toBeTruthy();
      expect(typeof MATERIAL_CATEGORY_LABEL[c]).toBe('string');
    }
  });

  it('ステンレスカテゴリは "ステンレス" を返す', () => {
    expect(MATERIAL_CATEGORY_LABEL.stainless).toBe('ステンレス');
  });
});
