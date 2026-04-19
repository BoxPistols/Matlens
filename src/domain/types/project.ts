import type { AuditInfo, ID, ISODate } from './common';

export type ProjectStatus =
  | 'inquiry'
  | 'quoting'
  | 'in_progress'
  | 'reviewing'
  | 'completed'
  | 'archived';

export interface Project extends AuditInfo {
  id: ID;
  code: string; // "IIC-2026-0412"
  title: string;
  customerId: ID;
  industryTagIds: ID[];
  status: ProjectStatus;
  startedAt: ISODate;
  dueAt: ISODate | null;
  completedAt: ISODate | null;
  specimenCount: number;
  testCount: number;
  pmId: ID;
  leadEngineerId: ID;
  description: string | null;
}

export interface CreateProjectInput {
  title: string;
  customerId: ID;
  industryTagIds: ID[];
  dueAt?: ISODate;
  pmId: ID;
  leadEngineerId: ID;
  description?: string;
}

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, 'customerId'>> & {
  status?: ProjectStatus;
};
