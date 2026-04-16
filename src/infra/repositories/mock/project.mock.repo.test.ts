import { beforeEach, describe, expect, it } from 'vitest';
import { createMockProjectRepository } from './project.mock.repo';
import { resetMockDatabase } from '@/mocks/database';

describe('createMockProjectRepository', () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  it('list() は seed 固定で 150 件の案件を返す', async () => {
    const repo = createMockProjectRepository();
    const page1 = await repo.list({ page: 1, pageSize: 50 });
    expect(page1.pagination.total).toBe(150);
    expect(page1.items.length).toBe(50);
  });

  it('list() はステータス配列でフィルタできる', async () => {
    const repo = createMockProjectRepository();
    const result = await repo.list({
      filter: { status: ['in_progress'] },
      pageSize: 200,
    });
    expect(result.items.every((p) => p.status === 'in_progress')).toBe(true);
  });

  it('findById() は存在しないIDで null を返す', async () => {
    const repo = createMockProjectRepository();
    const notFound = await repo.findById('prj_not_exists');
    expect(notFound).toBeNull();
  });

  it('create() + findById() でラウンドトリップできる', async () => {
    const repo = createMockProjectRepository();
    const created = await repo.create({
      title: 'テスト用案件',
      customerId: 'cst_001',
      industryTagIds: ['ind_infra_energy'],
      pmId: 'usr_pm_001',
      leadEngineerId: 'usr_eng_001',
    });
    expect(created.id).toMatch(/^prj_/);
    expect(created.status).toBe('inquiry');

    const found = await repo.findById(created.id);
    expect(found?.title).toBe('テスト用案件');
  });

  it('update() でステータス遷移できる', async () => {
    const repo = createMockProjectRepository();
    const created = await repo.create({
      title: '遷移テスト',
      customerId: 'cst_001',
      industryTagIds: [],
      pmId: 'usr_pm_001',
      leadEngineerId: 'usr_eng_001',
    });
    const updated = await repo.update(created.id, { status: 'in_progress' });
    expect(updated.status).toBe('in_progress');
  });

  it('delete() は冪等に削除する', async () => {
    const repo = createMockProjectRepository();
    const created = await repo.create({
      title: '削除用',
      customerId: 'cst_001',
      industryTagIds: [],
      pmId: 'usr_pm_001',
      leadEngineerId: 'usr_eng_001',
    });
    await repo.delete(created.id);
    expect(await repo.findById(created.id)).toBeNull();
  });
});
