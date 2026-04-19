import type { ID, Timestamps } from './common';

export type MaterialCategory =
  | 'steel'
  | 'stainless'
  | 'aluminum'
  | 'titanium'
  | 'nickel_alloy'
  | 'copper'
  | 'polymer'
  | 'composite'
  | 'ceramic'
  | 'other';

export interface CompositionElement {
  element: string; // "Fe", "Cr", "Ni"
  wtPercent: number;
  tolerance?: number;
}

export interface MaterialProperties {
  density?: number; // g/cm³
  meltingPoint?: number; // ℃
  youngsModulus?: number; // GPa
  yieldStrength?: number; // MPa
}

export interface Material extends Timestamps {
  id: ID;
  designation: string; // "SUS304"
  category: MaterialCategory;
  composition: CompositionElement[];
  standardRefs: ID[];
  properties: MaterialProperties;
  description: string | null;
}
