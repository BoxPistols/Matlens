import { z } from 'zod';
import { AuditInfoSchema, IdSchema, ISODateTimeSchema } from './common.schema';

export const ToolTypeSchema = z.enum([
  'end_mill',
  'face_mill',
  'ball_mill',
  'insert_turning',
  'insert_milling',
  'drill',
  'reamer',
  'tap',
]);

export const ToolMaterialSchema = z.enum([
  'HSS',
  'carbide',
  'coated_carbide',
  'cermet',
  'ceramic',
  'CBN',
  'PCD',
]);

export const CoolantTypeSchema = z.enum(['dry', 'flood', 'mist', 'MQL', 'cryogenic']);

export const MachiningOperationSchema = z.enum([
  'turning',
  'milling_face',
  'milling_peripheral',
  'milling_5axis',
  'drilling',
  'boring',
  'reaming',
  'tapping',
  'grinding',
]);

export const ToolSchema = AuditInfoSchema.extend({
  id: IdSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  nameEn: z.string().min(1),
  type: ToolTypeSchema,
  material: ToolMaterialSchema,
  coating: z.string().nullable(),
  diameter: z.number().positive(),
  fluteCount: z.number().int().positive().nullable(),
  rakeAngle: z.number().nullable(),
  reliefAngle: z.number().nullable(),
  helixAngle: z.number().nullable(),
  cornerRadius: z.number().nullable(),
  maxDepthOfCut: z.number().positive().nullable(),
  applicableMaterials: z.array(IdSchema),
  vendor: z.string().nullable(),
  description: z.string().nullable(),
});

export const CuttingConditionSchema = z.object({
  cuttingSpeed: z.number().nonnegative(),
  feed: z.number().nonnegative(),
  feedUnit: z.enum(['mm/rev', 'mm/tooth', 'mm/min']),
  depthOfCut: z.number().nonnegative(),
  widthOfCut: z.number().nonnegative().nullable(),
  spindleSpeed: z.number().nonnegative(),
  coolant: CoolantTypeSchema,
  notes: z.string().nullable(),
});

export const WaveformSampleSchema = z.object({
  id: IdSchema,
  processId: IdSchema,
  channel: z.enum([
    'force_x',
    'force_y',
    'force_z',
    'vibration',
    'acoustic',
    'temperature',
  ]),
  unit: z.string(),
  sampleRateHz: z.number().positive(),
  values: z.array(z.number()),
  startedAt: ISODateTimeSchema,
});

export const CuttingProcessSchema = AuditInfoSchema.extend({
  id: IdSchema,
  code: z.string().min(1),
  specimenId: IdSchema.nullable(),
  materialId: IdSchema,
  toolId: IdSchema,
  operation: MachiningOperationSchema,
  condition: CuttingConditionSchema,
  machiningTimeSec: z.number().nonnegative(),
  cuttingDistanceMm: z.number().nonnegative(),
  surfaceRoughnessRa: z.number().nonnegative().nullable(),
  toolWearVB: z.number().nonnegative().nullable(),
  chatterDetected: z.boolean().nullable(),
  cuttingForceFc: z.number().nonnegative().nullable(),
  cuttingTemperatureC: z.number().nullable(),
  waveformIds: z.array(IdSchema),
  operatorId: IdSchema,
  machine: z.string().nullable(),
  performedAt: ISODateTimeSchema,
  notes: z.string().nullable(),
});
