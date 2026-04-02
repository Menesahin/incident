import { z } from 'zod';
import { SERVICE_LIST } from '@/shared/constants';

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const statusEnum = z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED']);
const serviceEnum = z.enum(SERVICE_LIST);

export const createIncidentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  description: z.string().optional(),
  service: serviceEnum,
  severity: severityEnum,
});

export const updateIncidentSchema = z.object({
  status: statusEnum.optional(),
  severity: severityEnum.optional(),
  description: z.string().optional(),
  version: z.number(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
