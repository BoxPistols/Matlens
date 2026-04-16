import { z } from 'zod';

export const IdSchema = z.string().min(1);
export const ISODateSchema = z.string();
export const ISODateTimeSchema = z.string();

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
