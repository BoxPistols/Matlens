import { z } from 'zod';
import { AuditInfoSchema, IdSchema, ISODateSchema } from './common.schema';

export const ProjectStatusSchema = z.enum([
  'inquiry',
  'quoting',
  'in_progress',
  'reviewing',
  'completed',
  'archived',
]);

export const ProjectSchema = AuditInfoSchema.extend({
  id: IdSchema,
  code: z.string().regex(/^IIC-\d{4}-\d{4}$/),
  title: z.string().min(1).max(200),
  customerId: IdSchema,
  industryTagIds: z.array(IdSchema),
  status: ProjectStatusSchema,
  startedAt: ISODateSchema,
  dueAt: ISODateSchema.nullable(),
  completedAt: ISODateSchema.nullable(),
  specimenCount: z.number().int().nonnegative(),
  testCount: z.number().int().nonnegative(),
  pmId: IdSchema,
  leadEngineerId: IdSchema,
  description: z.string().nullable(),
});

export const CreateProjectInputSchema = z.object({
  title: z.string().min(1).max(200),
  customerId: IdSchema,
  industryTagIds: z.array(IdSchema),
  dueAt: ISODateSchema.optional(),
  pmId: IdSchema,
  leadEngineerId: IdSchema,
  description: z.string().optional(),
});

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial()
  .omit({ customerId: true })
  .extend({
    status: ProjectStatusSchema.optional(),
  });
