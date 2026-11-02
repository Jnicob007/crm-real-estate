import { z } from 'zod';
import { normalizedEmailSchema } from '../common/emailSchema.js';

export const loginSchema = z.strictObject({
  companyId: z.uuid(),
  email: normalizedEmailSchema,
  password: z.string().min(1).max(128),
});
