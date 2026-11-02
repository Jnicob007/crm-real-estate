import type { UserRole } from '@real-estate-crm/shared-types';

export interface UserIdentity {
  id: string;
  companyId: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserCredentials extends UserIdentity {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

export interface CreatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface CreateUserRecord {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface UserRepository {
  findCredentials(companyId: string, email: string): Promise<UserCredentials | null>;
  findIdentityById(userId: string): Promise<UserIdentity | null>;
  companyExists(companyId: string): Promise<boolean>;
  create(data: CreateUserRecord): Promise<CreatedUser>;
}
