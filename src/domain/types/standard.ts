import type { ID } from './common';

export type StandardOrg = 'JIS' | 'ASTM' | 'ASME' | 'ISO' | 'EN' | 'other';

export interface Standard {
  id: ID;
  code: string; // "JIS G0553"
  org: StandardOrg;
  title: string;
  titleEn: string;
  category: string;
  relatedTestTypeIds: ID[];
  url: string | null;
}
