import { z } from 'zod';
import { TASK_STATUSES } from '@real-estate-crm/shared-types';

export const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().nullable(),
  status: taskStatusSchema,
  createdById: z.uuid(),
  assignedToId: z.uuid().nullable(),
  dueDate: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
