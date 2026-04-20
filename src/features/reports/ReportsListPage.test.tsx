import { describe, expect, it } from 'vitest';
import {
  REPORT_KIND_LABEL,
  REPORT_STATUS_ACCENT,
  REPORT_STATUS_LABEL,
} from './ReportsListPage';

describe('REPORT_KIND_LABEL', () => {
  it('全 kind に日本語ラベルが定義されている', () => {
    const kinds = [
      'test_report',
      'damage_analysis',
      'material_certification',
      'inspection',
      'summary',
    ] as const;
    for (const k of kinds) {
      expect(REPORT_KIND_LABEL[k]).toBeTruthy();
    }
  });
});

describe('REPORT_STATUS_LABEL / REPORT_STATUS_ACCENT', () => {
  it('全 status にラベルと色が揃っている', () => {
    const statuses = ['draft', 'review', 'approved', 'issued', 'archived'] as const;
    for (const s of statuses) {
      expect(REPORT_STATUS_LABEL[s]).toBeTruthy();
      expect(REPORT_STATUS_ACCENT[s]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('issued は緑、draft はグレー', () => {
    expect(REPORT_STATUS_ACCENT.issued).toBe('#22c55e');
    expect(REPORT_STATUS_ACCENT.draft).toBe('#64748b');
  });
});
