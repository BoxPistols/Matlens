// Project: DTO ⇄ Domain マッパー

import type {
  CreateProjectInput,
  Project,
  ProjectStatus,
  UpdateProjectInput,
} from '@/domain/types';
import type {
  CreateProjectDTO,
  ProjectDTO,
  UpdateProjectDTO,
} from '@/infra/api/types';
import type { ProjectQuery } from '@/infra/repositories/interfaces/project.repo';

export const projectMapper = {
  fromDTO(dto: ProjectDTO): Project {
    return {
      id: dto.id,
      code: dto.code,
      title: dto.title,
      customerId: dto.customer_id,
      industryTagIds: dto.industry_tag_ids,
      status: dto.status as ProjectStatus,
      startedAt: dto.started_at,
      dueAt: dto.due_at,
      completedAt: dto.completed_at,
      specimenCount: dto.specimen_count,
      testCount: dto.test_count,
      pmId: dto.pm_id,
      leadEngineerId: dto.lead_engineer_id,
      description: dto.description,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
      createdBy: dto.created_by,
      updatedBy: dto.updated_by,
    };
  },

  toDTO(project: Project): ProjectDTO {
    return {
      id: project.id,
      code: project.code,
      title: project.title,
      customer_id: project.customerId,
      industry_tag_ids: project.industryTagIds,
      status: project.status,
      started_at: project.startedAt,
      due_at: project.dueAt,
      completed_at: project.completedAt,
      specimen_count: project.specimenCount,
      test_count: project.testCount,
      pm_id: project.pmId,
      lead_engineer_id: project.leadEngineerId,
      description: project.description,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      created_by: project.createdBy,
      updated_by: project.updatedBy,
    };
  },

  toCreateDTO(input: CreateProjectInput): CreateProjectDTO {
    return {
      title: input.title,
      customer_id: input.customerId,
      industry_tag_ids: input.industryTagIds,
      due_at: input.dueAt ?? null,
      pm_id: input.pmId,
      lead_engineer_id: input.leadEngineerId,
      description: input.description ?? null,
    };
  },

  toUpdateDTO(input: UpdateProjectInput): UpdateProjectDTO {
    const dto: UpdateProjectDTO = {};
    if (input.title !== undefined) dto.title = input.title;
    if (input.status !== undefined) dto.status = input.status;
    if (input.dueAt !== undefined) dto.due_at = input.dueAt;
    if (input.description !== undefined) dto.description = input.description;
    if (input.industryTagIds !== undefined) dto.industry_tag_ids = input.industryTagIds;
    if (input.pmId !== undefined) dto.pm_id = input.pmId;
    if (input.leadEngineerId !== undefined) dto.lead_engineer_id = input.leadEngineerId;
    return dto;
  },

  queryToParams(query: ProjectQuery): Record<string, string> {
    const params: Record<string, string> = {};
    if (query.filter?.status?.length) {
      params.status = query.filter.status.join(',');
    }
    if (query.filter?.customerId) {
      params.customer_id = query.filter.customerId;
    }
    if (query.filter?.industryTagIds?.length) {
      params.industry_tag_ids = query.filter.industryTagIds.join(',');
    }
    if (query.filter?.dueBefore) {
      params.due_before = query.filter.dueBefore;
    }
    if (query.filter?.search) {
      params.search = query.filter.search;
    }
    if (query.sort) {
      params.sort = `${query.sort.field}:${query.sort.order}`;
    }
    if (query.page !== undefined) params.page = String(query.page);
    if (query.pageSize !== undefined) params.page_size = String(query.pageSize);
    return params;
  },
};
