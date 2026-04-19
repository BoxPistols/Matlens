// 共通型（ID / 日時 / ページング）

export type ID = string;
export type ISODate = string; // 2026-04-17
export type ISODateTime = string; // 2026-04-17T10:30:00+09:00

export interface Timestamps {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface AuditInfo extends Timestamps {
  createdBy: ID;
  updatedBy: ID;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface SortOption<T> {
  field: keyof T & string;
  order: 'asc' | 'desc';
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
