import type { AuditInfo, ID, ISODate } from './common';

export type SpecimenShape = 'bar' | 'plate' | 'pipe' | 'block' | 'custom';

export type SpecimenStatus =
  | 'received'
  | 'prepared'
  | 'testing'
  | 'tested'
  | 'stored'
  | 'discarded';

export interface SpecimenDimensions {
  shape: SpecimenShape;
  length?: number; // mm
  width?: number;
  thickness?: number;
  diameter?: number;
  customSpec?: string;
}

export interface SpecimenOrigin {
  parentPart: string | null;
  location: string | null;
  direction: 'L' | 'T' | 'S' | 'custom' | null;
}

export interface Specimen extends AuditInfo {
  id: ID;
  code: string;
  projectId: ID;
  materialId: ID;
  dimensions: SpecimenDimensions;
  cutFrom: SpecimenOrigin;
  receivedAt: ISODate;
  location: string | null;
  status: SpecimenStatus;
  notes: string | null;
}

export interface CreateSpecimenInput {
  code?: string;
  projectId: ID;
  materialId: ID;
  dimensions: SpecimenDimensions;
  cutFrom?: SpecimenOrigin;
  receivedAt: ISODate;
  location?: string;
  notes?: string;
}

export type UpdateSpecimenInput = Partial<Omit<CreateSpecimenInput, 'projectId'>> & {
  status?: SpecimenStatus;
};
