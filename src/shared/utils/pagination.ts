import type { Paginated, Pagination } from '@/domain/types';

export const paginate = <T>(items: T[], page = 1, pageSize = 20): Paginated<T> => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  const pagination: Pagination = {
    page: current,
    pageSize,
    total,
    totalPages,
  };
  return { items: slice, pagination };
};
