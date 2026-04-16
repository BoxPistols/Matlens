import type { AuditInfo, ID } from './common';

export type DamageType =
  | 'fatigue'
  | 'creep'
  | 'corrosion'
  | 'stress_corrosion'
  | 'brittle_fracture'
  | 'ductile_fracture'
  | 'wear'
  | 'thermal';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface DamageFinding extends AuditInfo {
  id: ID;
  reportId: ID;
  testId: ID | null;
  type: DamageType;
  location: string;
  rootCauseHypothesis: string;
  confidenceLevel: ConfidenceLevel;
  images: string[];
  similarCaseIds: ID[];
  tags: string[];
}
