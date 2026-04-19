import type { Customer, ID, Material, Paginated, Standard } from '@/domain/types';

export interface MaterialFilter {
  category?: string;
  search?: string;
}

export interface MaterialRepository {
  list(filter?: MaterialFilter): Promise<Material[]>;
  findById(id: ID): Promise<Material | null>;
}

export interface StandardFilter {
  org?: string;
  search?: string;
}

export interface StandardRepository {
  list(filter?: StandardFilter): Promise<Standard[]>;
  findById(id: ID): Promise<Standard | null>;
}

export interface CustomerRepository {
  list(): Promise<Paginated<Customer>>;
  findById(id: ID): Promise<Customer | null>;
}
