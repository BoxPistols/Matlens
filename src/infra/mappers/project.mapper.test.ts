import { describe, expect, it } from 'vitest';
import { projectMapper } from './project.mapper';
import type { Project } from '@/domain/types';
import type { ProjectDTO } from '@/infra/api/types';

const sampleDTO: ProjectDTO = {
  id: 'prj_0001',
  code: 'IIC-2026-0001',
  title: 'SUS316L 配管 応力腐食き裂 原因調査',
  customer_id: 'cst_001',
  industry_tag_ids: ['ind_infra_energy'],
  status: 'in_progress',
  started_at: '2026-02-01',
  due_at: '2026-05-31',
  completed_at: null,
  specimen_count: 5,
  test_count: 14,
  pm_id: 'usr_pm_001',
  lead_engineer_id: 'usr_eng_001',
  description: null,
  created_at: '2026-02-01T09:00:00+09:00',
  updated_at: '2026-03-12T18:00:00+09:00',
  created_by: 'usr_pm_001',
  updated_by: 'usr_eng_001',
};

describe('projectMapper', () => {
  it('DTO を Domain モデルに正しく変換する', () => {
    const domain = projectMapper.fromDTO(sampleDTO);
    expect(domain.id).toBe('prj_0001');
    expect(domain.customerId).toBe('cst_001');
    expect(domain.industryTagIds).toEqual(['ind_infra_energy']);
    expect(domain.specimenCount).toBe(5);
    expect(domain.pmId).toBe('usr_pm_001');
    expect(domain.dueAt).toBe('2026-05-31');
  });

  it('Domain モデルを DTO に戻すと、情報が保持される（ラウンドトリップ）', () => {
    const domain = projectMapper.fromDTO(sampleDTO);
    const dto = projectMapper.toDTO(domain);
    expect(dto).toEqual(sampleDTO);
  });

  it('CreateProjectInput を CreateProjectDTO にマッピングする', () => {
    const dto = projectMapper.toCreateDTO({
      title: '新規案件',
      customerId: 'cst_001',
      industryTagIds: ['ind_auto_industrial'],
      pmId: 'usr_pm_001',
      leadEngineerId: 'usr_eng_001',
    });
    expect(dto).toEqual({
      title: '新規案件',
      customer_id: 'cst_001',
      industry_tag_ids: ['ind_auto_industrial'],
      due_at: null,
      pm_id: 'usr_pm_001',
      lead_engineer_id: 'usr_eng_001',
      description: null,
    });
  });

  it('UpdateProjectInput で undefined フィールドは除外される', () => {
    const dto = projectMapper.toUpdateDTO({ title: '更新済みタイトル' });
    expect(dto).toEqual({ title: '更新済みタイトル' });
    expect('status' in dto).toBe(false);
  });

  it('QueryParams はスネークケース化される', () => {
    const params = projectMapper.queryToParams({
      filter: { status: ['in_progress'], customerId: 'cst_001', search: 'SUS316L' },
      sort: { field: 'dueAt', order: 'asc' },
      page: 2,
      pageSize: 50,
    });
    expect(params).toEqual({
      status: 'in_progress',
      customer_id: 'cst_001',
      search: 'SUS316L',
      sort: 'dueAt:asc',
      page: '2',
      page_size: '50',
    });
  });
});
