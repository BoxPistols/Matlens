import { describe, expect, it } from 'vitest';
import type { Project } from '@/domain/types';
import { applyProjectSort, matchProjectFilter } from './project.filter';

const baseProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'prj_x',
  code: 'IIC-2026-9999',
  title: 'サンプル案件',
  customerId: 'cst_001',
  industryTagIds: ['ind_infra_energy'],
  status: 'in_progress',
  startedAt: '2026-01-01',
  dueAt: '2026-06-30',
  completedAt: null,
  specimenCount: 0,
  testCount: 0,
  pmId: 'usr_pm_001',
  leadEngineerId: 'usr_eng_001',
  description: null,
  createdAt: '2026-01-01T00:00:00+09:00',
  updatedAt: '2026-01-01T00:00:00+09:00',
  createdBy: 'usr_pm_001',
  updatedBy: 'usr_pm_001',
  ...overrides,
});

describe('matchProjectFilter', () => {
  it('filter なしなら常に true', () => {
    expect(matchProjectFilter(baseProject())).toBe(true);
    expect(matchProjectFilter(baseProject(), {})).toBe(true);
  });

  it('status 配列にマッチするものだけ true', () => {
    const p = baseProject({ status: 'completed' });
    expect(matchProjectFilter(p, { filter: { status: ['completed'] } })).toBe(true);
    expect(matchProjectFilter(p, { filter: { status: ['in_progress'] } })).toBe(false);
  });

  it('status が空配列なら無視', () => {
    expect(matchProjectFilter(baseProject(), { filter: { status: [] } })).toBe(true);
  });

  it('industryTagIds は OR セマンティクス（いずれかが一致すれば true）', () => {
    const p = baseProject({ industryTagIds: ['ind_aerospace', 'ind_safety'] });
    expect(
      matchProjectFilter(p, {
        filter: { industryTagIds: ['ind_aerospace', 'ind_env_carbon'] },
      })
    ).toBe(true);
    expect(
      matchProjectFilter(p, {
        filter: { industryTagIds: ['ind_env_carbon'] },
      })
    ).toBe(false);
  });

  it('dueBefore は dueAt が同じか前なら true、後なら false', () => {
    const p = baseProject({ dueAt: '2026-06-30' });
    expect(matchProjectFilter(p, { filter: { dueBefore: '2026-06-30' } })).toBe(true);
    expect(matchProjectFilter(p, { filter: { dueBefore: '2026-12-31' } })).toBe(true);
    expect(matchProjectFilter(p, { filter: { dueBefore: '2026-01-01' } })).toBe(false);
  });

  it('dueBefore は dueAt が null のとき素通し', () => {
    const p = baseProject({ dueAt: null });
    expect(matchProjectFilter(p, { filter: { dueBefore: '2026-01-01' } })).toBe(true);
  });

  it('search は title / code を大文字小文字無視で部分一致', () => {
    const p = baseProject({ title: 'SUS316L 配管調査', code: 'IIC-2026-0042' });
    expect(matchProjectFilter(p, { filter: { search: 'sus316' } })).toBe(true);
    expect(matchProjectFilter(p, { filter: { search: '0042' } })).toBe(true);
    expect(matchProjectFilter(p, { filter: { search: 'no-match' } })).toBe(false);
  });

  it('customerId は完全一致', () => {
    const p = baseProject({ customerId: 'cst_005' });
    expect(matchProjectFilter(p, { filter: { customerId: 'cst_005' } })).toBe(true);
    expect(matchProjectFilter(p, { filter: { customerId: 'cst_006' } })).toBe(false);
  });
});

describe('applyProjectSort', () => {
  const a = baseProject({ id: 'a', title: 'apple', dueAt: '2026-01-01' });
  const b = baseProject({ id: 'b', title: 'banana', dueAt: null });
  const c = baseProject({ id: 'c', title: 'cherry', dueAt: '2026-12-31' });

  it('sort なしなら元の順序を保持', () => {
    expect(applyProjectSort([a, b, c]).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('title 昇順', () => {
    expect(
      applyProjectSort([c, a, b], { sort: { field: 'title', order: 'asc' } }).map((p) => p.id)
    ).toEqual(['a', 'b', 'c']);
  });

  it('title 降順', () => {
    expect(
      applyProjectSort([a, b, c], { sort: { field: 'title', order: 'desc' } }).map((p) => p.id)
    ).toEqual(['c', 'b', 'a']);
  });

  it('null は順序によらず末尾に寄せる', () => {
    const ascIds = applyProjectSort([b, c, a], { sort: { field: 'dueAt', order: 'asc' } }).map(
      (p) => p.id
    );
    expect(ascIds).toEqual(['a', 'c', 'b']);

    const descIds = applyProjectSort([b, c, a], { sort: { field: 'dueAt', order: 'desc' } }).map(
      (p) => p.id
    );
    expect(descIds).toEqual(['c', 'a', 'b']);
  });

  it('元配列を破壊しない', () => {
    const items = [c, a, b];
    applyProjectSort(items, { sort: { field: 'title', order: 'asc' } });
    expect(items.map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });
});
