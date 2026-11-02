import { z } from 'zod';

export const companySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(200),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
