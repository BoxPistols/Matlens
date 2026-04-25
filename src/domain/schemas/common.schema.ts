import { z } from 'zod';

export const IdSchema = z.string().min(1);
// YYYY-MM-DD
export const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
// YYYY-MM-DDTHH:mm:ss(.sss)?(Z|±HH:mm) — 例: 2026-04-17T10:30:00+09:00
export const ISODateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/);

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
