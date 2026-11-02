import type { UserRole } from '@real-estate-crm/shared-types';

export interface AuthContext {
  userId: string;
  companyId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
