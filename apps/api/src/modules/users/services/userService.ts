import { hasPermission, PERMISSIONS } from '@real-estate-crm/shared-types';
import type { createUserSchema } from '@real-estate-crm/validation';
import type { z } from 'zod';
import type { AuthContext } from '../../../shared/requestContext.js';
import { HttpError } from '../../../shared/httpError.js';
import type { PasswordHasher } from '../../../shared/passwordHasher.js';
import type { CreatedUser, UserRepository } from '../types/userRepository.js';

export type CreateUserInput = z.infer<typeof createUserSchema>;

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async create(actor: AuthContext, input: CreateUserInput): Promise<CreatedUser> {
    if (!hasPermission(actor.role, PERMISSIONS.USERS_CREATE)) {
      throw new HttpError(403, 'FORBIDDEN', 'Brak uprawnień do tworzenia użytkowników.');
    }
    if (!actor.companyId || !(await this.users.companyExists(actor.companyId))) {
      throw new HttpError(403, 'COMPANY_NOT_AVAILABLE', 'Administrator nie ma dostępnej firmy.');
    }

    const passwordHash = await this.hasher.hash(input.password);
    return this.users.create({
      companyId: actor.companyId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role,
    });
  }
}
