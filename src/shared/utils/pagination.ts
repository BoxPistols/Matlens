import type { Paginated, Pagination } from '@/domain/types';

const toPositiveInt = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  const floored = Math.floor(value);
  return floored > 0 ? floored : fallback;
};

export const paginate = <T>(items: T[], page = 1, pageSize = 20): Paginated<T> => {
  const safePageSize = toPositiveInt(pageSize, 20);
  const safePage = toPositiveInt(page, 1);
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize);
  const current = totalPages === 0 ? 1 : Math.min(safePage, totalPages);
  const start = totalPages === 0 ? 0 : (current - 1) * safePageSize;
  const slice = items.slice(start, start + safePageSize);
  const pagination: Pagination = {
    page: current,
    pageSize: safePageSize,
    total,
    totalPages,
  };
  return { items: slice, pagination };
};
