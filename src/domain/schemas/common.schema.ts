import { z } from 'zod';

export const IdSchema = z.string().min(1);
// 形式 (YYYY-MM-DD) と日付の実在性まで Zod 組み込みで検証する。
// 手書き regex と違い 2026-13-99 や 2026-02-30 のような不正値も拒否される。
export const ISODateSchema = z.iso.date();
// ISO 8601 日時 (例: 2026-04-17T10:30:00+09:00)。タイムゾーンは Z または ±HH:mm 必須。
export const ISODateTimeSchema = z.iso.datetime({ offset: true });

export const TimestampsSchema = z.object({
  createdAt: ISODateTimeSchema,
  updatedAt: ISODateTimeSchema,
});

export const AuditInfoSchema = TimestampsSchema.extend({
  createdBy: IdSchema,
  updatedBy: IdSchema,
});

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const paginatedOf = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });
