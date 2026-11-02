import type { EntityId, ISODateTime } from '../common/identifiers.js';
import type { UserRole } from './roles.js';

/** Public user contract. Credential hashes must never be part of this type. */
export interface User {
  id: EntityId;
  companyId: EntityId;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
