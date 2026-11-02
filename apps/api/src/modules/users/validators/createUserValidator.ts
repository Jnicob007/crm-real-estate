import { createUserSchema } from '@real-estate-crm/validation';

export function parseCreateUserInput(body: unknown) {
  return createUserSchema.parse(body);
}
