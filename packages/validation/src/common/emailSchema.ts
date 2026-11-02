import { z } from 'zod';

export const normalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());
