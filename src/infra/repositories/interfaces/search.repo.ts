import type { ID } from '@/domain/types';

export type SearchEntityType = 'report' | 'damage' | 'material' | 'project';

export interface SearchQuery {
  query: string;
  entityTypes?: SearchEntityType[];
  filter?: Record<string, unknown>;
  limit?: number;
}

export interface SearchHit {
  entityType: SearchEntityType;
  entityId: ID;
  title: string;
  snippet: string;
  score: number;
  highlights: string[];
}

export interface SearchRepository {
  semantic(query: SearchQuery): Promise<SearchHit[]>;
  similarImages(imageUrl: string, limit?: number): Promise<SearchHit[]>;
  suggestions(partialQuery: string): Promise<string[]>;
}
