import type { AuditInfo, ID, ISODateTime } from './common';

export type TestStatus = 'scheduled' | 'running' | 'completed' | 'failed' | 'invalidated';

export type AtmosphereType = 'air' | 'inert' | 'vacuum' | 'corrosive' | 'custom';

export type TestCategory =
  | 'mechanical'
  | 'chemical'
  | 'metallographic'
  | 'thermal'
  | 'corrosion'
  | 'non_destructive'
  | 'environmental';

export interface TestCondition {
  temperature: { value: number; unit: 'C' | 'K' };
  atmosphere: AtmosphereType;
  atmosphereDetail?: string;
  loadRate?: number;
  frequency?: number; // Hz
  duration?: number; // s
  cycles?: number;
  customParams?: Record<string, string>;
}

export interface ResultMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  uncertainty?: number;
}

export interface Observation {
  id: ID;
  type: 'image' | 'note' | 'waveform';
  content: string;
  capturedAt: ISODateTime;
  tags: string[];
}

export interface RawDataRef {
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: ISODateTime;
}

export interface TestType {
  id: ID;
  name: string;
  nameEn: string;
  category: TestCategory;
  defaultStandardIds: ID[];
  iconKey: string;
  description: string;
}

export interface Test extends AuditInfo {
  id: ID;
  specimenId: ID;
  testTypeId: ID;
  condition: TestCondition;
  standardIds: ID[];
  performedAt: ISODateTime;
  operatorId: ID;
  equipmentId: ID | null;
  status: TestStatus;
  resultMetrics: ResultMetric[];
  rawDataRefs: RawDataRef[];
  observations: Observation[];
}

export interface CreateTestInput {
  specimenId: ID;
  testTypeId: ID;
  condition: TestCondition;
  standardIds: ID[];
  performedAt: ISODateTime;
  operatorId: ID;
  equipmentId?: ID;
}

export type UpdateTestInput = Partial<Omit<CreateTestInput, 'specimenId' | 'testTypeId'>> & {
  status?: TestStatus;
  resultMetrics?: ResultMetric[];
  observations?: Observation[];
};
