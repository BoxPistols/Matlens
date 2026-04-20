import { z } from 'zod';
import { AuditInfoSchema, IdSchema, ISODateSchema } from './common.schema';

export const ReportStatusSchema = z.enum([
  'draft',
  'review',
  'approved',
  'issued',
  'archived',
]);

export const ReportKindSchema = z.enum([
  'test_report',
  'damage_analysis',
  'material_certification',
  'inspection',
  'summary',
]);

export const ReportSchema = AuditInfoSchema.extend({
  id: IdSchema,
  code: z.string().min(1),
  title: z.string().min(1),
  titleEn: z.string(),
  kind: ReportKindSchema,
  status: ReportStatusSchema,
  projectId: IdSchema.nullable(),
  testIds: z.array(IdSchema),
  specimenIds: z.array(IdSchema),
  damageIds: z.array(IdSchema),
  issuedAt: ISODateSchema.nullable(),
  authorId: IdSchema,
  reviewerId: IdSchema.nullable(),
  approverId: IdSchema.nullable(),
  body: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
});
