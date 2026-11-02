import { z } from 'zod';
import { USER_ROLES } from '@real-estate-crm/shared-types';
import { normalizedEmailSchema } from '../common/emailSchema.js';

export const userRoleSchema = z.enum(USER_ROLES);

export const userSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: normalizedEmailSchema,
  role: userRoleSchema,
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createUserSchema = z.strictObject({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: normalizedEmailSchema,
  password: z.string().min(12).max(128),
  role: userRoleSchema,
});
